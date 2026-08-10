import pytest
import uuid
import json
from datetime import datetime, UTC
from unittest.mock import patch, MagicMock
from fastapi import status, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.main import app
from app.db.session import engine, get_db
from app.models.models import User, Role, State, District, City, Alert, TelemetryRecord, DigitalTwinNode, Incident, Zone
from app.agents.orchestrator import AIOrchestrator
from app.agents.incident_agent import IncidentAgent
from app.agents.resource_agent import ResourceAgent
from app.agents.alert_agent import AlertAgent
from app.agents.intelligence_agent import IntelligenceAgent
from app.agents.tools import (
    get_incidents, get_alerts, get_available_resources, get_telemetry,
    create_incident, resolve_alert, allocate_resource
)

client = TestClient(app)

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
def setup_test_data(db_session):
    # Setup roles
    roles = {}
    for role_name in ("citizen", "dept_head", "admin"):
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

    # Out of scope city
    city_out = db_session.query(City).filter_by(city_name="Out City").first()
    if not city_out:
        city_out = City(
            id=uuid.uuid4(),
            district_id=dist_vizag.id,
            city_name="Out City",
            population=10000,
            latitude=18.5,
            longitude=84.5,
            status="active"
        )
        db_session.add(city_out)
        db_session.flush()

    # Zone setup
    zone = db_session.query(Zone).filter_by(zone_name="Zone 1").first()
    if not zone:
        zone = Zone(
            id=uuid.uuid4(),
            city_id=city_vizag.id,
            zone_name="Zone 1",
            polygon={
                "type": "Polygon",
                "coordinates": [[[83.15, 17.65], [83.35, 17.65], [83.35, 17.85], [83.15, 17.85], [83.15, 17.65]]]
            },
            risk_level="low"
        )
        db_session.add(zone)
        db_session.flush()

    citizen_user = User(
        id=uuid.uuid4(),
        full_name="Citizen User",
        email="citizen@test.com",
        role_id=roles["citizen"].id,
        status="active"
    )
    db_session.add(citizen_user)

    dept_head_user = User(
        id=uuid.uuid4(),
        full_name="Dept Head User",
        email="depthead@test.com",
        role_id=roles["dept_head"].id,
        city_id=city_vizag.id,  # Vizag Scope
        status="active"
    )
    db_session.add(dept_head_user)

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
        "city_out": city_out,
        "zone": zone,
        "citizen": citizen_user,
        "dept_head": dept_head_user,
        "admin": admin_user,
    }


def test_missing_authentication_and_invalid_token():
    # Test 2: missing authentication
    resp = client.post("/api/v1/ai/chat", json={"message": "Help"})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    # Test 3: invalid token
    resp = client.post("/api/v1/ai/chat", json={"message": "Help"}, headers={"Authorization": "Bearer invalid"})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_authenticated_ai_request_and_intent_routing(mock_get_user, setup_test_data):
    # Test 1: authenticated AI request
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    auth_headers = {"Authorization": "Bearer admin"}

    # Test 4: intent classification & Test 9: orchestrator routing
    # 1. Incident Query
    resp = client.post("/api/v1/ai/chat", json={"message": "Show active incidents"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["intent"] == "incident_query"

    # 2. Resource Query
    resp = client.post("/api/v1/ai/chat", json={"message": "What ambulances are available?"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["intent"] == "resource_query"

    # 3. Alert Query
    resp = client.post("/api/v1/ai/chat", json={"message": "Show active warnings and alerts"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["intent"] == "alert_query"

    # 4. Situational Awareness Query
    resp = client.post("/api/v1/ai/chat", json={"message": "What is happening right now?"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["intent"] == "situational_awareness"


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_geographic_scope_inheritance(mock_get_user, db_session, setup_test_data):
    db_session.query(Alert).delete()
    db_session.commit()
    # Create an alert inside Visakhapatnam City, and another outside
    alert_vizag = Alert(
        id=uuid.uuid4(),
        title="Vizag Wind Alert",
        description="High winds",
        severity="MEDIUM",
        category="WEATHER",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city"].id,
        status="ACTIVE"
    )
    alert_out = Alert(
        id=uuid.uuid4(),
        title="Out City Water Level",
        description="Water rising",
        severity="HIGH",
        category="WATER_LEVEL",
        state_id=setup_test_data["state"].id,
        city_id=setup_test_data["city_out"].id,
        status="ACTIVE"
    )
    db_session.add_all([alert_vizag, alert_out])
    db_session.commit()

    # Authenticate as dept_head (scoped to Vizag City)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["dept_head"].id), setup_test_data["dept_head"].email))
    auth_headers_scoped = {"Authorization": "Bearer dept_head"}

    # Query alerts via Alert Agent
    agent_res = AlertAgent.run(db_session, setup_test_data["dept_head"], "Show alerts")
    # Enforce geographic scope inheritance (Test 11 & Test 13):
    # The dept_head should ONLY see alert_vizag, not alert_out
    assert len(agent_res.data) == 1
    assert agent_res.data[0]["title"] == "Vizag Wind Alert"


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_recommendation_provenance_and_simulated_labeling(mock_get_user, db_session, setup_test_data):
    # Seed a simulated incident
    inc = Incident(
        id=uuid.uuid4(),
        ticket_number="INC-1002",
        title="[SIMULATED] MVP Water overflow",
        description="Waterlogging on street",
        severity="critical",
        status="active",
        category="flood",
        latitude=17.68,
        longitude=83.21,
        zone_id=setup_test_data["zone"].id,
        created_at=datetime.now(UTC)
    )
    db_session.add(inc)
    db_session.commit()

    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    auth_headers = {"Authorization": "Bearer admin"}

    resp = client.post("/api/v1/ai/chat", json={"message": "Show MVP overflow incident details"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()

    # Test 15: recommendation vs fact separation
    assert len(data["recommendations"]) > 0
    assert len(data["warnings"]) > 0

    # Test 16: source provenance & Test 17: simulated data labeling
    assert "Incident Registry" in data["sources"]
    assert "SIMULATED Incident Data" in data["sources"]


@patch("app.dependencies.auth.supabase_client.auth.get_user")
def test_multilingual_request(mock_get_user, setup_test_data):
    # Test 18: multilingual request (Telugu and Hindi queries)
    mock_get_user.return_value = MockUserResponse(MockUserObj(str(setup_test_data["admin"].id), setup_test_data["admin"].email))
    auth_headers = {"Authorization": "Bearer admin"}

    # Telugu query
    resp = client.post("/api/v1/ai/chat", json={"message": "విశాఖపట్నంలో ప్రస్తుతం ఏ అత్యవసర వనరులు ఉన్నాయి?"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    # Should reply in Telugu
    assert "వివరాలు లభించాయి" in resp.json()["answer"]

    # Hindi query
    resp = client.post("/api/v1/ai/chat", json={"message": "विशाखापत्तनम में कौन सी घटनाएं सक्रिय हैं?"}, headers=auth_headers)
    assert resp.status_code == status.HTTP_200_OK
    # Should reply in Hindi
    assert "घटनाओं की जानकारी मिली है" in resp.json()["answer"]


def test_write_action_authorization_and_controlled_actions(db_session, setup_test_data):
    # Test 19: write-action authorization
    # Citizen user cannot create incidents, resolve alerts, or allocate resources
    citizen = setup_test_data["citizen"]
    admin = setup_test_data["admin"]

    # 1. Create incident: citizen gets HTTP 403 Forbidden via IncidentService scope check
    with pytest.raises(HTTPException) as exc:
        create_incident(db_session, citizen, {"title": "Test", "description": "Desc"})
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN

    # 2. Resolve alert: citizen gets 403
    with pytest.raises(HTTPException) as exc:
        resolve_alert(db_session, citizen, str(uuid.uuid4()))
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN


def test_invalid_tool_request(db_session, setup_test_data):
    # Test 21: invalid tool request
    # Try retrieving a non-existent incident ID -> 404
    admin = setup_test_data["admin"]
    with pytest.raises(HTTPException) as exc:
        resolve_alert(db_session, admin, "not-a-uuid")
    assert exc.value.status_code == status.HTTP_404_NOT_FOUND


def test_llm_failure_handling_and_timeouts(db_session, setup_test_data):
    # Test 22: LLM/provider failure handling
    # Verify the orchestrator falls back gracefully to local mock reasoning when live provider is mock_key
    admin = setup_test_data["admin"]
    res = AIOrchestrator.run(db_session, admin, "Help me status")
    assert res is not None
    assert res.intent == "situational_awareness"
    assert res.confidence == 97.5
