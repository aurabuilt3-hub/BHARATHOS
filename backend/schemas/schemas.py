from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

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

class RoleResponse(BaseModel):
    id: uuid.UUID
    role_name: str

    model_config = ConfigDict(from_attributes=True)

class ProfileCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    role_name: str  # citizen, officer, dept_head, admin
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

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
