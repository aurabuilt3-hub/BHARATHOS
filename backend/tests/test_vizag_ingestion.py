import pytest
import uuid
import json
from datetime import datetime, UTC
from unittest.mock import patch, MagicMock
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import engine, get_db
from app.models.models import User, Role, State, District, City, Facility
from app.data_sources.source_registry import SOURCE_REGISTRY
from app.ingestion.models import NormalizedFacility
from app.ingestion.normalizer import FacilityNormalizer
from app.ingestion.validator import FacilityValidator
from app.ingestion.deduplicator import FacilityDeduplicator, haversine_distance
from app.ingestion.importer import run_ingestion

client = TestClient(app)

# Helper mock structures for Supabase Auth
class MockUserObj:
    def __init__(self, id_str, email):
        self.id = id_str
        self.email = email

class MockUserResponse:
    def __init__(self, user_obj):
        self.user = user_obj

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = Session(bind=connection)
    
    yield SessionLocal
    
    SessionLocal.close()
    if transaction.is_active:
        transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def override_db(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture
def setup_test_geo(db_session):
    # Ensure roles exist
    roles = {}
    for role_name in ("citizen", "admin"):
        r = db_session.query(Role).filter(Role.role_name == role_name).first()
        if not r:
            r = Role(id=uuid.uuid4(), role_name=role_name)
            db_session.add(r)
        roles[role_name] = r
    db_session.flush()

    # Geography Setup
    state_ap = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state_ap:
        state_ap = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state_ap)
        db_session.flush()

    dist_vizag = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist_vizag:
        dist_vizag = District(id=uuid.uuid4(), state_id=state_ap.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist_vizag)
        db_session.flush()

    city_vizag = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city_vizag:
        city_vizag = City(
            id=uuid.uuid4(),
            district_id=dist_vizag.id,
            city_name="Visakhapatnam",
            population=1500000,
            latitude=17.68,
            longitude=83.21,
            status="active"
        )
        db_session.add(city_vizag)
        db_session.flush()

    citizen_user = User(
        id=uuid.uuid4(),
        full_name="Citizen User",
        email="citizen@test.com",
        role_id=roles["citizen"].id,
        status="active"
    )
    db_session.add(citizen_user)

    admin_user = User(
        id=uuid.uuid4(),
        full_name="Admin User",
        email="admin@test.com",
        role_id=roles["admin"].id,
        status="active"
    )
    db_session.add(admin_user)

    db_session.commit()

    return {
        "roles": roles,
        "state": state_ap,
        "district": dist_vizag,
        "city": city_vizag,
        "citizen": citizen_user,
        "admin": admin_user,
    }


def test_source_registry():
    # Test 1: source registry
    assert "openstreetmap_overpass" in SOURCE_REGISTRY
    assert SOURCE_REGISTRY["openstreetmap_overpass"]["source_type"] == "OPEN_DATA"
    assert "ap_govt_directory" in SOURCE_REGISTRY
    assert SOURCE_REGISTRY["ap_govt_directory"]["source_type"] == "OFFICIAL_PUBLIC"


def test_normalization():
    # Test 2: normalization & Test 3: facility type mapping
    raw = {
        "name": "  Gopalapatnam Police Station   ",
        "facility_type": "police",
        "latitude": 17.7,
        "longitude": 83.2,
        "phone": "+91 891 252 0933",
        "address": " Araku-Visakhapatnam Road ",
        "source_type": "OPEN_DATA",
        "source_name": "OpenStreetMap"
    }
    fac = FacilityNormalizer.to_normalized_facility(raw)
    assert fac.name == "Gopalapatnam Police Station"
    assert fac.facility_type == "POLICE_STATION"
    assert fac.phone == "+91 891 252 0933"
    assert fac.address == "Araku-Visakhapatnam Road"


def test_coordinate_validation():
    # Test 4: coordinate validation & Test 9: invalid records & Test 10: missing coordinates
    valid_fac = NormalizedFacility(
        name="Valid Hospital",
        facility_type="HOSPITAL",
        latitude=17.72,
        longitude=83.31,
        source_type="OPEN_DATA",
        source_name="OSM",
        source_url="http://osm.org"
    )
    is_valid, _ = FacilityValidator.validate(valid_fac)
    assert is_valid is True

    # Missing coordinates (zero)
    invalid_coords = NormalizedFacility(
        name="No Coords Hospital",
        facility_type="HOSPITAL",
        latitude=0.0,
        longitude=0.0,
        source_type="OPEN_DATA",
        source_name="OSM",
        source_url="http://osm.org"
    )
    is_valid, _ = FacilityValidator.validate(invalid_coords)
    assert is_valid is False

    # Out of bounding box
    out_of_bounds = NormalizedFacility(
        name="Delhi Hospital",
        facility_type="HOSPITAL",
        latitude=28.61,
        longitude=77.20,
        source_type="OPEN_DATA",
        source_name="OSM",
        source_url="http://osm.org"
    )
    is_valid, _ = FacilityValidator.validate(out_of_bounds)
    assert is_valid is False


def test_duplicate_detection():
    # Test 6: duplicate detection & Test 14: duplicate prevention
    fac1 = NormalizedFacility(
        name="Vizag One PS",
        facility_type="POLICE_STATION",
        latitude=17.711,
        longitude=83.301,
        source_type="OPEN_DATA",
        source_name="OSM",
        source_url="http://osm.org"
    )
    # Coordinate proximity < 100 meters, matching type
    fac2 = NormalizedFacility(
        name="Vizag One Police Station",
        facility_type="POLICE_STATION",
        latitude=17.7112,
        longitude=83.3012,
        source_type="OPEN_DATA",
        source_name="OSM",
        source_url="http://osm.org"
    )
    is_dup, needs_rev = FacilityDeduplicator.are_duplicate_candidates(fac1, fac2)
    assert is_dup is True
    assert needs_rev is False


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_admin_rbac_ingestion_status(mock_get_user, setup_test_geo):
    # Test 12: admin RBAC
    # Citizen user trying to access status endpoint -> 403
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_geo["citizen"].id), setup_test_geo["citizen"].email))
    resp = client.get("/api/v1/admin/data-ingestion/status", headers={"Authorization": "Bearer dummy"})
    assert resp.status_code == status.HTTP_403_FORBIDDEN

    # Admin user accessing status endpoint -> 200
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_geo["admin"].id), setup_test_geo["admin"].email))
    resp = client.get("/api/v1/admin/data-ingestion/status", headers={"Authorization": "Bearer dummy"})
    assert resp.status_code == status.HTTP_200_OK


@patch("app.ingestion.importer.SNAPSHOT_PATH")
def test_pipeline_dry_run_and_idempotency(mock_snapshot_path, db_session, setup_test_geo):
    # Create a small temp snapshot file for testing import
    import tempfile
    import os

    mock_snapshot = [
        {
            "name": "Pipeline Hospital",
            "facility_type": "HOSPITAL",
            "address": "Collector Office Road",
            "phone": None,
            "latitude": 17.71,
            "longitude": 83.30,
            "source_type": "OFFICIAL_PUBLIC",
            "source_name": "AP Health Portal",
            "source_url": "http://health.ap.gov.in",
            "extra_data": {
                "source_record_id": "test_hosp_01"
            }
        }
    ]

    fd, path = tempfile.mkstemp(suffix=".json")
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(mock_snapshot, f)
            
        mock_snapshot_path.replace.side_effect = lambda *args, **kwargs: path
        # Inject replacement directly on standard import target path
        import app.ingestion.importer
        app.ingestion.importer.SNAPSHOT_PATH = path

        # Test 7: dry-run mode
        count_before = db_session.query(Facility).count()
        report = run_ingestion(db_session, dry_run=True)
        assert report["stats"]["inserted"] == 1
        assert report["dry_run"] is True
        
        # Verify no database record was created
        count_after = db_session.query(Facility).count()
        assert count_before == count_after

        # Test 8: idempotent import
        # First Run (dry_run=False)
        report = run_ingestion(db_session, dry_run=False)
        assert report["stats"]["inserted"] == 1
        assert report["dry_run"] is False

        # Verify record in DB and check provenance preservation (Test 11 & Test 5)
        facs = db_session.query(Facility).filter_by(name="Pipeline Hospital").all()
        assert len(facs) == 1
        assert facs[0].source_type == "OFFICIAL_PUBLIC"
        assert facs[0].source_name == "AP Health Portal"
        assert facs[0].extra_data["source_record_id"] == "test_hosp_01"

        # Second Run (idempotency check)
        report = run_ingestion(db_session, dry_run=False)
        assert report["stats"]["inserted"] == 0
        # No extra records added
        facs_after = db_session.query(Facility).filter_by(name="Pipeline Hospital").all()
        assert len(facs_after) == 1

        # Test 13: existing facility update
        # If new snap details are better (e.g. phone changes), verify it updates
        mock_snapshot[0]["phone"] = "54321"
        with open(path, "w") as f:
            json.dump(mock_snapshot, f)
            
        report = run_ingestion(db_session, dry_run=False)
        assert report["stats"]["updated"] == 1
        
        fac_updated = db_session.query(Facility).filter_by(name="Pipeline Hospital").first()
        assert fac_updated.phone == "54321"

    finally:
        os.remove(path)
