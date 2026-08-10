import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_supabase_user, get_current_user
from app.models.models import User
from app.schemas.resource import ResourceAllocationRequest, ResourceAllocationResponse, ResourceResponse
from app.schemas.schemas import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
    IncidentAssignRequest,
    IncidentAssignmentResponse,
)
from app.services.incident_service import IncidentService
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    data: IncidentCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
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
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return IncidentService.list_incidents(db, category, severity, status, zone_id, limit, offset)

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return IncidentService.get_incident(db, incident_id)

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: uuid.UUID,
    update_data: IncidentStatusUpdate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
):
    user_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    return IncidentService.update_status(db, incident_id, update_data, user_id)

@router.post("/{incident_id}/assign", response_model=IncidentAssignmentResponse)
def assign_incident(
    incident_id: uuid.UUID,
    assign_req: IncidentAssignRequest,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
):
    assigned_by_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    assignment = IncidentService.assign_incident(db, incident_id, assign_req, assigned_by_id)
    return assignment

# Resource allocation endpoints
@router.post("/{incident_id}/resources", response_model=ResourceAllocationResponse, status_code=status.HTTP_201_CREATED)
def allocate_resource(
    incident_id: uuid.UUID,
    allocation_req: ResourceAllocationRequest,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    if allocation_req.incident_id and allocation_req.incident_id != incident_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident ID mismatch between path and body")
    return ResourceService.allocate_resource(db, str(incident_id), str(allocation_req.resource_id), current_user)

@router.get("/{incident_id}/resources", response_model=List[ResourceResponse])
def list_incident_resources(
    incident_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    resources = ResourceService.list_incident_resources(db, current_user, str(incident_id))
    start = (page - 1) * limit
    end = start + limit
    return resources[start:end]

@router.patch("/{incident_id}/resources/{resource_id}/release", response_model=ResourceAllocationResponse)
def release_resource(
    incident_id: uuid.UUID,
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return ResourceService.release_resource(db, str(incident_id), str(resource_id), current_user)
