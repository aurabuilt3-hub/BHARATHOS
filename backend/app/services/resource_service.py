import uuid
from typing import List, Dict, Any
from fastapi import HTTPException, status

from app.models.models import Resource, Incident, ResourceAllocation, User
from app.repositories.resource_repository import ResourceRepository
from app.repositories.resource_allocation_repository import ResourceAllocationRepository
from app.repositories.incident_repository import IncidentRepository
from app.dependencies.auth import verify_geographic_scope

# Allowed roles for resource modification
ALLOWED_MODIFY_ROLES = {
    "dept_head",
    "state_admin",
    "admin",
    "national_admin",
}

# Lifecycle order (circular)
LIFECYCLE = ["available", "allocated", "deployed", "busy", "available"]

def _has_modify_permission(user: User) -> bool:
    role = user.role.role_name if user.role else "citizen"
    return role in ALLOWED_MODIFY_ROLES

def _validate_status_transition(current: str, new: str) -> None:
    """Validate that a status transition follows the allowed lifecycle.
    Raises HTTP 409 on invalid transition.
    """
    if current == new:
        return
    try:
        cur_idx = LIFECYCLE.index(current)
        new_idx = LIFECYCLE.index(new)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource status value",
        )
    # Allow only forward step (including wrap‑around to the first element)
    if (new_idx - cur_idx) % len(LIFECYCLE) != 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition from '{current}' to '{new}'",
        )

class ResourceService:
    @staticmethod
    def _enforce_scope(user: User, target_state_id: Any = None, target_district_id: Any = None, target_city_id: Any = None, db: Any = None) -> None:
        if not verify_geographic_scope(
            user=user,
            target_state_id=target_state_id,
            target_district_id=target_district_id,
            target_city_id=target_city_id,
            db=db,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of geographic scope")

    @staticmethod
    def list_resources(db, user: User, **filters) -> List[Resource]:
        """List resources enforcing geographic scope based on filter parameters.
        """
        state_id = filters.get("state_id")
        district_id = filters.get("district_id")
        city_id = filters.get("city_id")
        ResourceService._enforce_scope(user, state_id, district_id, city_id, db)
        return ResourceRepository(db).list_resources(**filters)

    @staticmethod
    def get_resource(db, user: User, resource_id: str) -> Resource:
        resource = ResourceRepository(db).get_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        ResourceService._enforce_scope(
            user,
            target_state_id=resource.city.district.state_id if resource.city and resource.city.district else None,
            target_district_id=resource.city.district_id if resource.city else None,
            target_city_id=resource.city_id,
            db=db,
        )
        return resource

    @staticmethod
    def create_resource(db, user: User, **data) -> Resource:
        if not _has_modify_permission(user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to create resources")
        city_id = data.get("city_id")
        # Scope validation uses city_id directly; verify_geographic_scope will handle hierarchy.
        ResourceService._enforce_scope(user, target_city_id=city_id, db=db)
        resource = ResourceRepository(db).create_resource(**data)
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="RESOURCE_CREATED",
            table_name="resources",
            record_id=resource.id,
            new_values=data,
        )
        return resource

    @staticmethod
    def update_resource(db, user: User, resource_id: str, **updates) -> Resource:
        if not _has_modify_permission(user):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to update resources")
        resource = ResourceRepository(db).get_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        ResourceService._enforce_scope(
            user,
            target_state_id=resource.city.district.state_id if resource.city and resource.city.district else None,
            target_district_id=resource.city.district_id if resource.city else None,
            target_city_id=resource.city_id,
            db=db,
        )
        if "status" in updates:
            _validate_status_transition(resource.status, updates["status"])
        resource = ResourceRepository(db).update_resource(resource, **updates)
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="RESOURCE_UPDATED",
            table_name="resources",
            record_id=resource.id,
            new_values=updates,
        )
        return resource

    @staticmethod
    def list_incident_resources(db, user: User, incident_id: str) -> List[Resource]:
        incident = IncidentRepository.get_by_id(db, uuid.UUID(incident_id))
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        ResourceService._enforce_scope(
            user,
            target_state_id=incident.zone.state_id if incident.zone else None,
            target_district_id=None,
            target_city_id=incident.zone.city_id if incident.zone else None,
            db=db,
        )
        allocations = ResourceAllocationRepository(db).list_incident_allocations(incident_id=incident.id)
        return [alloc.resource for alloc in allocations]

    @staticmethod
    def allocate_resource(db, incident_id: str, resource_id: str, assigned_by: User) -> ResourceAllocation:
        if not _has_modify_permission(assigned_by):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to allocate resources")
        incident = IncidentRepository.get_by_id(db, uuid.UUID(incident_id))
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        resource = ResourceRepository(db).get_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        # Scope validation for both entities
        ResourceService._enforce_scope(
            assigned_by,
            target_state_id=incident.zone.state_id if incident.zone else None,
            target_district_id=None,
            target_city_id=incident.zone.city_id if incident.zone else None,
            db=db,
        )
        ResourceService._enforce_scope(
            assigned_by,
            target_state_id=resource.city.district.state_id if resource.city and resource.city.district else None,
            target_district_id=resource.city.district_id if resource.city else None,
            target_city_id=resource.city_id,
            db=db,
        )
        if incident.status in ("resolved", "closed"):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot allocate to a closed incident")
        if resource.status != "available":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource not available for allocation")
        if ResourceAllocationRepository(db).get_active_allocation(resource_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource already has an active allocation")
        try:
            allocation = ResourceAllocationRepository(db).create_allocation(
                incident_id=incident.id,
                resource_id=resource.id,
                assigned_by_id=assigned_by.id,
            )
            ResourceRepository(db).update_status(resource, "allocated")
            IncidentRepository.log_audit(
                db=db,
                user_id=assigned_by.id,
                action="RESOURCE_ALLOCATED",
                table_name="resource_allocations",
                record_id=allocation.id,
                new_values={"incident_id": str(incident.id), "resource_id": str(resource.id)},
            )
            db.commit()
            db.refresh(allocation)
            return allocation
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to allocate resource")

    @staticmethod
    def release_resource(db, incident_id: str, resource_id: str, released_by: User) -> ResourceAllocation:
        if not _has_modify_permission(released_by):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role to release resources")
        incident = IncidentRepository.get_by_id(db, uuid.UUID(incident_id))
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        resource = ResourceRepository(db).get_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        # Scope checks for both incident and resource
        ResourceService._enforce_scope(
            released_by,
            target_state_id=incident.zone.state_id if incident.zone else None,
            target_district_id=None,
            target_city_id=incident.zone.city_id if incident.zone else None,
            db=db,
        )
        ResourceService._enforce_scope(
            released_by,
            target_state_id=resource.city.district.state_id if resource.city and resource.city.district else None,
            target_district_id=resource.city.district_id if resource.city else None,
            target_city_id=resource.city_id,
            db=db,
        )
        active_alloc = ResourceAllocationRepository(db).get_active_allocation(resource_id)
        if not active_alloc or active_alloc.incident_id != incident.id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No active allocation for this incident/resource pair")
        try:
            allocation = ResourceAllocationRepository(db).release_allocation(active_alloc.id)
            ResourceRepository(db).update_status(resource, "available")
            IncidentRepository.log_audit(
                db=db,
                user_id=released_by.id,
                action="RESOURCE_RELEASED",
                table_name="resource_allocations",
                record_id=allocation.id,
                new_values={"status": "released"},
            )
            db.commit()
            db.refresh(allocation)
            return allocation
        except Exception:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to release resource")

    @staticmethod
    def count_by_status(db) -> Dict[str, int]:
        return ResourceRepository(db).count_by_status()

    @staticmethod
    def get_available_resources(db, **filters) -> List[Resource]:
        return ResourceRepository(db).get_available_resources(**filters)
