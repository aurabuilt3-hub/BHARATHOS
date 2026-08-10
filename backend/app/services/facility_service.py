import uuid
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status

from app.models.models import Facility, User
from app.repositories.facility_repository import FacilityRepository
from app.dependencies.auth import verify_geographic_scope
from app.repositories.incident_repository import IncidentRepository  # For log_audit

ALLOWED_MODIFY_ROLES = {
    "dept_head",
    "state_admin",
    "admin",
    "national_admin",
}

def _has_modify_permission(user: User) -> bool:
    role = user.role.role_name if user.role else "citizen"
    return role in ALLOWED_MODIFY_ROLES

class FacilityService:
    @staticmethod
    def _enforce_scope(
        user: User,
        target_state_id: Any = None,
        target_district_id: Any = None,
        target_city_id: Any = None,
        db: Any = None,
    ) -> None:
        if not verify_geographic_scope(
            user=user,
            target_state_id=target_state_id,
            target_district_id=target_district_id,
            target_city_id=target_city_id,
            db=db,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")

    @staticmethod
    def list_facilities(db, user: User, **filters) -> List[Facility]:
        state_id = filters.get("state_id")
        district_id = filters.get("district_id")
        city_id = filters.get("city_id")

        # Enforce scope on filters passed
        FacilityService._enforce_scope(user, state_id, district_id, city_id, db)

        # Restract scoped operators to their scope if no filter is passed
        role_name = user.role.role_name if user.role else "citizen"
        if role_name not in ("national_admin", "admin"):
            if user.city_id:
                if city_id and str(city_id) != str(user.city_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["city_id"] = str(user.city_id)
            elif user.district_id:
                if district_id and str(district_id) != str(user.district_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["district_id"] = str(user.district_id)
            elif user.state_id:
                if state_id and str(state_id) != str(user.state_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["state_id"] = str(user.state_id)
            else:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: no geographic scope")

        return FacilityRepository(db).list_facilities(**filters)

    @staticmethod
    def get_facility(db, user: User, facility_id: str) -> Facility:
        facility = FacilityRepository(db).get_facility(facility_id)
        if not facility:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

        FacilityService._enforce_scope(
            user,
            target_state_id=facility.state_id,
            target_district_id=facility.district_id,
            target_city_id=facility.city_id,
            db=db,
        )
        return facility

    @staticmethod
    def create_facility(db, user: User, data: Dict[str, Any]) -> Facility:
        if not _has_modify_permission(user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to create facilities")

        city_id = data.get("city_id")
        district_id = data.get("district_id")
        state_id = data.get("state_id")

        FacilityService._enforce_scope(user, state_id, district_id, city_id, db)

        facility = FacilityRepository(db).create_facility(data=data)

        # Log audit
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="FACILITY_CREATED",
            table_name="facilities",
            record_id=facility.id,
            new_values=data,
        )
        return facility

    @staticmethod
    def update_facility(db, user: User, facility_id: str, data: Dict[str, Any]) -> Facility:
        if not _has_modify_permission(user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to update facilities")

        facility = FacilityRepository(db).get_facility(facility_id)
        if not facility:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

        # Verify scope on existing facility
        FacilityService._enforce_scope(
            user,
            target_state_id=facility.state_id,
            target_district_id=facility.district_id,
            target_city_id=facility.city_id,
            db=db,
        )

        # Verify scope on new target locations if updated
        new_city_id = data.get("city_id", facility.city_id)
        new_district_id = data.get("district_id", facility.district_id)
        new_state_id = data.get("state_id", facility.state_id)

        FacilityService._enforce_scope(user, new_state_id, new_district_id, new_city_id, db)

        updated_facility = FacilityRepository(db).update_facility(facility, data=data)

        # Log audit
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="FACILITY_UPDATED",
            table_name="facilities",
            record_id=facility.id,
            new_values=data,
        )
        return updated_facility

    @staticmethod
    def count_facilities(db, user: User, **filters) -> int:
        state_id = filters.get("state_id")
        district_id = filters.get("district_id")
        city_id = filters.get("city_id")

        FacilityService._enforce_scope(user, state_id, district_id, city_id, db)

        # Retract scope
        role_name = user.role.role_name if user.role else "citizen"
        if role_name not in ("national_admin", "admin"):
            if user.city_id:
                filters["city_id"] = str(user.city_id)
            elif user.district_id:
                filters["district_id"] = str(user.district_id)
            elif user.state_id:
                filters["state_id"] = str(user.state_id)
            else:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: no geographic scope")

        return FacilityRepository(db).count_facilities(**filters)
