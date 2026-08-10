import uuid
from typing import List, Dict, Any
from fastapi import HTTPException, status

from sqlalchemy import select, func, and_, or_, join

from app.models.models import DigitalTwinNode, Incident, Resource, ResourceAllocation, User, City, State
from app.repositories.command_center_repository import CommandCenterRepository
from app.dependencies.auth import verify_geographic_scope

# Roles that can bypass geographic restrictions for command centers
ADMIN_ROLES = {"admin", "national_admin"}

class CommandCenterService:
    @staticmethod
    def _enforce_scope(user: User, target_state_id: Any = None, target_city_id: Any = None, db: Any = None) -> None:
        """Raise 403 if the user is not authorized for the given geographic scope.
        Admin/National admins are allowed unrestricted access.
        """
        role_name = user.role.role_name if user.role else "citizen"
        if role_name in ADMIN_ROLES:
            return
        if not verify_geographic_scope(
            user=user,
            target_state_id=target_state_id,
            target_city_id=target_city_id,
            db=db,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of geographic scope")

    @staticmethod
    def list_command_centers(
        db,
        user: User,
        *,
        page: int = 1,
        limit: int = 20,
        state_id: Any = None,
        city_id: Any = None,
    ) -> List[DigitalTwinNode]:
        """Return paginated command‑center nodes with optional geography filtering.
        Admin / national_admin can view all; other roles are scoped.
        """
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page must be >= 1")
        if not (1 <= limit <= 100):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="limit must be between 1 and 100")
        # Enforce geographic scope first – helpers expect the *requested* scope.
        CommandCenterService._enforce_scope(user, target_state_id=state_id, target_city_id=city_id, db=db)
        repo = CommandCenterRepository(db)
        return repo.list_command_centers(page=page, limit=limit, state_id=state_id, city_id=city_id)

    @staticmethod
    def get_command_center(db, user: User, command_center_id: str) -> DigitalTwinNode:
        """Fetch a single command‑center node, validating type and scope.
        """
        repo = CommandCenterRepository(db)
        node = repo.get_command_center(command_center_id)
        if not node:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Command center not found")
        # Verify the node is indeed a command_center (repository already filters, but double‑check for safety)
        if node.type != "command_center":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource is not a command center")
        # Scope check based on the node's location
        CommandCenterService._enforce_scope(
            user,
            target_state_id=node.state_id,
            target_city_id=node.city_id,
            db=db,
        )
        return node

    @staticmethod
    def get_command_center_summary(db, user: User, command_center_id: str) -> Dict[str, Any]:
        """Generate a real‑time summary for the given command‑center.
        The summary is limited to the geographic scope of the command center (state/city).
        """
        # Authorize and fetch the node
        node = CommandCenterService.get_command_center(db, user, command_center_id)

        # Determine scope predicates
        scope_predicates_incident = []
        scope_predicates_resource = []
        scope_predicates_allocation = []
        if node.city_id:
            # City‑level scope – join through City for incidents & resources
            scope_predicates_incident.append(Incident.zone.has(DigitalTwinNode.city_id == node.city_id))
            scope_predicates_resource.append(Resource.city_id == node.city_id)
            scope_predicates_allocation.append(Resource.city_id == node.city_id)
        elif node.state_id:
            # State‑level scope – need to join City to filter by state
            # Incidents: Incident.zone -> City -> State
            scope_predicates_incident.append(
                Incident.zone.has(
                    join(City, Incident.zone.city_id == City.id).where(City.state_id == node.state_id)
                )
            )
            # Resources: join City
            scope_predicates_resource.append(
                join(City, Resource.city_id == City.id).where(City.state_id == node.state_id)
            )
            scope_predicates_allocation.append(
                join(City, Resource.city_id == City.id).where(City.state_id == node.state_id)
            )
        # ---- Incident counts ----
        # Active incidents (status not resolved/closed)
        stmt_active_incidents = (
            select(func.count(Incident.id))
            .where(
                and_(
                    *scope_predicates_incident,
                    Incident.status.notin_(["resolved", "closed"]),
                )
            )
        )
        active_incidents = db.execute(stmt_active_incidents).scalar_one()
        # Total incidents (any status)
        stmt_total_incidents = (
            select(func.count(Incident.id))
            .where(and_(*scope_predicates_incident))
        )
        total_incidents = db.execute(stmt_total_incidents).scalar_one()
        # ---- Resource counts ----
        # Group by status
        stmt_resource_counts = (
            select(Resource.status, func.count(Resource.id))
            .where(and_(*scope_predicates_resource))
            .group_by(Resource.status)
        )
        resource_counts_raw = db.execute(stmt_resource_counts).all()
        resource_counts = {status: count for status, count in resource_counts_raw}
        # Ensure all expected statuses appear (default 0)
        for s in ["available", "allocated", "deployed", "busy"]:
            resource_counts.setdefault(s, 0)
        total_resources = sum(resource_counts.values())
        # ---- Allocation counts ----
        # Active allocations are those without a released_at timestamp
        stmt_active_alloc = (
            select(func.count(ResourceAllocation.id))
            .join(Resource, ResourceAllocation.resource_id == Resource.id)
            .where(
                and_(
                    ResourceAllocation.released_at.is_(None),
                    *scope_predicates_allocation,
                )
            )
        )
        active_allocations = db.execute(stmt_active_alloc).scalar_one()

        summary = {
            "command_center_id": str(node.id),
            "command_center_name": node.name,
            "active_incidents": active_incidents,
            "total_incidents": total_incidents,
            "resources_by_status": resource_counts,
            "available_resources": resource_counts["available"],
            "allocated_resources": resource_counts["allocated"],
            "deployed_resources": resource_counts["deployed"],
            "busy_resources": resource_counts["busy"],
            "total_resources": total_resources,
            "active_resource_allocations": active_allocations,
        }
        return summary

    # Helper method for future extensions – not part of the spec but kept for parity with other services
    @staticmethod
    def count_by_status(db) -> Dict[str, int]:
        # This mirrors ResourceRepository's count_by_status but scoped to command centers if needed.
        # Not used directly in the current Phase 7 implementation.
        return {}
