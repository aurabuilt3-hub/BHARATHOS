import time
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, START, END

from app.ai.graph.state import GraphState
from app.ai.agents.flood_detection_agent import FloodDetectionAgent
from app.ai.agents.risk_analysis_agent import RiskAnalysisAgent
from app.ai.agents.incident_intelligence_agent import IncidentIntelligenceAgent
from app.ai.agents.resource_advisor_agent import ResourceAdvisorAgent
from app.ai.agents.response_advisor_agent import ResponseAdvisorAgent
from app.ai.agents.communication_agent import CommunicationAgent

# Define the node functions
def detect_flood(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        weather = state.weather_context or {}
        telemetry = state.telemetry_context or []
        active_incidents = state.incident_context or []
        provenance = state.event_source or "SIMULATED"

        result = FloodDetectionAgent.run(
            weather_data=weather,
            telemetry_data=telemetry,
            active_incidents=active_incidents,
            provenance=provenance
        )
        return {"flood_detection": result}
    except Exception as e:
        return {"errors": state.errors + [f"detect_flood node failed: {str(e)}"]}

def analyze_risk(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        weather = state.weather_context or {}
        telemetry = state.telemetry_context or []
        active_incidents = state.incident_context or []
        active_alerts = state.alert_context or []
        provenance = state.event_source or "SIMULATED"
        
        fd_dict = state.flood_detection.dict() if state.flood_detection else None

        result = RiskAnalysisAgent.run(
            weather_data=weather,
            telemetry_data=telemetry,
            active_incidents=active_incidents,
            active_alerts=active_alerts,
            flood_detection_result=fd_dict,
            provenance=provenance
        )
        return {"risk_analysis": result}
    except Exception as e:
        return {"errors": state.errors + [f"analyze_risk node failed: {str(e)}"]}

def analyze_incident(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        incoming_incident = state.incident_context[0] if state.incident_context else {}
        active_incidents = state.incident_context or []
        active_alerts = state.alert_context or []
        telemetry = state.telemetry_context or []
        provenance = state.event_source or "SIMULATED"

        fd_dict = state.flood_detection.dict() if state.flood_detection else None
        ra_dict = state.risk_analysis.dict() if state.risk_analysis else None

        result = IncidentIntelligenceAgent.run(
            incoming_incident=incoming_incident,
            active_incidents=active_incidents,
            active_alerts=active_alerts,
            telemetry_context=telemetry,
            flood_detection_result=fd_dict,
            risk_analysis_result=ra_dict,
            provenance=provenance
        )
        return {"incident_intelligence": result}
    except Exception as e:
        return {"errors": state.errors + [f"analyze_incident node failed: {str(e)}"]}

def recommend_resource(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        incident = state.incident_context[0] if state.incident_context else {}
        available_resources = state.resource_context or []
        provenance = state.event_source or "SIMULATED"

        fd_dict = state.flood_detection.dict() if state.flood_detection else None
        ra_dict = state.risk_analysis.dict() if state.risk_analysis else None
        ii_dict = state.incident_intelligence.dict() if state.incident_intelligence else None

        result = ResourceAdvisorAgent.run(
            incident=incident,
            available_resources=available_resources,
            risk_analysis_result=ra_dict,
            flood_detection_result=fd_dict,
            incident_intelligence_result=ii_dict,
            provenance=provenance
        )
        return {"resource_recommendation": result}
    except Exception as e:
        return {"errors": state.errors + [f"recommend_resource node failed: {str(e)}"]}

def recommend_response(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        incident = state.incident_context[0] if state.incident_context else {}
        available_resources = state.resource_context or []
        active_alerts = state.alert_context or []
        weather = state.weather_context or {}
        telemetry = state.telemetry_context or []
        provenance = state.event_source or "SIMULATED"

        if not state.flood_detection:
            raise ValueError("Missing Flood Detection result in state.")
        if not state.risk_analysis:
            raise ValueError("Missing Risk Analysis result in state.")
        if not state.incident_intelligence:
            raise ValueError("Missing Incident Intelligence result in state.")
        if not state.resource_recommendation:
            raise ValueError("Missing Resource Recommendation result in state.")

        result = ResponseAdvisorAgent.run(
            flood_detection=state.flood_detection.dict(),
            risk_analysis=state.risk_analysis.dict(),
            incident_intelligence=state.incident_intelligence.dict(),
            resource_recommendation=state.resource_recommendation.dict(),
            available_resources=available_resources,
            incident=incident,
            active_alerts=active_alerts,
            weather=weather,
            telemetry=telemetry,
            provenance=provenance
        )
        return {"response_recommendation": result}
    except Exception as e:
        return {"errors": state.errors + [f"recommend_response node failed: {str(e)}"]}

def generate_communication(state: GraphState) -> Dict[str, Any]:
    if state.errors:
        return {}
    try:
        incident = state.incident_context[0] if state.incident_context else {}
        provenance = state.event_source or "SIMULATED"

        if not state.response_recommendation:
            raise ValueError("Missing Response Recommendation result in state.")

        result = CommunicationAgent.run(
            response_recommendation=state.response_recommendation.dict(),
            provenance=provenance,
            incident_location={"latitude": incident.get("latitude"), "longitude": incident.get("longitude")} if incident else None,
            incident_category=incident.get("category") if incident else None,
            relevant_risk_level=state.risk_analysis.risk_level if state.risk_analysis else None
        )
        return {"communication": result}
    except Exception as e:
        return {"errors": state.errors + [f"generate_communication node failed: {str(e)}"]}


# Compile the StateGraph
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("detect_flood", detect_flood)
workflow.add_node("analyze_risk", analyze_risk)
workflow.add_node("analyze_incident", analyze_incident)
workflow.add_node("recommend_resource", recommend_resource)
workflow.add_node("recommend_response", recommend_response)
workflow.add_node("generate_communication", generate_communication)

# Add edges
workflow.add_edge(START, "detect_flood")
workflow.add_edge("detect_flood", "analyze_risk")
workflow.add_edge("analyze_risk", "analyze_incident")
workflow.add_edge("analyze_incident", "recommend_resource")
workflow.add_edge("recommend_resource", "recommend_response")
workflow.add_edge("recommend_response", "generate_communication")
workflow.add_edge("generate_communication", END)

app_graph = workflow.compile()


class LangGraphAIOrchestrator:
    @staticmethod
    def run_triage_graph(inputs: Dict[str, Any]) -> GraphState:
        """
        Executes the LangGraph Multi-Agent State Graph pipeline using compiled graph.
        """
        state_dict = app_graph.invoke(inputs)
        
        # Return state as GraphState model
        if isinstance(state_dict, GraphState):
            return state_dict
        return GraphState(**state_dict)
