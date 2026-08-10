from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
import uuid
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.facility import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    PaginatedFacilityResponse,
)
from app.services.facility_service import FacilityService

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("/", response_model=PaginatedFacilityResponse)
def list_facilities(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    facility_type: Optional[str] = Query(None),
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    zone_id: Optional[uuid.UUID] = Query(None),
    ward_id: Optional[uuid.UUID] = Query(None),
    source_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filters = {
        "page": page,
        "limit": limit,
        "facility_type": facility_type,
        "state_id": str(state_id) if state_id else None,
        "district_id": str(district_id) if district_id else None,
        "city_id": str(city_id) if city_id else None,
        "zone_id": str(zone_id) if zone_id else None,
        "ward_id": str(ward_id) if ward_id else None,
        "source_type": source_type,
    }
    
    facilities = FacilityService.list_facilities(db, current_user, **filters)
    total = FacilityService.count_facilities(db, current_user, **{k: v for k, v in filters.items() if k not in ("page", "limit")})
    
    return PaginatedFacilityResponse(items=facilities, page=page, limit=limit, total=total)


@router.get("/{facility_id}", response_model=FacilityResponse)
def get_facility(
    facility_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return FacilityService.get_facility(db, current_user, facility_id)


@router.post("/", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(
    payload: FacilityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Convert pydantic model to dict, converting UUIDs to strings where necessary
    data = payload.model_dump()
    for key in ("state_id", "district_id", "city_id", "zone_id", "ward_id"):
        if data.get(key):
            data[key] = str(data[key])
    return FacilityService.create_facility(db, current_user, data)


@router.patch("/{facility_id}", response_model=FacilityResponse)
def update_facility(
    facility_id: str,
    payload: FacilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for key in ("state_id", "district_id", "city_id", "zone_id", "ward_id"):
        if data.get(key):
            data[key] = str(data[key])
    return FacilityService.update_facility(db, current_user, facility_id, data)
