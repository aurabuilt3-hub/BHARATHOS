import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    category: str = "OTHER"   # WEATHER, FLOOD, WATER_LEVEL, etc.
    state_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    source: str = "SIMULATED"
    status: str = "ACTIVE"    # ACTIVE, ACKNOWLEDGED, RESOLVED, EXPIRED
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    state_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    source: Optional[str] = None
    status: Optional[str] = None
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AlertResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    severity: str
    category: str
    state_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    source: str
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedAlertResponse(BaseModel):
    total: int
    items: List[AlertResponse]
    page: int
    limit: int

    model_config = ConfigDict(from_attributes=True)


class AlertSummaryResponse(BaseModel):
    total: int
    active: int
    acknowledged: int
    resolved: int
    expired: int
    critical: int
    high: int
    medium: int
    low: int

    model_config = ConfigDict(from_attributes=True)
