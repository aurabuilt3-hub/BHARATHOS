from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.ai.schemas.agent_outputs import (
    FloodDetectionResult,
    RiskAnalysisResult,
    IncidentIntelligenceResult,
    ResourceRecommendation,
    ResponseRecommendation,
    CommunicationResult
)

class GraphState(BaseModel):
    incident_id: Optional[str] = Field(None, description="UUID string of the target incident under investigation.")
    location: Optional[str] = Field(None, description="Geographic zone/coordinates description.")
    event_source: Optional[str] = Field(None, description="Provenance flag: SIMULATED or REAL_IOT.")
    weather_context: Optional[Dict[str, Any]] = Field(None, description="Normalized weather parameters context.")
    telemetry_context: Optional[List[Dict[str, Any]]] = Field(None, description="Normalized telemetry metrics list.")
    incident_context: Optional[List[Dict[str, Any]]] = Field(None, description="Normalized list of neighboring active incidents.")
    alert_context: Optional[List[Dict[str, Any]]] = Field(None, description="Normalized list of regional warning alerts.")
    risk_context: Optional[Dict[str, Any]] = Field(None, description="Normalized deterministic risk indices.")
    resource_context: Optional[List[Dict[str, Any]]] = Field(None, description="Normalized list of trusted candidate resources.")

    # Agent evaluations
    flood_detection: Optional[FloodDetectionResult] = Field(None, description="Output of the Flood Detection Agent.")
    risk_analysis: Optional[RiskAnalysisResult] = Field(None, description="Output of the Risk Analysis Agent.")
    incident_intelligence: Optional[IncidentIntelligenceResult] = Field(None, description="Output of the Incident Intelligence Agent.")
    resource_recommendation: Optional[ResourceRecommendation] = Field(None, description="Output of the Resource Advisor Agent.")
    response_recommendation: Optional[ResponseRecommendation] = Field(None, description="Final synthesised plan.")
    communication: Optional[CommunicationResult] = Field(None, description="Multilingual citizen alerts output.")

    # Error logging
    errors: List[str] = Field(default_factory=list, description="Execution error trace logs.")
