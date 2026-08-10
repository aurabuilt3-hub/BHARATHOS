import re
from datetime import datetime, UTC
from typing import Dict, Any, Optional
from app.ingestion.models import NormalizedFacility

class FacilityNormalizer:
    @staticmethod
    def normalize_name(name: str) -> str:
        if not name:
            return ""
        # Remove extra whitespace
        name = re.sub(r'\s+', ' ', name).strip()
        return name

    @staticmethod
    def normalize_facility_type(raw_type: str) -> str:
        cleaned = str(raw_type).strip().upper()
        if cleaned in ("POLICE", "POLICE_STATION", "POLICE STATION"):
            return "POLICE_STATION"
        if cleaned in ("FIRE", "FIRE_STATION", "FIRE STATION", "FIRE & EMERGENCY"):
            return "FIRE_STATION"
        if cleaned in ("HOSPITAL", "GOVERNMENT HOSPITAL", "CLINIC"):
            return "HOSPITAL"
        if cleaned in ("AMBULANCE", "AMBULANCE_BASE", "AMBULANCE BASE"):
            return "AMBULANCE_BASE"
        if cleaned in ("EMERGENCY_FACILITY", "EMERGENCY FACILITY", "DISASTER"):
            return "EMERGENCY_FACILITY"
        return "OTHER"

    @staticmethod
    def normalize_phone(phone: Optional[str]) -> Optional[str]:
        if not phone:
            return None
        # Clean spacing and punctuation
        phone = re.sub(r'\s+', ' ', phone).strip()
        return phone

    @staticmethod
    def normalize_address(address: Optional[str]) -> Optional[str]:
        if not address:
            return None
        return re.sub(r'\s+', ' ', address).strip()

    @classmethod
    def to_normalized_facility(cls, raw_record: Dict[str, Any]) -> NormalizedFacility:
        raw_name = raw_record.get("name") or raw_record.get("original_name") or ""
        normalized_name = cls.normalize_name(raw_name)
        
        raw_type = raw_record.get("facility_type") or raw_record.get("original_category") or "OTHER"
        normalized_type = cls.normalize_facility_type(raw_type)

        lat = float(raw_record.get("latitude", 0.0))
        lon = float(raw_record.get("longitude", 0.0))
        
        verified_at_val = raw_record.get("verified_at")
        if verified_at_val:
            if isinstance(verified_at_val, str):
                try:
                    verified_at = datetime.fromisoformat(verified_at_val.replace("Z", "+00:00"))
                except ValueError:
                    verified_at = datetime.now(UTC)
            else:
                verified_at = verified_at_val
        else:
            verified_at = datetime.now(UTC)

        return NormalizedFacility(
            name=normalized_name,
            facility_type=normalized_type,
            address=cls.normalize_address(raw_record.get("address")),
            phone=cls.normalize_phone(raw_record.get("phone")),
            latitude=lat,
            longitude=lon,
            state_name=raw_record.get("state_name", "Andhra Pradesh"),
            district_name=raw_record.get("district_name", "Visakhapatnam"),
            city_name=raw_record.get("city_name", "Visakhapatnam"),
            zone_name=raw_record.get("zone_name"),
            ward_name=raw_record.get("ward_name"),
            source_type=raw_record.get("source_type", "SIMULATED"),
            source_name=raw_record.get("source_name", "Unknown Source"),
            source_url=raw_record.get("source_url", "https://bharatos.gov.in"),
            verified_at=verified_at,
            extra_data=raw_record.get("extra_data", {}),
        )
