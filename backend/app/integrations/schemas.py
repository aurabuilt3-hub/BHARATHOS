from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

class NormalizedWeather(BaseModel):
    temperature: float
    humidity: float
    precipitation: float
    wind_speed: float
    weather_code: Optional[int] = None
    
    source_type: str = "OPEN_DATA"
    source_name: str = "Open-Meteo"
    source_url: str = "https://api.open-meteo.com/v1/forecast"
    source_record_id: Optional[str] = None
    observed_at: datetime
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
    
    raw_metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class NormalizedAirQuality(BaseModel):
    us_aqi: float
    pm2_5: float
    pm10: float
    nitrogen_dioxide: Optional[float] = None
    ozone: Optional[float] = None
    
    source_type: str = "OPEN_DATA"
    source_name: str = "Open-Meteo"
    source_url: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    source_record_id: Optional[str] = None
    observed_at: datetime
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
    
    raw_metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class NormalizedFacility(BaseModel):
    name: str
    facility_type: str
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    
    source_type: str
    source_name: str
    source_url: str
    source_record_id: str
    observed_at: datetime
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
    
    original_name: Optional[str] = None
    original_category: Optional[str] = None
    raw_metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
