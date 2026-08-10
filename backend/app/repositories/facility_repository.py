from typing import List, Optional, Any, Dict
from sqlalchemy import select, func
from sqlalchemy.orm import Session
import uuid

from app.models.models import Facility, City

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

class FacilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_facilities(
        self,
        *,
        page: int = 1,
        limit: int = DEFAULT_LIMIT,
        facility_type: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        ward_id: Optional[str] = None,
        source_type: Optional[str] = None,
    ) -> List[Facility]:
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT
        offset = (page - 1) * limit

        stmt = select(Facility)

        if facility_type:
            stmt = stmt.where(Facility.facility_type == facility_type)
        if state_id:
            stmt = stmt.where(Facility.state_id == uuid.UUID(state_id))
        if district_id:
            stmt = stmt.where(Facility.district_id == uuid.UUID(district_id))
        if city_id:
            stmt = stmt.where(Facility.city_id == uuid.UUID(city_id))
        if zone_id:
            stmt = stmt.where(Facility.zone_id == uuid.UUID(zone_id))
        if ward_id:
            stmt = stmt.where(Facility.ward_id == uuid.UUID(ward_id))
        if source_type:
            stmt = stmt.where(Facility.source_type == source_type)

        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def get_facility(self, facility_id: str) -> Optional[Facility]:
        try:
            val = uuid.UUID(facility_id)
        except ValueError:
            return None
        return self.db.get(Facility, val)

    def create_facility(self, *, data: Dict[str, Any]) -> Facility:
        facility = Facility(
            name=data["name"],
            facility_type=data["facility_type"],
            address=data.get("address"),
            phone=data.get("phone"),
            latitude=data["latitude"],
            longitude=data["longitude"],
            state_id=uuid.UUID(data["state_id"]) if data.get("state_id") else None,
            district_id=uuid.UUID(data["district_id"]) if data.get("district_id") else None,
            city_id=uuid.UUID(data["city_id"]) if data.get("city_id") else None,
            zone_id=uuid.UUID(data["zone_id"]) if data.get("zone_id") else None,
            ward_id=uuid.UUID(data["ward_id"]) if data.get("ward_id") else None,
            source_type=data.get("source_type", "SIMULATED"),
            source_name=data.get("source_name"),
            source_url=data.get("source_url"),
            verified_at=data.get("verified_at"),
            extra_data=data.get("extra_data"),
        )
        self.db.add(facility)
        self.db.commit()
        self.db.refresh(facility)
        return facility

    def update_facility(self, facility: Facility, *, data: Dict[str, Any]) -> Facility:
        for key, val in data.items():
            if val is not None:
                if key in ("state_id", "district_id", "city_id", "zone_id", "ward_id"):
                    setattr(facility, key, uuid.UUID(val) if val else None)
                else:
                    setattr(facility, key, val)
        self.db.commit()
        self.db.refresh(facility)
        return facility

    def count_facilities(
        self,
        *,
        facility_type: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        ward_id: Optional[str] = None,
        source_type: Optional[str] = None,
    ) -> int:
        stmt = select(func.count(Facility.id))
        if facility_type:
            stmt = stmt.where(Facility.facility_type == facility_type)
        if state_id:
            stmt = stmt.where(Facility.state_id == uuid.UUID(state_id))
        if district_id:
            stmt = stmt.where(Facility.district_id == uuid.UUID(district_id))
        if city_id:
            stmt = stmt.where(Facility.city_id == uuid.UUID(city_id))
        if zone_id:
            stmt = stmt.where(Facility.zone_id == uuid.UUID(zone_id))
        if ward_id:
            stmt = stmt.where(Facility.ward_id == uuid.UUID(ward_id))
        if source_type:
            stmt = stmt.where(Facility.source_type == source_type)
        return self.db.execute(stmt).scalar_one()

    def filter_by_type(self, facility_type: str, page: int = 1, limit: int = DEFAULT_LIMIT) -> List[Facility]:
        return self.list_facilities(facility_type=facility_type, page=page, limit=limit)

    def filter_by_city(self, city_id: str, page: int = 1, limit: int = DEFAULT_LIMIT) -> List[Facility]:
        return self.list_facilities(city_id=city_id, page=page, limit=limit)

    def filter_by_district(self, district_id: str, page: int = 1, limit: int = DEFAULT_LIMIT) -> List[Facility]:
        return self.list_facilities(district_id=district_id, page=page, limit=limit)

    def filter_by_state(self, state_id: str, page: int = 1, limit: int = DEFAULT_LIMIT) -> List[Facility]:
        return self.list_facilities(state_id=state_id, page=page, limit=limit)
