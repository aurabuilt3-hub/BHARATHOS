import pytest
import uuid
import time
from unittest.mock import MagicMock, patch

from app.ai.graph.orchestrator import LangGraphAIOrchestrator, app_graph
from app.ai.graph.state import GraphState
from app.ai.schemas.agent_outputs import (
    FloodDetectionResult,
    RiskAnalysisResult,
    IncidentIntelligenceResult,
    ResourceRecommendation,
    ResponseRecommendation,
    CommunicationResult
)
from app.models.models import User, Role, State, District, City, Resource
from app.ai.graph.tools import create_agent_tools

# 1. Graph compiles
def test_graph_compiles():
    assert app_graph is not None
    # Verify nodes are present in the graph
    node_names = app_graph.nodes.keys()
    assert "detect_flood" in node_names
    assert "analyze_risk" in node_names
    assert "analyze_incident" in node_names
    assert "recommend_resource" in node_names
    assert "recommend_response" in node_names
    assert "generate_communication" in node_names

# 2. START → END flow & 9. Structured state propagation & 10. SIMULATED provenance & 17. Human approval forced true
@patch("app.ai.agents.flood_detection_agent.FloodDetectionAgent.run")
@patch("app.ai.agents.risk_analysis_agent.RiskAnalysisAgent.run")
@patch("app.ai.agents.incident_intelligence_agent.IncidentIntelligenceAgent.run")
@patch("app.ai.agents.resource_advisor_agent.ResourceAdvisorAgent.run")
@patch("app.ai.agents.response_advisor_agent.ResponseAdvisorAgent.run")
@patch("app.ai.agents.communication_agent.CommunicationAgent.run")
def test_graph_execution_flow(
    mock_comm, mock_resp, mock_res, mock_inc, mock_risk, mock_flood
):
    # Set up mock returns
    mock_flood.return_value = FloodDetectionResult(
        risk_detected=True, status="HIGH", evidence=["Water levels rising"]
    )
    mock_risk.return_value = RiskAnalysisResult(
        risk_level="HIGH", drivers=["heavy_rainfall"], evidence=[], monitoring_priorities=[]
    )
    mock_inc.return_value = IncidentIntelligenceResult(
        is_duplicate=False, matching_incident_id=None, confidence=0.0, reason="New report"
    )
    res_id = str(uuid.uuid4())
    mock_res.return_value = ResourceRecommendation(
        recommended_resource_type="rescue_boat", recommended_resource_id=res_id, reason="Available"
    )
    mock_resp.return_value = ResponseRecommendation(
        severity="HIGH", recommended_action="Evacuate", resource_id=res_id, reasoning=[], requires_human_approval=True
    )
    mock_comm.return_value = CommunicationResult(
        english="Alert", telugu="హెచ్చరిక", hindi="चेतावनी"
    )

    inputs = {
        "event_source": "SIMULATED",
        "weather_context": {"rainfall_24h_mm": 120.0},
        "telemetry_context": [{"node_name": "Sensor 1", "value": 3.5, "status": "critical"}],
        "incident_context": [{"category": "critical_flood", "latitude": 17.68, "longitude": 83.21, "severity": "critical", "description": "Flooding"}],
        "resource_context": [{"id": res_id, "type": "rescue_boat", "name": "Boat 1", "status": "available"}]
    }

    start_time = time.time()
    state = LangGraphAIOrchestrator.run_triage_graph(inputs)
    execution_duration = time.time() - start_time

    print(f"\n[METADATA] Graph execution duration: {execution_duration:.4f} seconds")

    # Assert node execution and outputs populated
    assert state.errors == []
    assert state.flood_detection is not None
    assert state.risk_analysis is not None
    assert state.incident_intelligence is not None
    assert state.resource_recommendation is not None
    assert state.response_recommendation is not None
    assert state.communication is not None

    # Provenance check
    assert state.event_source == "SIMULATED"
    # Safety checks
    assert state.response_recommendation.requires_human_approval is True

    # 25. Exactly one call per agent node
    assert mock_flood.call_count == 1
    assert mock_risk.call_count == 1
    assert mock_inc.call_count == 1
    assert mock_res.call_count == 1
    assert mock_resp.call_count == 1
    assert mock_comm.call_count == 1

# 11. REAL_IOT provenance preservation
@patch("app.ai.agents.flood_detection_agent.FloodDetectionAgent.run")
@patch("app.ai.agents.risk_analysis_agent.RiskAnalysisAgent.run")
@patch("app.ai.agents.incident_intelligence_agent.IncidentIntelligenceAgent.run")
@patch("app.ai.agents.resource_advisor_agent.ResourceAdvisorAgent.run")
@patch("app.ai.agents.response_advisor_agent.ResponseAdvisorAgent.run")
@patch("app.ai.agents.communication_agent.CommunicationAgent.run")
def test_graph_real_iot_provenance(
    mock_comm, mock_resp, mock_res, mock_inc, mock_risk, mock_flood
):
    mock_flood.return_value = FloodDetectionResult(risk_detected=False, status="NORMAL", evidence=[])
    mock_risk.return_value = RiskAnalysisResult(risk_level="LOW", drivers=[], evidence=[], monitoring_priorities=[])
    mock_inc.return_value = IncidentIntelligenceResult(is_duplicate=False, matching_incident_id=None, confidence=0.0, reason="")
    mock_res.return_value = ResourceRecommendation(recommended_resource_type=None, recommended_resource_id=None, reason="")
    mock_resp.return_value = ResponseRecommendation(severity="NORMAL", recommended_action="None", resource_id=None, reasoning=[], requires_human_approval=True)
    mock_comm.return_value = CommunicationResult(english="None", telugu="None", hindi="None")

    inputs = {
        "event_source": "REAL_IOT",
        "weather_context": {},
        "telemetry_context": [],
        "incident_context": [{"category": "critical_flood", "latitude": 17.68, "longitude": 83.21, "severity": "critical", "description": "Flooding"}]
    }

    state = LangGraphAIOrchestrator.run_triage_graph(inputs)
    assert state.event_source == "REAL_IOT"

# 12. Resource ID validation
@patch("app.ai.agents.flood_detection_agent.FloodDetectionAgent.run")
@patch("app.ai.agents.risk_analysis_agent.RiskAnalysisAgent.run")
@patch("app.ai.agents.incident_intelligence_agent.IncidentIntelligenceAgent.run")
@patch("app.ai.agents.resource_advisor_agent.ResourceAdvisorAgent.run")
@patch("app.ai.agents.response_advisor_agent.ResponseAdvisorAgent.run")
@patch("app.ai.agents.communication_agent.CommunicationAgent.run")
def test_graph_resource_id_hallucination(
    mock_comm, mock_resp, mock_res, mock_inc, mock_risk, mock_flood
):
    # Resource Advisor Agent raises a validation error due to hallucinated resource ID
    mock_flood.return_value = FloodDetectionResult(risk_detected=True, status="HIGH", evidence=[])
    mock_risk.return_value = RiskAnalysisResult(risk_level="HIGH", drivers=[], evidence=[], monitoring_priorities=[])
    mock_inc.return_value = IncidentIntelligenceResult(is_duplicate=False, matching_incident_id=None, confidence=0.0, reason="")
    mock_res.side_effect = ValueError("Resource recommendation rejected: Recommended resource ID was hallucinated.")

    inputs = {
        "event_source": "SIMULATED",
        "weather_context": {},
        "telemetry_context": [],
        "incident_context": [{"category": "critical_flood", "latitude": 17.68, "longitude": 83.21, "severity": "critical", "description": "Flooding"}],
        "resource_context": [{"id": str(uuid.uuid4()), "type": "rescue_boat", "name": "Boat 1", "status": "available"}]
    }

    state = LangGraphAIOrchestrator.run_triage_graph(inputs)
    # The recommend_resource node should fail due to ID validation, adding an error to state
    assert len(state.errors) > 0
    assert any("Resource recommendation rejected" in err for err in state.errors)

# 14. Agent failure handling
@patch("app.ai.agents.flood_detection_agent.FloodDetectionAgent.run")
def test_graph_agent_failure(mock_flood):
    mock_flood.side_effect = Exception("Connection Timeout")

    inputs = {
        "event_source": "SIMULATED",
        "weather_context": {},
        "telemetry_context": [],
        "incident_context": [{"category": "critical_flood", "latitude": 17.68, "longitude": 83.21, "severity": "critical", "description": "Flooding"}]
    }

    state = LangGraphAIOrchestrator.run_triage_graph(inputs)
    # The detect_flood node should fail and log error, and other nodes should skip
    assert len(state.errors) > 0
    assert state.flood_detection is None
    assert state.risk_analysis is None

# 15. Missing input handling
def test_graph_missing_inputs():
    # Empty inputs must not crash the orchestrator execution wrapper
    inputs = {}
    state = LangGraphAIOrchestrator.run_triage_graph(inputs)
    assert len(state.errors) > 0
    assert any("detect_flood node failed" in err for err in state.errors)

# 20. No dispatch occurs & 21. No database write occurs & 22. No notification is sent & 23. Graph does not expose secrets & 24. Graph serialization works
def test_graph_safety_and_serialization():
    import json
    import inspect
    from app.ai.graph import orchestrator

    # Inspect source code for write tools, notification APIs, SMS, database add/commit calls
    source = inspect.getsource(orchestrator)
    assert "db.add" not in source
    assert "db.commit" not in source
    assert "db.delete" not in source
    assert "db.flush" not in source
    assert "sms" not in source.lower()
    assert "whatsapp" not in source.lower()
    assert "send_notification" not in source.lower()

    # Secret check
    assert "GEMINI_API_KEY" not in source
    assert "DATABASE_URL" not in source

    # Graph state serialization check
    state = GraphState(
        incident_id=str(uuid.uuid4()),
        event_source="SIMULATED",
        weather_context={"temp": 30},
        telemetry_context=[{"val": 1.2}]
    )
    serialized = state.dict()
    assert serialized["event_source"] == "SIMULATED"
    assert serialized["weather_context"]["temp"] == 30
    assert serialized["telemetry_context"][0]["val"] == 1.2
    
    # Reload from serialization
    reloaded = GraphState(**serialized)
    assert reloaded.event_source == "SIMULATED"
