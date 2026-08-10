from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
import uuid

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceResponse,
    PaginatedResourceResponse,
)
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=PaginatedResourceResponse)
def list_resources(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    department_id: Optional[uuid.UUID] = Query(None),
    type_: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    filters = {
        "state_id": str(state_id) if state_id else None,
        "district_id": str(district_id) if district_id else None,
        "city_id": str(city_id) if city_id else None,
        "department_id": str(department_id) if department_id else None,
        "type_": type_,
        "status": status,
    }
    resources = ResourceService.list_resources(db, current_user, **filters)
    total = len(resources)
    return PaginatedResourceResponse(items=resources, page=page, limit=limit, total=total)


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return ResourceService.get_resource(db, current_user, resource_id)


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return ResourceService.create_resource(db, current_user, **payload.model_dump())


@router.patch("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: str,
    payload: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return ResourceService.update_resource(db, current_user, resource_id, **payload.model_dump(exclude_unset=True))
