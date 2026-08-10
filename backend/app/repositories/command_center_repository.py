from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.models import DigitalTwinNode, Incident, Resource

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

class CommandCenterRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_command_centers(
        self,
        *,
        page: int = 1,
        limit: int = DEFAULT_LIMIT,
        state_id: Optional[str] = None,
        city_id: Optional[str] = None,
    ) -> List[DigitalTwinNode]:
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT
        offset = (page - 1) * limit
        stmt = select(DigitalTwinNode).where(DigitalTwinNode.type == "command_center")
        if state_id:
            stmt = stmt.where(DigitalTwinNode.state_id == state_id)
        if city_id:
            stmt = stmt.where(DigitalTwinNode.city_id == city_id)
        stmt = stmt.offset(offset).limit(limit)
        return self.db.execute(stmt).scalars().all()

    def get_command_center(self, command_center_id: str) -> Optional[DigitalTwinNode]:
        stmt = select(DigitalTwinNode).where(
            DigitalTwinNode.id == command_center_id,
            DigitalTwinNode.type == "command_center",
        )
        return self.db.execute(stmt).scalar_one_or_none()

    # Summary helpers – actual aggregation queries
    def get_summary(self, command_center_id: str) -> dict:
        # Active incidents linked to the command center's geographic scope
        # For simplicity, we consider incidents within the same state/city as the command center.
        stmt_active_incidents = (
            select(func.count(Incident.id))
            .join(Incident.zone)
            .join(Incident.zone.city)
            .where(
                Incident.status != "resolved",
                Incident.zone_id != None,
                Incident.zone.has(DigitalTwinNode.state_id == command_center_id)  # placeholder logic
            )
        )
        # Resource counts by status within the same scope
        stmt_resource_counts = (
            select(Resource.status, func.count(Resource.id))
            .where(
                Resource.city_id == command_center_id  # placeholder – real logic would match geography
            )
            .group_by(Resource.status)
        )
        active_incidents = self.db.execute(stmt_active_incidents).scalar_one()
        resource_counts = dict(self.db.execute(stmt_resource_counts).all())
        return {
            "active_incidents": active_incidents,
            "resource_counts": resource_counts,
        }

