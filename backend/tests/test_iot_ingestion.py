import pytest
import uuid
import os
from datetime import datetime
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import engine, get_db
from app.models.models import State, District, City, DigitalTwinNode, TelemetryRecord, Alert, Incident

client = TestClient(app)

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
def setup_node(db_session):
    # Ensure Andhra Pradesh state
    state = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state)
        db_session.flush()

    # District
    dist = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist:
        dist = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist)
        db_session.flush()

    # City
    city = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city:
        city = City(
            id=uuid.uuid4(),
            district_id=dist.id,
            city_name="Visakhapatnam",
            population=1500000,
            latitude=17.68,
            longitude=83.21,
            status="active"
        )
        db_session.add(city)
        db_session.flush()

    # Create DigitalTwinNode
    node = DigitalTwinNode(
        id=uuid.uuid4(),
        state_id=state.id,
        city_id=city.id,
        name="Beach Road Storm Drain Gauge",
        type="sensor",
        status="operational",
        latitude=17.6823,
        longitude=83.2198,
        last_telemetry={}
    )
    db_session.add(node)
    db_session.flush()
    db_session.commit()
    return node

def test_unauthorized_missing_header(setup_node):
    node_id = str(setup_node.id)
    payload = {
        "metric_type": "water_level",
        "value": 1.25,
        "unit": "m"
    }
    response = client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "X-IOT-KEY" in response.json()["detail"]

def test_unauthorized_incorrect_key(setup_node, monkeypatch):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    node_id = str(setup_node.id)
    payload = {
        "metric_type": "water_level",
        "value": 1.25,
        "unit": "m"
    }
    headers = {"X-IOT-KEY": "wrong-key-456"}
    response = client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload, headers=headers)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "X-IOT-KEY" in response.json()["detail"]

def test_authorized_ingestion_normal(setup_node, monkeypatch, db_session):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    node_id = str(setup_node.id)
    payload = {
        "metric_type": "water_level",
        "value": 1.25,
        "unit": "m"
    }
    headers = {"X-IOT-KEY": "correct-key-123"}
    response = client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["status"] == "ok"
    assert data["node_status"] == "normal"
    assert data["alert_generated"] is False

    # Verify storage
    telemetry_record = db_session.query(TelemetryRecord).filter_by(id=uuid.UUID(data["telemetry_id"])).first()
    assert telemetry_record is not None
    assert telemetry_record.value == 1.25
    assert telemetry_record.status == "normal"

    # Verify node last telemetry cache
    node = db_session.get(DigitalTwinNode, setup_node.id)
    assert node.status == "normal"
    assert node.last_telemetry["water_level"] == 1.25
    assert node.last_telemetry["source_type"] == "REAL_IOT"

def test_authorized_ingestion_critical_creates_alert_and_incident(setup_node, monkeypatch, db_session):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    node_id = str(setup_node.id)
    
    # 4.6m breaches CRITICAL alert threshold (>= 4.5m)
    payload = {
        "metric_type": "water_level",
        "value": 4.60,
        "unit": "m"
    }
    headers = {"X-IOT-KEY": "correct-key-123"}
    response = client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["node_status"] == "critical"
    assert data["alert_generated"] is True

    # Verify Alert is created with source=REAL_IOT and no [SIMULATED] prefix
    alert = db_session.query(Alert).filter(Alert.city_id == setup_node.city_id, Alert.source == "REAL_IOT").first()
    assert alert is not None
    assert alert.severity == "CRITICAL"
    assert alert.title.startswith("[REAL IoT]")
    assert "[SIMULATED]" not in alert.title

    # Verify Incident is created automatically
    incident = db_session.query(Incident).filter(Incident.title.contains(setup_node.name)).first()
    assert incident is not None
    assert incident.category == "Flood"
    assert incident.severity == "critical"
    assert incident.status == "active"

def test_incident_deduplication(setup_node, monkeypatch, db_session):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    node_id = str(setup_node.id)
    headers = {"X-IOT-KEY": "correct-key-123"}
    
    # Post first CRITICAL value
    payload_1 = {
        "metric_type": "water_level",
        "value": 4.60,
        "unit": "m"
    }
    client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload_1, headers=headers)
    
    # Post second CRITICAL value
    payload_2 = {
        "metric_type": "water_level",
        "value": 4.70,
        "unit": "m"
    }
    client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload_2, headers=headers)

    # Verify Alert is deduplicated / updated
    alerts_count = db_session.query(Alert).filter(Alert.source == "REAL_IOT").count()
    assert alerts_count == 1

    # Verify Incident is deduplicated (only ONE created)
    incidents_count = db_session.query(Incident).filter(Incident.title.contains(setup_node.name)).count()
    assert incidents_count == 1

def test_node_not_found(monkeypatch):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    fake_node_id = str(uuid.uuid4())
    payload = {
        "metric_type": "water_level",
        "value": 1.25,
        "unit": "m"
    }
    headers = {"X-IOT-KEY": "correct-key-123"}
    response = client.post(f"/api/v1/digital-twin/nodes/{fake_node_id}/telemetry", json=payload, headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_invalid_payload_fields(setup_node, monkeypatch):
    monkeypatch.setenv("IOT_INGESTION_KEY", "correct-key-123")
    node_id = str(setup_node.id)
    headers = {"X-IOT-KEY": "correct-key-123"}
    
    # Missing metric_type
    payload = {
        "value": 1.25,
        "unit": "m"
    }
    response = client.post(f"/api/v1/digital-twin/nodes/{node_id}/telemetry", json=payload, headers=headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
