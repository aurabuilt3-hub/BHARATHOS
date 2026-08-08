from pydantic import BaseModel, EmailStr, ConfigDict, Field
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
