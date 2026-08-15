import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_supabase_user, get_current_user, get_current_user_optional
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
from app.realtime.event_service import event_service

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    data: IncidentCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
):
    citizen_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    incident = IncidentService.create_incident(db, data, citizen_id)
    await event_service.publish_incident_created(db, incident)
    return incident

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    category: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    zone_id: Optional[uuid.UUID] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    from app.dependencies.auth import verify_geographic_scope
    if current_user and zone_id:
        from app.models.models import Zone
        zone = db.query(Zone).filter(Zone.id == zone_id).first()
        if zone:
            state_id = zone.city.district.state_id if zone.city and zone.city.district else None
            city_id = zone.city_id
            if not verify_geographic_scope(current_user, state_id, None, city_id, db):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                
    incidents = IncidentService.list_incidents(db, category, severity, status, zone_id, limit, offset)
    if current_user:
        scoped = []
        for inc in incidents:
            state_id = inc.zone.city.district.state_id if inc.zone and inc.zone.city and inc.zone.city.district else None
            city_id = inc.zone.city_id if inc.zone else None
            if verify_geographic_scope(current_user, state_id, None, city_id, db):
                scoped.append(inc)
        return scoped
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    incident = IncidentService.get_incident(db, incident_id)
    if current_user:
        from app.dependencies.auth import verify_geographic_scope
        state_id = incident.zone.city.district.state_id if incident.zone and incident.zone.city and incident.zone.city.district else None
        city_id = incident.zone.city_id if incident.zone else None
        if not verify_geographic_scope(current_user, state_id, None, city_id, db):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: uuid.UUID,
    update_data: IncidentStatusUpdate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
):
    user_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    updated = IncidentService.update_status(db, incident_id, update_data, user_id)
    await event_service.publish_incident_status_changed(db, updated, update_data.status)
    return updated

@router.post("/{incident_id}/assign", response_model=IncidentAssignmentResponse)
async def assign_incident(
    incident_id: uuid.UUID,
    assign_req: IncidentAssignRequest,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db),
):
    assigned_by_id = uuid.UUID(supabase_user["id"]) if supabase_user else None
    assignment = IncidentService.assign_incident(db, incident_id, assign_req, assigned_by_id)
    
    # Load fully updated incident model
    incident = IncidentService.get_incident(db, incident_id)
    await event_service.publish_incident_assigned(db, assignment, incident)
    return assignment

# Resource allocation endpoints
@router.post("/{incident_id}/resources", response_model=ResourceAllocationResponse, status_code=status.HTTP_201_CREATED)
async def allocate_resource(
    incident_id: uuid.UUID,
    allocation_req: ResourceAllocationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if allocation_req.incident_id and allocation_req.incident_id != incident_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident ID mismatch between path and body")
    
    allocation = ResourceService.allocate_resource(db, str(incident_id), str(allocation_req.resource_id), current_user)
    
    # Load associated resource & incident
    resource = ResourceService.get_resource(db, current_user, str(allocation_req.resource_id))
    incident = IncidentService.get_incident(db, incident_id)
    await event_service.publish_resource_allocated(db, allocation, resource, incident)
    return allocation

@router.get("/{incident_id}/resources", response_model=List[ResourceResponse])
def list_incident_resources(
    incident_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    resources = ResourceService.list_incident_resources(db, current_user, str(incident_id))
    start = (page - 1) * limit
    end = start + limit
    return resources[start:end]

@router.patch("/{incident_id}/resources/{resource_id}/release", response_model=ResourceAllocationResponse)
async def release_resource(
    incident_id: uuid.UUID,
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Retrieve active allocation first
    from app.repositories.resource_allocation_repository import ResourceAllocationRepository
    alloc_repo = ResourceAllocationRepository(db)
    allocation = alloc_repo.get_active_allocation(str(resource_id))
    if not allocation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active resource allocation not found")
        
    released_allocation = ResourceService.release_resource(db, str(incident_id), str(resource_id), current_user)
    
    # Load associated resource & incident
    resource = ResourceService.get_resource(db, current_user, str(resource_id))
    incident = IncidentService.get_incident(db, incident_id)
    await event_service.publish_resource_released(db, released_allocation, resource, incident)
    return released_allocation
