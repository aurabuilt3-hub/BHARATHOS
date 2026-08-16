import pytest
import uuid
from unittest.mock import MagicMock, patch
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.db.session import engine

from app.ai.agents.resource_advisor_agent import ResourceAdvisorAgent
from app.ai.schemas.agent_outputs import ResourceRecommendation
from app.models.models import User, Role, State, District, City, Resource, Facility
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

# 1. Critical flood → suitable rescue resource
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_critical_flood(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    res_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=res_id,
        reason="Incident is critical flood, recommending rescue boat."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Critical Flooding"}
    available = [{"id": res_id, "type": "rescue_boat", "name": "Boat 1", "latitude": 17.68, "longitude": 83.21, "status": "available"}]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_type == "rescue_boat"
    assert res.recommended_resource_id == res_id

# 2. Waterlogging → suitable pump/resource
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_waterlogging(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    res_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="dewatering_pump",
        recommended_resource_id=res_id,
        reason="Incident is waterlogging, recommending dewatering pump."
    )

    incident = {"category": "waterlogging", "severity": "warning", "latitude": 17.68, "longitude": 83.21, "title": "Waterlogging"}
    available = [{"id": res_id, "type": "dewatering_pump", "name": "Pump 2", "latitude": 17.68, "longitude": 83.21, "status": "available"}]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_type == "dewatering_pump"

# 3. Road blockage → suitable response resource
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_road_blockage(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    res_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="municipal_crew",
        recommended_resource_id=res_id,
        reason="Incident is road blockage, recommending municipal crew."
    )

    incident = {"category": "road_blockage", "severity": "medium", "latitude": 17.68, "longitude": 83.21, "title": "Road Blocked"}
    available = [{"id": res_id, "type": "municipal_crew", "name": "Crew A", "latitude": 17.68, "longitude": 83.21, "status": "available"}]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_type == "municipal_crew"

# 4. Multiple available resources & 5. Nearest suitable resource
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_nearest(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    nearest_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=nearest_id,
        reason="Recommending closest rescue boat (100m away)."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.6800, "longitude": 83.2100, "title": "Flood"}
    available = [
        {"id": nearest_id, "type": "rescue_boat", "name": "Nearest Boat", "latitude": 17.6805, "longitude": 83.2105, "status": "available"},
        {"id": str(uuid.uuid4()), "type": "rescue_boat", "name": "Distant Boat", "latitude": 17.7500, "longitude": 83.3500, "status": "available"}
    ]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_id == nearest_id

# 6. More capable but farther resource
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_more_capable(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    cap_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="high_capacity_pump",
        recommended_resource_id=cap_id,
        reason="Recommending far high capacity pump over nearby standard pump due to flood severity."
    )

    incident = {"category": "waterlogging", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Severe Flood"}
    available = [
        {"id": str(uuid.uuid4()), "type": "standard_pump", "name": "Standard Pump", "latitude": 17.682, "longitude": 83.212, "status": "available"},
        {"id": cap_id, "type": "high_capacity_pump", "name": "High Cap Pump", "latitude": 17.750, "longitude": 83.350, "status": "available"}
    ]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_id == cap_id

# 7. Unavailable resource rejection & 8. Already allocated resource rejection
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_unavailable_rejection(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    unavail_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=unavail_id,
        reason="Allocating unavailable resource."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    # The resource is not 'available', it is 'allocated' or 'offline'
    available = [{"id": unavail_id, "type": "rescue_boat", "name": "Boat 1", "latitude": 17.68, "longitude": 83.21, "status": "allocated"}]

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_id == unavail_id

# 9. Hallucinated resource ID & 21. Invalid resource ID
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_hallucinated_id(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    hallucinated_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=hallucinated_id,
        reason="Hallucinating resource ID."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    available = [{"id": str(uuid.uuid4()), "type": "rescue_boat", "name": "Boat 1", "latitude": 17.68, "longitude": 83.21, "status": "available"}]

    with pytest.raises(ValueError, match="Resource recommendation rejected"):
        ResourceAdvisorAgent.run(incident, available)

# 10. No available resources
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_no_resources(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type=None,
        recommended_resource_id=None,
        reason="No available resources in area."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    available = []

    res = ResourceAdvisorAgent.run(incident, available)
    assert res.recommended_resource_id is None

# 11. Missing coordinates, 12. Missing incident category, 13. Missing severity
def test_resource_advisor_missing_inputs():
    available = []

    with pytest.raises(ValueError, match="Missing incident geographic coordinates"):
        ResourceAdvisorAgent.run(
            {"category": "waterlogging", "severity": "medium", "title": "Flood"},
            available
        )

    with pytest.raises(ValueError, match="Missing incident category"):
        ResourceAdvisorAgent.run(
            {"severity": "medium", "latitude": 12.0, "longitude": 80.0, "title": "Flood"},
            available
        )

    with pytest.raises(ValueError, match="Missing incident severity"):
        ResourceAdvisorAgent.run(
            {"category": "waterlogging", "latitude": 12.0, "longitude": 80.0, "title": "Flood"},
            available
        )

# 14. SIMULATED provenance
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_simulated(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=None,
        reason="Checking simulated provenance."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    res = ResourceAdvisorAgent.run(incident, [], provenance="SIMULATED")
    assert res.recommended_resource_id is None

# 15. REAL_IOT provenance
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_real(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=None,
        reason="Checking real provenance."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    res = ResourceAdvisorAgent.run(incident, [], provenance="REAL_IOT")
    assert res.recommended_resource_id is None

# 16. Malformed Gemini structured output
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_malformed_response(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = "malformed response string"

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        ResourceAdvisorAgent.run(incident, [])

# 17. Gemini timeout
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_timeout(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.side_effect = Exception("Deadline Exceeded")

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    with pytest.raises(RuntimeError, match="Gemini API call failed"):
        ResourceAdvisorAgent.run(incident, [])

# 18. Missing API key
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
def test_resource_advisor_missing_api_key(mock_config):
    mock_config.return_value = get_mock_config(key="mock_key")

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        ResourceAdvisorAgent.run(incident, [])

# 19. Geographic scope violation & 20. No database write operations
def test_resource_advisor_geographic_scope_filtering(db_session):
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
    source = inspect.getsource(ResourceAdvisorAgent.run)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source

# 22. Facility-vs-resource distinction
@patch("app.ai.agents.resource_advisor_agent.get_ai_config")
@patch("app.ai.agents.resource_advisor_agent.ChatGoogleGenerativeAI")
def test_resource_advisor_facility_distinction(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    facility_id = str(uuid.uuid4())
    # Model mistakenly returns facility ID as resource ID
    mock_structured.invoke.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat",
        recommended_resource_id=facility_id,
        reason="Mistakenly recommending facility."
    )

    incident = {"category": "critical_flood", "severity": "critical", "latitude": 17.68, "longitude": 83.21, "title": "Flood"}
    # The facility ID is NOT present in available resources
    available = [{"id": str(uuid.uuid4()), "type": "rescue_boat", "name": "Boat 1", "latitude": 17.68, "longitude": 83.21, "status": "available"}]
    
    # Recommending a facility ID not in available resources must trigger a validation failure (ValueError)
    with pytest.raises(ValueError, match="Resource recommendation rejected"):
        ResourceAdvisorAgent.run(incident, available)
