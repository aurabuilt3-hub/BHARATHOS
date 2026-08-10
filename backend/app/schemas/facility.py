import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class FacilityCreate(BaseModel):
    name: str
    facility_type: str  # e.g., POLICE_STATION, FIRE_STATION, HOSPITAL, AMBULANCE_BASE, EMERGENCY_FACILITY, OTHER
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    state_id: Optional[uuid.UUID] = None
    district_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    zone_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    source_type: str = "SIMULATED"  # e.g., OFFICIAL_PUBLIC, OPEN_DATA, VERIFIED_PUBLIC, SIMULATED
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verified_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    facility_type: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    state_id: Optional[uuid.UUID] = None
    district_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    zone_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    source_type: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verified_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class FacilityResponse(BaseModel):
    id: uuid.UUID
    name: str
    facility_type: str
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    state_id: Optional[uuid.UUID] = None
    district_id: Optional[uuid.UUID] = None
    city_id: Optional[uuid.UUID] = None
    zone_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    source_type: str
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verified_at: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedFacilityResponse(BaseModel):
    items: List[FacilityResponse]
    page: int
    limit: int
    total: int

    model_config = ConfigDict(from_attributes=True)
