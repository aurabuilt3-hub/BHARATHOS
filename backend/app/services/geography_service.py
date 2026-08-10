import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import User, State, District, City, Zone, Ward
from app.repositories.geography_repository import GeographyRepository

class GeographyService:
    @staticmethod
    def _enforce_scope(
        current_user: User,
        target_state_id: Optional[uuid.UUID] = None,
        target_district_id: Optional[uuid.UUID] = None,
        target_city_id: Optional[uuid.UUID] = None,
        db: Session = None
    ) -> None:
        role_name = current_user.role.role_name if current_user.role else "citizen"
        # Citizens and admins/national admins bypass geographic scope metadata restriction
        if role_name in ("citizen", "admin", "national_admin"):
            return
            
        from app.dependencies.auth import verify_geographic_scope
        if not verify_geographic_scope(
            user=current_user,
            target_state_id=target_state_id,
            target_district_id=target_district_id,
            target_city_id=target_city_id,
            db=db
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: outside geographic scope."
            )

    @classmethod
    def list_states(cls, db: Session, current_user: User, limit: int = 50, offset: int = 0) -> List[State]:
        # Broadly accessible list to authenticated users
        return GeographyRepository.list_states(db, limit, offset)

    @classmethod
    def get_state(cls, db: Session, state_id: uuid.UUID, current_user: User) -> State:
        state = GeographyRepository.get_state_by_id(db, state_id)
        if not state:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"State with ID '{state_id}' not found."
            )
        cls._enforce_scope(current_user, target_state_id=state_id, db=db)
        return state

    @classmethod
    def list_districts_by_state(
        cls, db: Session, state_id: uuid.UUID, current_user: User, limit: int = 50, offset: int = 0
    ) -> List[District]:
        # Verify parent state existence first
        cls.get_state(db, state_id, current_user)
        return GeographyRepository.list_districts_by_state(db, state_id, limit, offset)

    @classmethod
    def get_district(cls, db: Session, district_id: uuid.UUID, current_user: User) -> District:
        district = GeographyRepository.get_district_by_id(db, district_id)
        if not district:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"District with ID '{district_id}' not found."
            )
        cls._enforce_scope(current_user, target_district_id=district_id, db=db)
        return district

    @classmethod
    def list_cities_by_district(
        cls, db: Session, district_id: uuid.UUID, current_user: User, limit: int = 50, offset: int = 0
    ) -> List[City]:
        # Verify parent district existence first
        cls.get_district(db, district_id, current_user)
        return GeographyRepository.list_cities_by_district(db, district_id, limit, offset)

    @classmethod
    def get_city(cls, db: Session, city_id: uuid.UUID, current_user: User) -> City:
        city = GeographyRepository.get_city_by_id(db, city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"City with ID '{city_id}' not found."
            )
        cls._enforce_scope(current_user, target_city_id=city_id, db=db)
        return city

    @classmethod
    def list_zones_by_city(
        cls, db: Session, city_id: uuid.UUID, current_user: User, limit: int = 50, offset: int = 0
    ) -> List[Zone]:
        # Verify parent city existence first
        cls.get_city(db, city_id, current_user)
        return GeographyRepository.list_zones_by_city(db, city_id, limit, offset)

    @classmethod
    def get_zone(cls, db: Session, zone_id: uuid.UUID, current_user: User) -> Zone:
        zone = GeographyRepository.get_zone_by_id(db, zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Zone with ID '{zone_id}' not found."
            )
        cls._enforce_scope(current_user, target_city_id=zone.city_id, db=db)
        return zone

    @classmethod
    def list_wards_by_zone(
        cls, db: Session, zone_id: uuid.UUID, current_user: User, limit: int = 50, offset: int = 0
    ) -> List[Ward]:
        # Verify parent zone existence first
        cls.get_zone(db, zone_id, current_user)
        return GeographyRepository.list_wards_by_zone(db, zone_id, limit, offset)

    @classmethod
    def get_ward(cls, db: Session, ward_id: uuid.UUID, current_user: User) -> Ward:
        ward = GeographyRepository.get_ward_by_id(db, ward_id)
        if not ward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ward with ID '{ward_id}' not found."
            )
        city_id = ward.zone.city_id if (ward.zone and ward.zone.city_id) else None
        cls._enforce_scope(current_user, target_city_id=city_id, db=db)
        return ward
