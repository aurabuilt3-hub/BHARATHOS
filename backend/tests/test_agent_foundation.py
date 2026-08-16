import pytest
import uuid
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.models import User, Role, State, District, City, Zone, DigitalTwinNode, TelemetryRecord, Incident, Alert
from app.ai.schemas.agent_outputs import (
    FloodDetectionResult,
    RiskAnalysisResult,
    IncidentIntelligenceResult,
    ResourceRecommendation,
    ResponseRecommendation,
    CommunicationResult
)
from app.ai.graph.state import GraphState
from app.ai.graph.tools import create_agent_tools, validate_resource_recommendation
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

# 1. FloodDetectionResult validation
def test_flood_detection_result_validation():
    # Valid model
    fd = FloodDetectionResult(risk_detected=True, status="HIGH", evidence=["Rising level"])
    assert fd.risk_detected is True
    assert fd.status == "HIGH"
    
    # Invalid status
    with pytest.raises(ValidationError):
        FloodDetectionResult(risk_detected=True, status="EXTREME", evidence=[])

# 2. RiskAnalysisResult validation
def test_risk_analysis_result_validation():
    # Valid model
    ra = RiskAnalysisResult(risk_level="CRITICAL", drivers=["precip"], evidence=["4.2m depth"], recommended_monitoring=["node-1"])
    assert ra.risk_level == "CRITICAL"
    assert "precip" in ra.drivers

    # Invalid risk level
    with pytest.raises(ValidationError):
        RiskAnalysisResult(risk_level="DANGEROUS", drivers=[], evidence=[], recommended_monitoring=[])

# 3. IncidentIntelligenceResult confidence validation
def test_incident_intelligence_result_confidence_validation():
    # Valid confidence
    ii = IncidentIntelligenceResult(is_duplicate=True, matching_incident_id="inc-123", confidence=0.85, reason="Same intersection")
    assert ii.confidence == 0.85

    # Out of bounds: greater than 1.0
    with pytest.raises(ValidationError):
        IncidentIntelligenceResult(is_duplicate=True, confidence=1.2, reason="Overconfident")

    # Out of bounds: less than 0.0
    with pytest.raises(ValidationError):
        IncidentIntelligenceResult(is_duplicate=True, confidence=-0.1, reason="Negative confidence")

# 4. ResponseRecommendation human approval validation
def test_response_recommendation_human_approval_validation():
    # True should remain True
    rr1 = ResponseRecommendation(severity="CRITICAL", recommended_action="Evacuate", reasoning=[], requires_human_approval=True)
    assert rr1.requires_human_approval is True

    # False should be forced/resolved to True
    rr2 = ResponseRecommendation(severity="CRITICAL", recommended_action="Evacuate", reasoning=[], requires_human_approval=False)
    assert rr2.requires_human_approval is True

# 5. CommunicationResult validation
def test_communication_result_validation():
    comm = CommunicationResult(english="Evacuate", telugu="ఖాళీ చేయండి", hindi="खाली करें")
    assert comm.english == "Evacuate"
    assert comm.telugu == "ఖాళీ చేయండి"
    assert comm.hindi == "खाली करें"

# 6. Shared graph state
def test_shared_graph_state_initialization():
    state = GraphState(
        incident_id="inc-uuid",
        location="Beach Road",
        event_source="REAL_IOT",
        weather_context={"rainfall_mm": 50},
        errors=[]
    )
    assert state.incident_id == "inc-uuid"
    assert state.event_source == "REAL_IOT"
    assert state.weather_context["rainfall_mm"] == 50
    assert state.flood_detection is None

# 7. Tool input validation
def test_tool_input_validation():
    # Create mock DB & User
    class MockDB:
        pass
    class MockUser:
        id = uuid.uuid4()
        role = "operator"

    tools = create_agent_tools(MockDB(), MockUser())
    get_incident_details_tool = next(t for t in tools if t.name == "get_incident_details_tool")

    # Empty incident_id raises error
    with pytest.raises(ValueError):
        get_incident_details_tool.invoke({"incident_id": ""})

    # Extra long incident_id raises error
    with pytest.raises(ValueError):
        get_incident_details_tool.invoke({"incident_id": "a" * 100})

# 8. Tool output normalization
def test_tool_output_normalization(db_session):
    # Setup mock user context
    state = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state)
    
    dist = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist:
        dist = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist)
    
    city = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city:
        city = City(id=uuid.uuid4(), district_id=dist.id, city_name="Visakhapatnam", status="active")
        db_session.add(city)

    db_session.flush()

    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    user_email = f"norm_{uuid.uuid4()}@bharatos.gov.in"
    user = User(
        id=uuid.uuid4(),
        full_name="Agent Tester",
        email=user_email,
        role=role,
        state=state,
        city=city,
        status="active"
    )
    db_session.add(user)
    db_session.flush()

    tools = create_agent_tools(db_session, user)
    get_weather_tool = next(t for t in tools if t.name == "get_weather_tool")
    
    res = get_weather_tool.invoke({})
    assert isinstance(res, dict)
    assert "location" in res
    assert "rainfall_mm" in res
    assert "forecast" in res

# 9. Resource ID validation
def test_resource_recommendation_id_validation():
    available = [
        {"id": "res-1", "name": "Pump M-12"},
        {"id": "res-2", "name": "Rescue Boat"}
    ]

    # Valid ID matches
    validated, reason = validate_resource_recommendation("res-1", available)
    assert validated == "res-1"
    assert reason is None

    # Invalid ID returns None
    validated, reason = validate_resource_recommendation("res-999", available)
    assert validated is None
    assert "does not exist" in reason

# 10. Secret exclusion
def test_secret_exclusion(db_session):
    # Ensure no credentials or keys exist in normalized tool outputs
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
    
    city = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    if not city:
        city = City(id=uuid.uuid4(), district_id=uuid.uuid4(), city_name="Visakhapatnam", status="active")
        db_session.add(city)
        db_session.flush()

    user_email = f"secret_{uuid.uuid4()}@bharatos.gov.in"
    user = User(
        id=uuid.uuid4(),
        full_name="Secret Scan User",
        email=user_email,
        role=role,
        state=state,
        city=city,
        status="active"
    )
    db_session.add(user)
    db_session.flush()

    tools = create_agent_tools(db_session, user)
    
    for tool_fn in tools:
        if tool_fn.name in ("get_weather_tool", "get_dashboard_overview_tool"):
            res = tool_fn.invoke({})
            # Convert to string and scan
            res_str = str(res).lower()
            assert "database_url" not in res_str
            assert "postgres" not in res_str
            assert "iot_ingestion_key" not in res_str
            assert "gemini_api_key" not in res_str

# 11. SIMULATED provenance & 12. REAL_IOT provenance
def test_telemetry_provenance(db_session):
    # Find or create a digital twin node
    city = db_session.query(City).filter_by(city_name="Visakhapatnam").first()
    state = db_session.query(State).filter_by(state_name="Andhra Pradesh").first()
    
    role = db_session.query(Role).filter_by(role_name="district_operator").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="district_operator")
        db_session.add(role)
        db_session.flush()

    if not state:
        state = State(id=uuid.uuid4(), state_name="Andhra Pradesh", status="active")
        db_session.add(state)
        db_session.flush()
    
    dist = db_session.query(District).filter_by(district_name="Visakhapatnam District").first()
    if not dist:
        dist = District(id=uuid.uuid4(), state_id=state.id, district_name="Visakhapatnam District", status="active")
        db_session.add(dist)
        db_session.flush()

    if not city:
        city = City(id=uuid.uuid4(), district_id=dist.id, city_name="Visakhapatnam", status="active")
        db_session.add(city)
        db_session.flush()

    user_email = f"prov_{uuid.uuid4()}@bharatos.gov.in"
    user = User(
        id=uuid.uuid4(),
        full_name="Provenance User",
        email=user_email,
        role=role,
        state=state,
        city=city,
        status="active"
    )
    db_session.add(user)
    db_session.flush()

    node_iot = DigitalTwinNode(
        id=uuid.uuid4(),
        state=state,
        city=city,
        name="Ward 12 Storm Drain Gauge",
        type="sensor",
        status="active",
        latitude=17.68,
        longitude=83.21,
        last_telemetry={"source_type": "REAL_IOT"}
    )
    node_sim = DigitalTwinNode(
        id=uuid.uuid4(),
        state=state,
        city=city,
        name="MVP Colony Gauge",
        type="sensor",
        status="active",
        latitude=17.69,
        longitude=83.22,
        last_telemetry={"source_type": "SIMULATED"}
    )
    db_session.add(node_iot)
    db_session.add(node_sim)
    db_session.flush()

    rec_iot = TelemetryRecord(
        id=uuid.uuid4(),
        node=node_iot,
        metric_type="water_level",
        value=150.0,
        unit="cm",
        status="critical",
        timestamp=pytest.importorskip("datetime").datetime.utcnow()
    )
    rec_sim = TelemetryRecord(
        id=uuid.uuid4(),
        node=node_sim,
        metric_type="water_level",
        value=100.0,
        unit="cm",
        status="normal",
        timestamp=pytest.importorskip("datetime").datetime.utcnow()
    )
    db_session.add(rec_iot)
    db_session.add(rec_sim)
    db_session.flush()

    tools = create_agent_tools(db_session, user)
    get_telemetry_tool = next(t for t in tools if t.name == "get_telemetry_tool")

    iot_items = get_telemetry_tool.invoke({"node_id": str(node_iot.id)})
    sim_items = get_telemetry_tool.invoke({"node_id": str(node_sim.id)})

    assert len(iot_items) > 0
    assert iot_items[0]["source_type"] == "REAL_IOT"

    assert len(sim_items) > 0
    assert sim_items[0]["source_type"] == "SIMULATED"
