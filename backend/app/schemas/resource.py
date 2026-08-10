import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field

# -------------------- Resource Schemas --------------------

class ResourceCreate(BaseModel):
    name: str
    type: str
    status: Optional[str] = Field(default="available", description="Initial status of the resource")
    latitude: float
    longitude: float
    department_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    department_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)


class ResourceResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    status: str
    latitude: float
    longitude: float
    department_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResourceResponse(BaseModel):
    items: List[ResourceResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)

# -------------------- Allocation Schemas --------------------

class ResourceAllocationRequest(BaseModel):
    incident_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class ResourceAllocationResponse(BaseModel):
    id: uuid.UUID
    incident_id: uuid.UUID
    resource_id: uuid.UUID
    assigned_by_id: uuid.UUID
    assigned_at: datetime
    released_at: Optional[datetime] = None
    status: str

    model_config = ConfigDict(from_attributes=True)
