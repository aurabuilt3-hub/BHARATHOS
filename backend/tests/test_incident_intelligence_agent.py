import pytest
import uuid
from unittest.mock import MagicMock, patch
from pydantic import ValidationError

from app.ai.agents.incident_intelligence_agent import IncidentIntelligenceAgent
from app.ai.schemas.agent_outputs import IncidentIntelligenceResult
from app.models.models import User, Role, State, District, City, Incident
from app.ai.graph.tools import create_agent_tools

# Mock helper to override get_ai_config settings
def get_mock_config(key="real_key_for_test"):
    return {
        "model": "gemini-3.6-flash",
        "api_key": key,
        "temperature": 0.2,
        "timeout": 30.0
    }

from sqlalchemy.orm import Session
from app.db.session import engine

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

# 1. Clear duplicate incident
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_clear_duplicate(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    match_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=True,
        matching_incident_id=match_id,
        confidence=0.95,
        reason="Matches exact location and description."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded up to 1 feet",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }
    candidates = [
        {
            "id": match_id,
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.68,
            "longitude": 83.21,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is True
    assert res.matching_incident_id == match_id
    assert res.confidence == 0.95

# 2. Clearly different incident
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_different(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.1,
        reason="Distant location and unrelated category."
    )

    incoming = {
        "category": "drain_overflow",
        "title": "Drain leaking in Gajuwaka",
        "description": "Minor leakage on road side",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "normal"
    }
    candidates = [
        {
            "id": str(uuid.uuid4()),
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.75,
            "longitude": 83.35,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is False
    assert res.matching_incident_id is None

# 3. Same location + different category
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_same_loc_diff_cat(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.3,
        reason="Same location but unrelated categories."
    )

    incoming = {
        "category": "medical_emergency",
        "title": "Medical help requested",
        "description": "Patient needs ambulance transfer",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "high"
    }
    candidates = [
        {
            "id": str(uuid.uuid4()),
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.68,
            "longitude": 83.21,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is False

# 4. Same category + distant location
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_same_cat_distant(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.2,
        reason="Same category but coordinates are 25km apart."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logging in Gajuwaka",
        "description": "Road flooded up to 1 feet",
        "latitude": 17.69,
        "longitude": 83.15,
        "severity": "warning"
    }
    candidates = [
        {
            "id": str(uuid.uuid4()),
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.68,
            "longitude": 83.29,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is False

# 5. Similar description + nearby location
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_similar_nearby(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    match_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=True,
        matching_incident_id=match_id,
        confidence=0.88,
        reason="Highly similar description and coordinates within 100 meters."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Waterlogged street",
        "description": "Severe water logging reported on sector 2 street",
        "latitude": 17.6805,
        "longitude": 83.2105,
        "severity": "warning"
    }
    candidates = [
        {
            "id": match_id,
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Water logging on sector 2 main road",
            "latitude": 17.6800,
            "longitude": 83.2100,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is True
    assert res.matching_incident_id == match_id

# 6. Multiple possible candidates
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_multiple_candidates(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    match_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=True,
        matching_incident_id=match_id,
        confidence=0.92,
        reason="Matches candidate 2 because of exact location correlation."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded up to 1 feet",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }
    candidates = [
        {
            "id": str(uuid.uuid4()),
            "category": "waterlogging",
            "title": "Flooding at Gajuwaka",
            "description": "Main road under water",
            "latitude": 17.69,
            "longitude": 83.15,
            "status": "open",
            "severity": "warning"
        },
        {
            "id": match_id,
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.68,
            "longitude": 83.21,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    assert res.is_duplicate is True
    assert res.matching_incident_id == match_id

# 7. Correct matching incident ID & 8. Hallucinated incident ID
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_hallucinated_id(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    # Return a random hallucinated ID that does not exist in supplied candidates
    hallucinated_id = str(uuid.uuid4())
    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=True,
        matching_incident_id=hallucinated_id,
        confidence=0.95,
        reason="Hallucinated match."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }
    candidates = [
        {
            "id": str(uuid.uuid4()),
            "category": "waterlogging",
            "title": "Flooding at MVP Colony",
            "description": "Main road under water",
            "latitude": 17.68,
            "longitude": 83.21,
            "status": "open",
            "severity": "warning"
        }
    ]

    res = IncidentIntelligenceAgent.run(incoming, candidates)
    # Hallucinated ID must be rejected and resolved to None!
    assert res.matching_incident_id is None

# 9. No active incidents
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_no_candidates(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.0,
        reason="No active incidents exist in candidates."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    res = IncidentIntelligenceAgent.run(incoming, [])
    assert res.is_duplicate is False

# 10. Missing coordinates, 11. Missing description, 12. Missing category
def test_incident_intelligence_missing_inputs():
    candidates = []

    # Missing coordinates
    with pytest.raises(ValueError, match="Missing incident geographic coordinates"):
        IncidentIntelligenceAgent.run(
            {"category": "waterlogging", "title": "A", "description": "B"},
            candidates
        )

    # Missing description
    with pytest.raises(ValueError, match="Missing incident description"):
        IncidentIntelligenceAgent.run(
            {"category": "waterlogging", "title": "A", "latitude": 12.0, "longitude": 80.0},
            candidates
        )

    # Missing category
    with pytest.raises(ValueError, match="Missing incident category"):
        IncidentIntelligenceAgent.run(
            {"title": "A", "description": "B", "latitude": 12.0, "longitude": 80.0},
            candidates
        )

# 13. SIMULATED provenance
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_simulated_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.4,
        reason="Simulated provenance logs checked."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    res = IncidentIntelligenceAgent.run(incoming, [], provenance="SIMULATED")
    assert res.is_duplicate is False

# 14. REAL_IOT provenance
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_real_provenance(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = IncidentIntelligenceResult(
        is_duplicate=False,
        matching_incident_id=None,
        confidence=0.4,
        reason="Real IoT provenance checked."
    )

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    res = IncidentIntelligenceAgent.run(incoming, [], provenance="REAL_IOT")
    assert res.is_duplicate is False

# 15. Malformed Gemini structured output
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_malformed_response(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.return_value = "malformed string response"

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    with pytest.raises(RuntimeError, match="Model output failed Pydantic validation"):
        IncidentIntelligenceAgent.run(incoming, [])

# 16. Gemini timeout
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
@patch("app.ai.agents.incident_intelligence_agent.ChatGoogleGenerativeAI")
def test_incident_intelligence_gemini_timeout(mock_chat, mock_config):
    mock_config.return_value = get_mock_config()
    mock_model = MagicMock()
    mock_chat.return_value = mock_model
    mock_structured = MagicMock()
    mock_model.with_structured_output.return_value = mock_structured

    mock_structured.invoke.side_effect = Exception("Deadline Exceeded")

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    with pytest.raises(RuntimeError, match="Gemini API call failed"):
        IncidentIntelligenceAgent.run(incoming, [])

# 17. Missing API key
@patch("app.ai.agents.incident_intelligence_agent.get_ai_config")
def test_incident_intelligence_missing_api_key(mock_config):
    mock_config.return_value = get_mock_config(key="mock_key")

    incoming = {
        "category": "waterlogging",
        "title": "Water logged in MVP Colony",
        "description": "Road flooded",
        "latitude": 17.68,
        "longitude": 83.21,
        "severity": "warning"
    }

    with pytest.raises(RuntimeError, match="GEMINI_API_KEY NOT CONFIGURED"):
        IncidentIntelligenceAgent.run(incoming, [])

# 18. Confidence below 0 & 19. Confidence above 1
def test_incident_intelligence_confidence_bounds():
    with pytest.raises(ValidationError):
        IncidentIntelligenceResult(is_duplicate=True, matching_incident_id="abc", confidence=-0.5, reason="invalid")

    with pytest.raises(ValidationError):
        IncidentIntelligenceResult(is_duplicate=True, matching_incident_id="abc", confidence=1.5, reason="invalid")

# 20. Geographic scope enforcement & 21. No database write operations
def test_incident_intelligence_geographic_scope_filtering(db_session):
    # Find role
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

    # Create Zone for Vizag
    from app.models.models import Zone
    zone_vizag = Zone(id=uuid.uuid4(), city_id=city_vizag.id, zone_name="Vizag Zone A", polygon={})
    db_session.add(zone_vizag)
    db_session.flush()

    # Create Zone for Hyderabad
    zone_hyd = Zone(id=uuid.uuid4(), city_id=city_hyd.id, zone_name="Hyd Zone A", polygon={})
    db_session.add(zone_hyd)
    db_session.flush()

    # 1 incident in Vizag, 1 incident in Hyderabad
    inc_vizag = Incident(
        id=uuid.uuid4(),
        ticket_number=f"INC-{uuid.uuid4().hex[:8]}",
        zone_id=zone_vizag.id,
        category="waterlogging",
        title="Vizag Road Flooded",
        description="Near Beach Road",
        latitude=17.68,
        longitude=83.21,
        status="open",
        severity="warning"
    )
    inc_hyd = Incident(
        id=uuid.uuid4(),
        ticket_number=f"INC-{uuid.uuid4().hex[:8]}",
        zone_id=zone_hyd.id,
        category="waterlogging",
        title="Hyd Road Flooded",
        description="Near Charminar",
        latitude=17.36,
        longitude=78.47,
        status="open",
        severity="warning"
    )
    db_session.add(inc_vizag)
    db_session.add(inc_hyd)
    db_session.flush()

    # Use the read-only tools to retrieve active incidents for Vizag operator
    tools = create_agent_tools(db_session, user_vizag)
    get_incidents_tool = next(t for t in tools if t.name == "get_incidents_tool")

    incidents_list = get_incidents_tool.invoke({})
    
    # Assert that Vizag operator can ONLY see Vizag incident and NOT Hyderabad incident!
    active_ids = {item["id"] for item in incidents_list}
    assert str(inc_vizag.id) in active_ids
    assert str(inc_hyd.id) not in active_ids

    # Verify no write operations exist in the agent run method
    import inspect
    source = inspect.getsource(IncidentIntelligenceAgent.run)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
