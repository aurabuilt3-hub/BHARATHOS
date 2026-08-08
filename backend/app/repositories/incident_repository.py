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
    def list_all(
        db: Session,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        zone_id: Optional[uuid.UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Incident]:
        query = db.query(Incident)
        if category:
            query = query.filter(Incident.category == category)
        if severity:
            query = query.filter(Incident.severity == severity)
        if status:
            query = query.filter(Incident.status == status)
        if zone_id:
            query = query.filter(Incident.zone_id == zone_id)

        return query.order_by(desc(Incident.created_at)).offset(offset).limit(limit).all()

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
