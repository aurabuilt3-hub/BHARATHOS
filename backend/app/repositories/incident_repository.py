import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Incident, IncidentImage, IncidentAssignment, AuditLog
from app.schemas.schemas import IncidentCreate, IncidentAssignRequest

class IncidentRepository:
    @staticmethod
    def create(
        db: Session,
        data: IncidentCreate,
        ticket_number: str,
        citizen_id: Optional[uuid.UUID]
    ) -> Incident:
        incident = Incident(
            id=uuid.uuid4(),
            ticket_number=ticket_number,
            citizen_id=citizen_id,
            category=data.category,
            title=data.title,
            description=data.description,
            latitude=data.latitude,
            longitude=data.longitude,
            address=data.address,
            severity=data.severity or "medium",
            status="active",
            zone_id=data.zone_id,
            ward_id=data.ward_id
        )
        db.add(incident)
        db.flush()

        if data.image_urls:
            for url in data.image_urls:
                img = IncidentImage(
                    id=uuid.uuid4(),
                    incident_id=incident.id,
                    image_url=url
                )
                db.add(img)

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_by_id(db: Session, incident_id: uuid.UUID) -> Optional[Incident]:
        return db.query(Incident).filter(Incident.id == incident_id).first()

    @staticmethod
    def list_filtered(
        db: Session,
        user: "User",
        filters: dict,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[List[Incident], int]:
        """Return incidents matching filters, respecting user geographic scope, and total count.
        `filters` may include category, severity, status, zone_id, ward_id, state_id, district_id, city_id, department_id, date_from, date_to.
        Returns (items, total).
        """
        query = db.query(Incident)
        # Apply filters
        if filters.get("category"):
            query = query.filter(Incident.category == filters["category"])
        if filters.get("severity"):
            query = query.filter(Incident.severity == filters["severity"])
        if filters.get("status"):
            query = query.filter(Incident.status == filters["status"])
        if filters.get("zone_id"):
            query = query.filter(Incident.zone_id == filters["zone_id"])
        if filters.get("ward_id"):
            query = query.filter(Incident.ward_id == filters["ward_id"])
        if filters.get("department_id"):
            query = query.filter(Incident.department_id == filters["department_id"])
        if filters.get("date_from"):
            query = query.filter(Incident.created_at >= filters["date_from"])
        if filters.get("date_to"):
            query = query.filter(Incident.created_at <= filters["date_to"])

        # Geographic scope enforcement for non‑admin users
        role_name = user.role.role_name if user.role else "citizen"
        if role_name not in ("admin", "national_admin"):
            # resolve incident hierarchy ids via joins
            # Join to Zone -> City -> District -> State when needed
            if filters.get("state_id"):
                query = query.join(Incident.zone).join(Zone.city).join(City.district).filter(State.id == filters["state_id"])
            if filters.get("district_id"):
                query = query.join(Incident.zone).join(Zone.city).join(City.district).filter(District.id == filters["district_id"])
            if filters.get("city_id"):
                query = query.join(Incident.zone).join(Zone.city).filter(City.id == filters["city_id"])

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(desc(Incident.created_at)).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def list_all(
        db: Session,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        zone_id: Optional[uuid.UUID] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Incident]:
        """Legacy wrapper used by the service layer. Applies simple filters without
        user‑scope enforcement. This method exists to maintain backward compatibility
        with existing code that expects `IncidentRepository.list_all`.
        """
        query = db.query(Incident)
        if category:
            query = query.filter(Incident.category == category)
        if severity:
            query = query.filter(Incident.severity == severity)
        if status:
            query = query.filter(Incident.status == status)
        if zone_id:
            query = query.filter(Incident.zone_id == zone_id)
        # Apply pagination using limit/offset semantics
        query = query.order_by(desc(Incident.created_at)).offset(offset).limit(limit)
        return query.all()

    @staticmethod
    def update_status(db: Session, incident: Incident, new_status: str) -> Incident:
        incident.status = new_status
        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def assign_department(
        db: Session,
        incident: Incident,
        assign_req: IncidentAssignRequest,
        assigned_by_id: Optional[uuid.UUID]
    ) -> IncidentAssignment:
        incident.department_id = assign_req.department_id
        incident.status = "assigned"
        
        assignment = IncidentAssignment(
            id=uuid.uuid4(),
            incident_id=incident.id,
            department_id=assign_req.department_id,
            assigned_officer_id=assign_req.assigned_officer_id,
            assigned_by_id=assigned_by_id,
            notes=assign_req.notes,
            status="assigned"
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def delete(db: Session, incident: Incident) -> None:
        db.delete(incident)
        db.commit()

    @staticmethod
    def log_audit(
        db: Session,
        user_id: Optional[uuid.UUID],
        action: str,
        table_name: str,
        record_id: Optional[uuid.UUID],
        new_values: Optional[dict] = None
    ) -> None:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            new_values=new_values
        )
        db.add(audit)
        db.commit()
