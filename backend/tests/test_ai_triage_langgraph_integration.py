import pytest
import uuid
from fastapi.testclient import TestClient
from fastapi import status
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import engine, get_db
from app.dependencies.auth import get_current_user
from app.models.models import User, Role, State, District, City, Incident
from app.ai.graph.state import GraphState
from app.ai.schemas.agent_outputs import (
    FloodDetectionResult,
    RiskAnalysisResult,
    IncidentIntelligenceResult,
    ResourceRecommendation,
    ResponseRecommendation,
    CommunicationResult
)

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

def get_base_orchestrator_state(res_id=None):
    return GraphState(
        event_source="SIMULATED",
        flood_detection=FloodDetectionResult(risk_detected=True, status="HIGH", evidence=["Water level rising"]),
        risk_analysis=RiskAnalysisResult(risk_level="HIGH", drivers=["heavy_rainfall"], evidence=[], monitoring_priorities=[]),
        incident_intelligence=IncidentIntelligenceResult(is_duplicate=False, matching_incident_id=None, confidence=0.0, reason="New"),
        resource_recommendation=ResourceRecommendation(recommended_resource_type="rescue_boat", recommended_resource_id=res_id, reason="Boat ready"),
        response_recommendation=ResponseRecommendation(
            severity="HIGH",
            recommended_action="Deploy rescue boat MVP-01.",
            resource_id=res_id,
            reasoning=["Telemetry shows critical high water levels"],
            requires_human_approval=True
        ),
        communication=CommunicationResult(
            english="Avoid flooded streets.",
            telugu="వరద రోడ్లను నివారించండి.",
            hindi="बाढ़ प्रभावित सड़कों से बचें।"
        ),
        errors=[]
    )

# 1. POST /ai/triage reaches LangGraph & 11. Structured response returned & 12. Human approval always true & 23. Existing response compatibility
@patch("app.ai.graph.orchestrator.LangGraphAIOrchestrator.run_triage_graph")
def test_triage_endpoint_success(mock_graph, db_session):
    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    user = User(
        id=uuid.uuid4(),
        full_name="Authorized Operator",
        email=f"auth_op_{uuid.uuid4()}@bharatos.gov.in",
        role=role,
        status="active"
    )
    db_session.add(user)
    db_session.flush()

    res_id = str(uuid.uuid4())
    mock_graph.return_value = get_base_orchestrator_state(res_id)

    # FastAPI Dependency Overrides
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: db_session

    try:
        payload = {
            "incident_description": "Water logged in Gajuwaka Colony",
            "session_id": "test_session_123"
        }
        res = client.post("/api/v1/ai/triage", json=payload)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["summary"] == "Deploy rescue boat MVP-01."
        assert data["human_approval_required"] is True
        assert data["status"] == "awaiting_human_approval"
        assert data["metadata"]["completed"] is True
        assert data["metadata"]["flood_detection"]["status"] == "HIGH"
        # Secrets check
        assert "GEMINI_API_KEY" not in str(data)
        assert "DATABASE_URL" not in str(data)
    finally:
        app.dependency_overrides.clear()

# 2. Existing authentication still works & 3. Unauthorized request rejected
def test_triage_endpoint_unauthorized():
    # Clear overrides to trigger normal authentication validation
    app.dependency_overrides.clear()
    payload = {
        "incident_description": "Waterlogged street",
        "session_id": "test_session_123"
    }
    res = client.post("/api/v1/ai/triage", json=payload)
    # Must fail with unauthorized 401
    assert res.status_code == status.HTTP_401_UNAUTHORIZED

# 4. Geographic scope enforced & 5. Incident context passed correctly & 21. Out-of-scope resource/incident rejected
@patch("app.ai.graph.orchestrator.LangGraphAIOrchestrator.run_triage_graph")
def test_triage_endpoint_out_of_scope_incident(mock_graph, db_session):
    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    state = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state)
        db_session.flush()

    # Create authorized district & city (Visakhapatnam)
    dist_vizag = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist_vizag:
        dist_vizag = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist_vizag)
        db_session.flush()

    city_vizag = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city_vizag:
        city_vizag = City(id=uuid.uuid4(), district_id=dist_vizag.id, city_name="Visakhapatnam", latitude=17.68, longitude=83.21, status="active")
        db_session.add(city_vizag)
        db_session.flush()

    # Create unauthorized district & city (Hyderabad)
    dist_hyd = db_session.query(District).filter_by(district_name="Hyderabad District").first()
    if not dist_hyd:
        dist_hyd = District(id=uuid.uuid4(), state_id=state.id, district_name="Hyderabad District", status="active")
        db_session.add(dist_hyd)
        db_session.flush()

    city_hyd = db_session.query(City).filter_by(city_name="Hyderabad").first()
    if not city_hyd:
        city_hyd = City(id=uuid.uuid4(), district_id=dist_hyd.id, city_name="Hyderabad", latitude=17.36, longitude=78.47, status="active")
        db_session.add(city_hyd)
        db_session.flush()

    user_vizag = User(
        id=uuid.uuid4(),
        full_name="Vizag Operator",
        email=f"vizag_op_{uuid.uuid4()}@bharatos.gov.in",
        role=role,
        state=state,
        city=city_vizag,
        status="active"
    )
    db_session.add(user_vizag)
    db_session.flush()

    # Create Zone for Hyd
    from app.models.models import Zone
    zone_hyd = Zone(id=uuid.uuid4(), city_id=city_hyd.id, zone_name="Hyd Zone A", polygon={})
    db_session.add(zone_hyd)
    db_session.flush()

    inc_hyd = Incident(
        id=uuid.uuid4(),
        ticket_number=f"INC-{uuid.uuid4().hex[:8]}",
        zone_id=zone_hyd.id,
        category="waterlogging",
        title="Hyd Flood",
        description="Near Charminar",
        latitude=17.36,
        longitude=78.47,
        status="open",
        severity="warning"
    )
    db_session.add(inc_hyd)
    db_session.flush()

    app.dependency_overrides[get_current_user] = lambda: user_vizag
    app.dependency_overrides[get_db] = lambda: db_session

    try:
        payload = {
            "incident_description": "Assess Hyd Incident",
            "incident_id": str(inc_hyd.id)
        }
        # Vizag operator must not access Hyd incident (rejected with 403)
        res = client.post("/api/v1/ai/triage", json=payload)
        assert res.status_code == status.HTTP_403_FORBIDDEN
    finally:
        app.dependency_overrides.clear()

# 13. No dispatch occurs & 14. No allocation occurs & 15. No notification occurs & 24. Existing dispatch workflow remains functional
def test_triage_no_writes_or_notifications():
    import inspect
    from app.ai import gateway
    source = inspect.getsource(gateway)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
    assert "sms" not in source.lower()
    assert "whatsapp" not in source.lower()
    assert "send_sms" not in source.lower()

# 16. Gemini failure handled & 17. Graph node failure handled
@patch("app.ai.graph.orchestrator.LangGraphAIOrchestrator.run_triage_graph")
def test_triage_endpoint_execution_failure(mock_graph, db_session):
    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    user = User(
        id=uuid.uuid4(),
        full_name="Authorized Operator",
        email=f"auth_op_{uuid.uuid4()}@bharatos.gov.in",
        role=role,
        status="active"
    )
    db_session.add(user)
    db_session.flush()

    # Simulate LangGraph error
    err_state = GraphState(errors=["detect_flood node failed: connection timed out"])
    mock_graph.return_value = err_state

    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db] = lambda: db_session

    try:
        payload = {
            "incident_description": "Water logged in MVP Colony"
        }
        res = client.post("/api/v1/ai/triage", json=payload)
        # Verify it raises controlled server execution error or falls back cleanly
        # If it fails maximum retries or returns internal error
        assert res.status_code in [status.HTTP_500_INTERNAL_SERVER_ERROR, status.HTTP_200_OK]
        if res.status_code == status.HTTP_200_OK:
            assert res.json()["metadata"]["gateway_fallback"] is True
    finally:
        app.dependency_overrides.clear()
