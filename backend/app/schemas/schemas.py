from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from typing import Optional, List
import uuid
from datetime import datetime

# System & Health Schemas
class HealthResponse(BaseModel):
    status: str
    database: str
    supabase: str
    env_config: str
    timestamp: datetime

class SystemStatusResponse(BaseModel):
    status: str
    uptime_seconds: float
    platform: str
    timestamp: datetime

class VersionResponse(BaseModel):
    version: str
    sprint: str
    environment: str
    timestamp: datetime

# Auth & User Schemas
class ProfileCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    role_name: str
    city_id: Optional[uuid.UUID] = None

class UserScope(BaseModel):
    state_id: Optional[uuid.UUID] = None
    district_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str]
    role_name: str
    city_id: Optional[uuid.UUID]
    status: str
    created_at: datetime
    updated_at: datetime
    scope: UserScope

    model_config = ConfigDict(from_attributes=True)

# Department Schemas
class DepartmentResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    status: str

    model_config = ConfigDict(from_attributes=True)

# City & Location Schemas
class CityResponse(BaseModel):
    id: uuid.UUID
    city_name: str
    population: Optional[int]
    latitude: float
    longitude: float
    status: str

    model_config = ConfigDict(from_attributes=True)

# Incident Schemas
class IncidentCreate(BaseModel):
    category: str = Field(..., description="Flood, Fire, Medical, Accident, Garbage, Water Leakage, Pothole, Street Light Failure, Fallen Tree, Infrastructure Damage")
    title: str = Field(..., max_length=255)
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    severity: Optional[str] = Field("medium", description="critical, high, medium, low")
    zone_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    image_urls: Optional[List[str]] = []

class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="active, assigned, in_progress, resolved, closed")
    notes: Optional[str] = None

class IncidentAssignRequest(BaseModel):
    department_id: uuid.UUID
    assigned_officer_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class IncidentImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    caption: Optional[str]
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentAssignmentResponse(BaseModel):
    id: uuid.UUID
    department_id: uuid.UUID
    department_name: Optional[str] = None
    assigned_officer_id: Optional[uuid.UUID] = None
    notes: Optional[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentResponse(BaseModel):
    id: uuid.UUID
    ticket_number: str
    citizen_id: Optional[uuid.UUID]
    category: str
    title: str
    description: str
    latitude: float
    longitude: float
    address: Optional[str]
    severity: str
    status: str
    zone_id: Optional[uuid.UUID]
    ward_id: Optional[uuid.UUID]
    department_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    images: List[IncidentImageResponse] = []
    assignments: List[IncidentAssignmentResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PaginatedIncidentResponse(BaseModel):
    items: List[IncidentResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)

# Geography Schemas
class StateResponse(BaseModel):
    id: uuid.UUID
    state_name: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class DistrictResponse(BaseModel):
    id: uuid.UUID
    state_id: uuid.UUID
    district_name: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class DistrictDetailResponse(BaseModel):
    id: uuid.UUID
    state_id: uuid.UUID
    state_name: str
    district_name: str
    status: str

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_relations(cls, data):
        if not isinstance(data, dict):
            # Resolve from SQLAlchemy object attributes
            state_obj = getattr(data, "state", None)
            if state_obj:
                data.state_name = getattr(state_obj, "state_name", "")
        return data

class CityDetailResponse(BaseModel):
    id: uuid.UUID
    city_name: str
    district_id: uuid.UUID
    district_name: str
    state_id: uuid.UUID
    state_name: str
    population: Optional[int] = None
    latitude: float
    longitude: float
    status: str

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_relations(cls, data):
        if not isinstance(data, dict):
            # Resolve from SQLAlchemy object attributes
            district_obj = getattr(data, "district", None)
            if district_obj:
                data.district_name = getattr(district_obj, "district_name", "")
                data.state_id = getattr(district_obj, "state_id", None)
                state_obj = getattr(district_obj, "state", None)
                if state_obj:
                    data.state_name = getattr(state_obj, "state_name", "")
        return data

class ZoneResponse(BaseModel):
    id: uuid.UUID
    city_id: uuid.UUID
    zone_name: str
    polygon: dict
    risk_level: str

    model_config = ConfigDict(from_attributes=True)

class WardResponse(BaseModel):
    id: uuid.UUID
    zone_id: uuid.UUID
    ward_name: str

    model_config = ConfigDict(from_attributes=True)

class WardDetailResponse(BaseModel):
    id: uuid.UUID
    ward_name: str
    zone_id: uuid.UUID
    zone_name: str
    city_id: uuid.UUID
    city_name: str
    district_id: uuid.UUID
    district_name: str
    state_id: uuid.UUID
    state_name: str

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_relations(cls, data):
        if not isinstance(data, dict):
            # Resolve from SQLAlchemy object attributes
            zone_obj = getattr(data, "zone", None)
            if zone_obj:
                data.zone_name = getattr(zone_obj, "zone_name", "")
                city_obj = getattr(zone_obj, "city", None)
                if city_obj:
                    data.city_id = getattr(city_obj, "id", None)
                    data.city_name = getattr(city_obj, "city_name", "")
                    district_obj = getattr(city_obj, "district", None)
                    if district_obj:
                        data.district_id = getattr(district_obj, "id", None)
                        data.district_name = getattr(district_obj, "district_name", "")
                        state_obj = getattr(district_obj, "state", None)
                        if state_obj:
                            data.state_id = getattr(state_obj, "id", None)
                            data.state_name = getattr(state_obj, "state_name", "")
        return data

class DigitalTwinNodeResponse(BaseModel):
    id: uuid.UUID
    state_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    name: str
    type: str
    level: Optional[str] = None
    status: str
    latitude: float
    longitude: float
    last_telemetry: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class NodeConnectionResponse(BaseModel):
    id: uuid.UUID
    from_node_id: uuid.UUID
    to_node_id: uuid.UUID
    status: str
    latency_ms: int

    model_config = ConfigDict(from_attributes=True)

class NodeConnectionDetailResponse(BaseModel):
    id: uuid.UUID
    from_node: DigitalTwinNodeResponse
    to_node: DigitalTwinNodeResponse
    status: str
    latency_ms: int

    model_config = ConfigDict(from_attributes=True)

class TelemetryRecordResponse(BaseModel):
    id: uuid.UUID
    node_id: uuid.UUID
    metric_type: str
    value: float
    unit: Optional[str] = None
    status: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class DigitalTwinSummaryResponse(BaseModel):
    total_nodes: int
    active_nodes: int
    total_connections: int
    active_connections: int
    health_status_counts: dict

    model_config = ConfigDict(from_attributes=True)

class PaginatedNodeResponse(BaseModel):
    items: List[DigitalTwinNodeResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)

class PaginatedConnectionResponse(BaseModel):
    items: List[NodeConnectionResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)

class PaginatedTelemetryResponse(BaseModel):
    items: List[TelemetryRecordResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)
