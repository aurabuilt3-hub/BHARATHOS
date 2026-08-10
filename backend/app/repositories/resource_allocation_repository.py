from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func

from app.models.models import ResourceAllocation, Incident, Resource, User

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

class ResourceAllocationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_allocation(self, *, incident_id: str, resource_id: str, assigned_by_id: str) -> ResourceAllocation:
        allocation = ResourceAllocation(
            incident_id=incident_id,
            resource_id=resource_id,
            assigned_by_id=assigned_by_id,
            status="allocated",
        )
        self.db.add(allocation)
        self.db.flush()  # get allocation.id if needed
        return allocation

    def get_allocation(self, allocation_id: str) -> Optional[ResourceAllocation]:
        return self.db.get(ResourceAllocation, allocation_id)

    def list_incident_allocations(
        self,
        incident_id: str,
        *,
        page: int = 1,
        limit: int = DEFAULT_LIMIT,
    ) -> List[ResourceAllocation]:
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT
        offset = (page - 1) * limit
        stmt = (
            select(ResourceAllocation)
            .where(ResourceAllocation.incident_id == incident_id)
            .order_by(ResourceAllocation.assigned_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return self.db.execute(stmt).scalars().all()

    def get_active_allocation(self, resource_id: str) -> Optional[ResourceAllocation]:
        stmt = (
            select(ResourceAllocation)
            .where(
                and_(
                    ResourceAllocation.resource_id == resource_id,
                    ResourceAllocation.status == "allocated",
                    ResourceAllocation.released_at.is_(None),
                )
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def release_allocation(self, allocation_id: str) -> ResourceAllocation:
        allocation = self.get_allocation(allocation_id)
        if allocation is None:
            raise ValueError("Allocation not found")
        allocation.released_at = func.now()
        allocation.status = "released"
        self.db.commit()
        self.db.refresh(allocation)
        return allocation

    def count_active_allocations(self, **filters) -> int:
        stmt = select(func.count()).select_from(ResourceAllocation).where(ResourceAllocation.status == "allocated")
        # Apply optional filters (e.g., incident_id, resource_id)
        if "incident_id" in filters:
            stmt = stmt.where(ResourceAllocation.incident_id == filters["incident_id"])
        if "resource_id" in filters:
            stmt = stmt.where(ResourceAllocation.resource_id == filters["resource_id"])
        result = self.db.execute(stmt).scalar_one()
        return result
