from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal

class FloodDetectionResult(BaseModel):
    risk_detected: bool = Field(description="Indicates whether flood risk/conditions are detected.")
    status: Literal["NORMAL", "WATCH", "WARNING", "HIGH", "CRITICAL"] = Field(
        description="Current severity status of flood risk."
    )
    evidence: List[str] = Field(default_factory=list, description="Evidence logs and sensor facts justifying status.")

class RiskAnalysisResult(BaseModel):
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(
        description="Overall evaluated flood risk severity level."
    )
    drivers: List[str] = Field(default_factory=list, description="Primary environmental/meteorological risk drivers.")
    evidence: List[str] = Field(default_factory=list, description="Evidence justifying the risk level evaluation.")
    recommended_monitoring: List[str] = Field(
        default_factory=list, description="Recommended locations, nodes, or channels to monitor."
    )

class IncidentIntelligenceResult(BaseModel):
    is_duplicate: bool = Field(description="Indicates if incoming alert/report is a duplicate of an existing incident.")
    matching_incident_id: Optional[str] = Field(
        None, description="UUID string of the matching duplicate incident, if is_duplicate is True."
    )
    confidence: float = Field(description="Confidence score for deduplication recommendation (must be between 0.0 and 1.0).")
    reason: str = Field(description="Justification explaining why deduplication was flagged or dismissed.")

    @field_validator("confidence")
    def validate_confidence(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("confidence must be between 0.0 and 1.0")
        return v

class ResourceRecommendation(BaseModel):
    recommended_resource_type: Optional[str] = Field(None, description="Recommended category type of resource.")
    recommended_resource_id: Optional[str] = Field(None, description="UUID string of the specific recommended resource.")
    reason: str = Field(description="Reason explaining why this resource matches the incident requirement.")

class ResponseRecommendation(BaseModel):
    severity: str = Field(description="Operational incident severity status.")
    recommended_action: str = Field(description="Concise description of recommended disaster response action.")
    resource_id: Optional[str] = Field(None, description="Validated resource ID recommendation.")
    reasoning: List[str] = Field(default_factory=list, description="Operational logic list supporting recommendation.")
    requires_human_approval: bool = Field(True, description="Safety flag indicating operator approval is mandatory.")

    @field_validator("requires_human_approval", mode="before")
    def force_human_approval(cls, v: bool) -> bool:
        # Guarantee requires_human_approval always resolves to True
        return True

class CommunicationResult(BaseModel):
    english: str = Field(description="Concise public safety advisory statement in English.")
    telugu: str = Field(description="Concise public safety advisory statement in Telugu.")
    hindi: str = Field(description="Concise public safety advisory statement in Hindi.")
