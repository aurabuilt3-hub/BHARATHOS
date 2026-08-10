import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_supabase_user
from app.schemas.schemas import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
    IncidentAssignRequest,
    IncidentAssignmentResponse
)
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    data: IncidentCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    citizen_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    incident = IncidentService.create_incident(db, data, citizen_id)
    return incident

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    zone_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return IncidentService.list_incidents(db, category, severity, status, zone_id, limit, offset)

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return IncidentService.get_incident(db, incident_id)

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: uuid.UUID,
    update_data: IncidentStatusUpdate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    user_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    return IncidentService.update_status(db, incident_id, update_data, user_id)

@router.post("/{incident_id}/assign", response_model=IncidentAssignmentResponse)
def assign_incident(
    incident_id: uuid.UUID,
    assign_req: IncidentAssignRequest,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    assigned_by_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    assignment = IncidentService.assign_incident(db, incident_id, assign_req, assigned_by_id)
    return assignment

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def close_incident(
    incident_id: uuid.UUID,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    user_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    IncidentService.close_incident(db, incident_id, user_id)
    return None
