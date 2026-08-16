import pytest
import uuid
from unittest.mock import MagicMock, patch
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.db.session import engine

from app.ai.agents.response_advisor_agent import ResponseAdvisorAgent
from app.ai.schemas.agent_outputs import ResponseRecommendation
from app.models.models import User, Role, State, District, City, Resource
from app.ai.graph.tools import create_agent_tools

# Mock helper to override get_ai_config settings
def get_mock_config(key="real_key_for_test"):
    return {
        "model": "gemini-3.6-flash",
        "api_key": key,
        "temperature": 0.2,
        "timeout": 30.0
    }

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

# Helper mock setup
def get_base_upstream(res_id=None):
    return (
        {"risk_detected": True, "status": "HIGH", "evidence": ["Water rising"]},
        {"risk_level": "HIGH", "drivers": ["precipitation"], "evidence": [], "monitoring_priorities": []},
        {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "New location"},
        {"recommended_resource_type": "rescue_boat", "recommended_resource_id": res_id, "reason": "Boat recommended"}
    )

# 1. Normal situation
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_normal(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="NORMAL",
        recommended_action="No active flooding detected. Continue monitoring.",
        resource_id=None,
        reasoning=["All sensors indicate normal water levels."],
        requires_human_approval=True
    )

    fd = {"risk_detected": False, "status": "NORMAL", "evidence": []}
    ra = {"risk_level": "LOW", "drivers": [], "evidence": [], "monitoring_priorities": []}
    ii = {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "No active incidents"}
    rr = {"recommended_resource_type": None, "recommended_resource_id": None, "reason": "No resources needed"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert res.severity == "NORMAL"
    assert res.requires_human_approval is True

# 2. Warning situation
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_warning(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="WARNING",
        recommended_action="Prepare response resources and monitor waterlogging.",
        resource_id=None,
        reasoning=["Precipitation forecast is rising."],
        requires_human_approval=True
    )

    fd = {"risk_detected": True, "status": "WARNING", "evidence": ["Moderate rain"]}
    ra = {"risk_level": "MEDIUM", "drivers": ["precipitation"], "evidence": [], "monitoring_priorities": []}
    ii = {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "New incident"}
    rr = {"recommended_resource_type": None, "recommended_resource_id": None, "reason": "No active dispatch"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert res.severity == "WARNING"

# 3. High-risk situation
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_high_risk(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Deploy dewatering pump to affected zone.",
        resource_id=None,
        reasoning=["Severe waterlogging reported."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream()
    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert res.severity == "HIGH"

# 4. Critical flood
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_critical(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="CRITICAL",
        recommended_action="Evacuate low-lying areas and dispatch rescue boat.",
        resource_id=None,
        reasoning=["Water level exceeded danger mark."],
        requires_human_approval=True
    )

    fd = {"risk_detected": True, "status": "HIGH", "evidence": ["Extreme rise"]}
    ra = {"risk_level": "CRITICAL", "drivers": ["river_discharge"], "evidence": [], "monitoring_priorities": []}
    ii = {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "New flood"}
    rr = {"recommended_resource_type": "rescue_boat", "recommended_resource_id": None, "reason": "Boat required"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert res.severity == "CRITICAL"

# 5. Valid resource recommendation
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_valid_resource(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    res_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Dispatch rescue boat.",
        resource_id=res_id,
        reasoning=["Valid rescue boat recommended."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream(res_id)
    available = [{"id": res_id, "type": "rescue_boat", "name": "Boat 1", "status": "available"}]

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, available)
    assert res.resource_id == res_id

# 6. Invalid resource ID & 23. Fabricated resource rejection
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_invalid_resource_id(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    hallucinated_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Dispatch rescue boat.",
        resource_id=hallucinated_id,
        reasoning=["Valid rescue boat recommended."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream(hallucinated_id)
    available = [{"id": str(uuid.uuid4()), "type": "rescue_boat", "name": "Boat 1", "status": "available"}]

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, available)
    # Hallucinated resource ID must be nullified and error message appended to reasoning
    assert res.resource_id is None
    assert any("rejected" in reason.lower() for reason in res.reasoning)

# 7. No resource available
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_no_resource_available(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Monitor area. No resources available.",
        resource_id=None,
        reasoning=["No resources found in scope."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream(None)
    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert res.resource_id is None

# 8. Duplicate incident
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_duplicate_incident(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Associate incoming telemetry with the duplicate active incident.",
        resource_id=None,
        reasoning=["Duplicate report identified."],
        requires_human_approval=True
    )

    fd, ra, _, rr = get_base_upstream()
    ii = {"is_duplicate": True, "matching_incident_id": str(uuid.uuid4()), "confidence": 0.95, "reason": "Proximity match"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert "duplicate" in res.recommended_action.lower()

# 9. New incident
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_new_incident(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="WARNING",
        recommended_action="Monitor new flood incident report.",
        resource_id=None,
        reasoning=["No duplicate active incident matches this report."],
        requires_human_approval=True
    )

    fd, ra, _, rr = get_base_upstream()
    ii = {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "No match"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert "new" in res.recommended_action.lower()

# 10. Conflicting upstream results
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_conflicting_upstream(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="WARNING",
        recommended_action="Continue monitoring. Upstream agents mismatch.",
        resource_id=None,
        reasoning=["Conflict between low detection and high risk drivers."],
        requires_human_approval=True
    )

    fd = {"risk_detected": False, "status": "LOW", "evidence": []}
    ra = {"risk_level": "HIGH", "drivers": ["drainage_block"], "evidence": [], "monitoring_priorities": []}
    ii = {"is_duplicate": False, "matching_incident_id": None, "confidence": 0.0, "reason": "New"}
    rr = {"recommended_resource_type": None, "recommended_resource_id": None, "reason": "No resource suggested"}

    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    assert "conflict" in res.reasoning[0].lower()

# 11. Missing FloodDetection result, 12. Missing RiskAnalysis result, 13. Missing IncidentIntelligence result, 14. Missing ResourceRecommendation
def test_response_advisor_missing_inputs():
    fd, ra, ii, rr = get_base_upstream()

    with pytest.raises(ValueError, match="Missing flood detection"):
        ResponseAdvisorAgent.run(None, ra, ii, rr, [])

    with pytest.raises(ValueError, match="Missing risk analysis"):
        ResponseAdvisorAgent.run(fd, None, ii, rr, [])

    with pytest.raises(ValueError, match="Missing incident intelligence"):
        ResponseAdvisorAgent.run(fd, ra, None, rr, [])

    with pytest.raises(ValueError, match="Missing resource recommendation"):
        ResponseAdvisorAgent.run(fd, ra, ii, None, [])

# 15. SIMULATED provenance
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_simulated(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Log simulated telemetry alert.",
        resource_id=None,
        reasoning=["Simulated provenance verified."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream()
    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [], provenance="SIMULATED")
    assert "simulated" in res.recommended_action.lower()

# 16. REAL_IOT provenance
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_real_iot(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Dispatch resource based on live IoT sensor alert.",
        resource_id=None,
        reasoning=["Real IoT provenance verified."],
        requires_human_approval=True
    )

    fd, ra, ii, rr = get_base_upstream()
    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [], provenance="REAL_IOT")
    assert "live" in res.recommended_action.lower()

# 17. Human approval forced true
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_human_approval_forced(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Gemini attempts to set requires_human_approval = False
    mock_structured.invoke.return_value = ResponseRecommendation(
        severity="HIGH",
        recommended_action="Dispatch rescue team.",
        resource_id=None,
        reasoning=["Must be reviewed."],
        requires_human_approval=False
    )

    fd, ra, ii, rr = get_base_upstream()
    res = ResponseAdvisorAgent.run(fd, ra, ii, rr, [])
    # Schema validation or runtime code must force requires_human_approval to resolve to True
    assert res.requires_human_approval is True

# 18. Malformed Gemini output
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_malformed(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = "malformed string response"

    fd, ra, ii, rr = get_base_upstream()
    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        ResponseAdvisorAgent.run(fd, ra, ii, rr, [])

# 19. Gemini timeout
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
@patch("app.ai.agents.response_advisor_agent.ChatGoogleGenerativeAI")
def test_response_advisor_timeout(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.side_effect = Exception("Deadline Exceeded")

    fd, ra, ii, rr = get_base_upstream()
    with pytest.raises(RuntimeError, match="Gemini API call failed"):
        ResponseAdvisorAgent.run(fd, ra, ii, rr, [])

# 20. Missing API key
@patch("app.ai.agents.response_advisor_agent.get_ai_config")
def test_response_advisor_missing_api_key(mock_config):
    mock_config.return_value = get_mock_config(key="mock_key")

    fd, ra, ii, rr = get_base_upstream()
    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        ResponseAdvisorAgent.run(fd, ra, ii, rr, [])

# 22. Geographic scope protection & 21. No database writes
def test_response_advisor_geographic_scope_filtering(db_session):
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

    # User scoped to Vizag
    user_vizag = User(
        id=uuid.uuid4(),
        full_name="Vizag Operator",
        email=f"geo_vizag_{uuid.uuid4()}@bharatos.gov.in",
        role=role,
        state=state,
        city=city_vizag,
        status="active"
    )
    db_session.add(user_vizag)

    # 1 resource in Vizag, 1 resource in Hyderabad
    res_vizag = Resource(
        id=uuid.uuid4(),
        name="Vizag Rescue Boat 1",
        type="rescue_boat",
        status="available",
        latitude=17.68,
        longitude=83.21,
        city_id=city_vizag.id
    )
    res_hyd = Resource(
        id=uuid.uuid4(),
        name="Hyd Rescue Boat 1",
        type="rescue_boat",
        status="available",
        latitude=17.36,
        longitude=78.47,
        city_id=city_hyd.id
    )
    db_session.add(res_vizag)
    db_session.add(res_hyd)
    db_session.flush()

    # Retrieve available resources tool
    tools = create_agent_tools(db_session, user_vizag)
    get_available_resources_tool = next(t for t in tools if t.name == "get_available_resources_tool")

    resources_list = get_available_resources_tool.invoke({})
    
    # Assert that Vizag operator can ONLY see Vizag resource and NOT Hyderabad resource!
    active_ids = {item["id"] for item in resources_list}
    assert str(res_vizag.id) in active_ids
    assert str(res_hyd.id) not in active_ids

    # Verify no database write operations exist in the agent run method
    import inspect
    source = inspect.getsource(ResponseAdvisorAgent.run)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
