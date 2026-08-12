import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class EventGeography(BaseModel):
    state_id: Optional[str] = None
    district_id: Optional[str] = None
    city_id: Optional[str] = None
    zone_id: Optional[str] = None
    ward_id: Optional[str] = None

class RealtimeEvent(BaseModel):
    event: str  # e.g., INCIDENT_CREATED, TELEMETRY_UPDATED
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    entity_type: str  # e.g., incident, alert, telemetry, resource, digital_twin_node
    entity_id: str
    data: Dict[str, Any]
    source_type: str = "SYSTEM"  # e.g., OFFICIAL_PUBLIC, OPEN_DATA, VERIFIED_PUBLIC, SIMULATED, SYSTEM
    geography: EventGeography
