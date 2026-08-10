import uuid
from datetime import datetime
from typing import Optional, Dict

from pydantic import BaseModel, ConfigDict

# -------------------- Command Center Schemas --------------------

class CommandCenterResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    status: str
    latitude: float
    longitude: float
    state_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    level: Optional[str] = None
    last_telemetry: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommandCenterSummaryResponse(BaseModel):
    command_center_id: uuid.UUID
    command_center_name: Optional[str] = None
    active_incidents: int
    total_incidents: int
    total_resources: int
    available_resources: int
    allocated_resources: int
    deployed_resources: int
    busy_resources: int
    active_resource_allocations: int

    model_config = ConfigDict(from_attributes=True)
