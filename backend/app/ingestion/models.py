from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class NormalizedFacility(BaseModel):
    name: str
    facility_type: str
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    
    state_name: str = "Andhra Pradesh"
    district_name: str = "Visakhapatnam"
    city_name: str = "Visakhapatnam"
    zone_name: Optional[str] = None
    ward_name: Optional[str] = None
    
    source_type: str  # OFFICIAL_PUBLIC, OPEN_DATA, VERIFIED_PUBLIC, SIMULATED
    source_name: str
    source_url: str
    verified_at: datetime = Field(default_factory=datetime.utcnow)
    extra_data: Optional[Dict[str, Any]] = None
