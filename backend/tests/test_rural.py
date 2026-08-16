import pytest
import uuid
from datetime import datetime
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import engine, get_db
from app.dependencies.auth import get_current_user
from app.models.models import Base, User, Role, HistoricalRainfall
from app.services.rural_flood_service import ingest_historical_rainfall, RuralFloodService
from app.schemas.rural import RuralSimulationRequest

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    # Ensure all tables (including historical_rainfall) exist
    Base.metadata.create_all(bind=engine)
    
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = Session(bind=connection)
    
    yield SessionLocal
    
    SessionLocal.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture
def test_user(db_session):
    # Ensure role exists
    admin_role = db_session.query(Role).filter(Role.role_name == "admin").first()
    if not admin_role:
        admin_role = Role(id=uuid.uuid4(), role_name="admin")
        db_session.add(admin_role)
        db_session.flush()

    user = User(
        id=uuid.uuid4(),
        full_name="Rural Operations Tester",
        email="rural_tester@bharatos.gov.in",
        role_id=admin_role.id,
        status="active"
    )
    db_session.add(user)
    db_session.flush()
    return user

def test_ingestion_and_data_cleaning(db_session):
    """
    Tests that database ingestion correctly removes exact duplicates (reducing rows to 2275),
    normalizes negative numbers, and standardizes district spelling.
    """
    ingest_historical_rainfall(db_session)
    
    # 1. Total records count in database should be 2275 (deduplicated)
    count = db_session.query(HistoricalRainfall).count()
    assert count == 2275
    
    # 2. Spelling check: 'Visakhapatanam' should not exist in the 'district' column
    old_spelling_exists = db_session.query(HistoricalRainfall).filter(HistoricalRainfall.district == "Visakhapatanam").count() > 0
    assert not old_spelling_exists
    
    # 3. Standardized spelling 'Visakhapatnam' should exist in 'district'
    vizag_records = db_session.query(HistoricalRainfall).filter(HistoricalRainfall.district == "Visakhapatnam").all()
    assert len(vizag_records) == 175
    
    # 4. Provenance check: 'original_district' must preserve the source spelling "Visakhapatanam"
    assert all(r.original_district == "Visakhapatanam" for r in vizag_records)
    
    # 5. Negative value check: no records in the table should contain negative rainfall values
    negative_exists = db_session.query(HistoricalRainfall).filter(HistoricalRainfall.avg_rainfall < 0).count() > 0
    assert not negative_exists
    
    # 6. Source type and agency check
    assert all(r.source_type == "HISTORICAL_DATASET" for r in vizag_records)
    assert all(r.agency_name == "NRSC VIC MODEL" for r in vizag_records)

def test_service_baseline_calculations(db_session):
    """
    Tests that baseline statistics (min, max, mean, std, percentiles) are calculated correctly.
    """
    ingest_historical_rainfall(db_session)
    
    summary = RuralFloodService.get_dataset_summary(db_session)
    assert summary["total_records"] == 2275
    assert "Visakhapatnam" in summary["districts"]
    assert summary["agency_name"] == "NRSC VIC MODEL"
    
    baseline = RuralFloodService.get_district_baseline(db_session, "Visakhapatnam")
    assert baseline["district"] == "Visakhapatnam"
    assert baseline["total_records"] == 175
    
    percentiles = baseline["percentiles"]
    assert percentiles["p75"] > 0
    assert percentiles["p90"] > percentiles["p75"]
    assert percentiles["p99"] > percentiles["p90"]
    
    # We should have exactly 6 months of data (months 1 to 6)
    assert len(baseline["monthly_stats"]) == 6
    for m_stat in baseline["monthly_stats"]:
        assert m_stat["month"] in [1, 2, 3, 4, 5, 6]
        assert m_stat["record_count"] > 0
        assert m_stat["avg_rainfall"] >= 0.0
        assert m_stat["max_rainfall"] >= m_stat["avg_rainfall"]
        assert m_stat["std_rainfall"] >= 0.0

def test_scenario_risk_calculations(db_session):
    """
    Tests the deterministic risk calculation boundaries and anomaly detections.
    """
    ingest_historical_rainfall(db_session)
    
    # May (Month 5) historical stats
    baseline = RuralFloodService.get_district_baseline(db_session, "Visakhapatnam")
    percentiles = baseline["percentiles"]
    
    # 1. Test Low Risk boundary (<= p75)
    low_res = RuralFloodService.calculate_scenario_risk(db_session, month=5, scenario_rainfall_mm=percentiles["p75"] - 0.1)
    assert low_res["risk_level"] == "LOW"
    
    # 2. Test Medium Risk boundary (> p75 and <= p90)
    med_res = RuralFloodService.calculate_scenario_risk(db_session, month=5, scenario_rainfall_mm=percentiles["p75"] + 0.1)
    assert med_res["risk_level"] == "MEDIUM"
    
    # 3. Test High Risk boundary (> p90 and <= p99)
    high_res = RuralFloodService.calculate_scenario_risk(db_session, month=5, scenario_rainfall_mm=percentiles["p90"] + 0.1)
    assert high_res["risk_level"] == "HIGH"
    
    # 4. Test Critical Risk boundary (> p99)
    crit_res = RuralFloodService.calculate_scenario_risk(db_session, month=5, scenario_rainfall_mm=percentiles["p99"] + 1.0)
    assert crit_res["risk_level"] == "CRITICAL"
    
    # 5. Verify z-score anomaly calculation
    # Month 1 (January) is extremely dry, so a 10 mm rainfall should yield a massive z-score and is_anomaly=True
    dry_res = RuralFloodService.calculate_scenario_risk(db_session, month=1, scenario_rainfall_mm=10.0)
    assert dry_res["metrics"]["z_score"] > 5.0
    assert dry_res["metrics"]["is_anomaly"] is True
    assert any("exceeds the historical maximum" in d for d in dry_res["risk_drivers"])

def test_api_endpoints(db_session, test_user):
    """
    Tests the baseline and simulate API endpoints.
    """
    ingest_historical_rainfall(db_session)
    
    # Override authentication dependency
    app.dependency_overrides[get_current_user] = lambda: test_user
    
    # 1. Test GET /api/v1/rural/baseline
    response = client.get("/api/v1/rural/baseline")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["district"] == "Visakhapatnam"
    assert data["total_records"] == 175
    assert "percentiles" in data
    assert "monthly_stats" in data
    assert data["agency_name"] == "NRSC VIC MODEL"
    
    # 2. Test POST /api/v1/rural/simulate
    sim_req = {"month": 5, "rainfall_mm": 12.0}
    response = client.post("/api/v1/rural/simulate", json=sim_req)
    assert response.status_code == status.HTTP_200_OK
    sim_data = response.json()
    assert sim_data["location"] == "Visakhapatnam Rural"
    assert sim_data["scenario"]["month"] == 5
    assert sim_data["scenario"]["rainfall_mm"] == 12.0
    assert "risk_level" in sim_data
    assert "metrics" in sim_data
    assert "risk_drivers" in sim_data
    assert "agricultural_impact" in sim_data
    assert "ai_recommendation" in sim_data
    assert sim_data["agency_name"] == "NRSC VIC MODEL"
    
    # Clean up auth override
    app.dependency_overrides.pop(get_current_user, None)
