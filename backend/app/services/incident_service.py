import uuid
import random
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.incident_repository import IncidentRepository
from app.schemas.schemas import IncidentCreate, IncidentAssignRequest, IncidentStatusUpdate
from app.models.models import Incident, IncidentAssignment

class IncidentService:
    @staticmethod
    def _generate_ticket_number(db: Session) -> str:
        count = db.query(Incident).count() + 1
        return f"INC-2026-{count:06d}"

    @classmethod
    def create_incident(
        cls,
        db: Session,
        data: IncidentCreate,
        citizen_id: Optional[uuid.UUID]
    ) -> Incident:
        ticket_number = cls._generate_ticket_number(db)
        incident = IncidentRepository.create(db, data, ticket_number, citizen_id)
        
        IncidentRepository.log_audit(
            db=db,
            user_id=citizen_id,
            action="CREATE_INCIDENT",
            table_name="incidents",
            record_id=incident.id,
            new_values={"ticket_number": ticket_number, "category": data.category}
        )
        return incident

    @classmethod
    def get_incident(cls, db: Session, incident_id: uuid.UUID) -> Incident:
        incident = IncidentRepository.get_by_id(db, incident_id)
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident with ID '{incident_id}' not found."
            )
        return incident

    @classmethod
    def list_incidents(
        cls,
        db: Session,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        zone_id: Optional[uuid.UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Incident]:
        return IncidentRepository.list_all(db, category, severity, status, zone_id, limit, offset)

    @classmethod
    def update_status(
        cls,
        db: Session,
        incident_id: uuid.UUID,
        update_data: IncidentStatusUpdate,
        user_id: Optional[uuid.UUID]
    ) -> Incident:
        incident = cls.get_incident(db, incident_id)
        updated = IncidentRepository.update_status(db, incident, update_data.status)
        
        IncidentRepository.log_audit(
            db=db,
            user_id=user_id,
            action="UPDATE_INCIDENT_STATUS",
            table_name="incidents",
            record_id=incident.id,
            new_values={"status": update_data.status, "notes": update_data.notes}
        )
        return updated

    @classmethod
    def assign_incident(
        cls,
        db: Session,
        incident_id: uuid.UUID,
        assign_req: IncidentAssignRequest,
        assigned_by_id: Optional[uuid.UUID]
    ) -> IncidentAssignment:
        incident = cls.get_incident(db, incident_id)
        assignment = IncidentRepository.assign_department(db, incident, assign_req, assigned_by_id)
        
        IncidentRepository.log_audit(
            db=db,
            user_id=assigned_by_id,
            action="ASSIGN_INCIDENT",
            table_name="incident_assignments",
            record_id=assignment.id,
            new_values={"department_id": str(assign_req.department_id)}
        )
        return assignment

    @classmethod
    def close_incident(cls, db: Session, incident_id: uuid.UUID, user_id: Optional[uuid.UUID]) -> None:
        incident = cls.get_incident(db, incident_id)
        IncidentRepository.delete(db, incident)
        
        IncidentRepository.log_audit(
            db=db,
            user_id=user_id,
            action="CLOSE_INCIDENT",
            table_name="incidents",
            record_id=incident_id
        )
