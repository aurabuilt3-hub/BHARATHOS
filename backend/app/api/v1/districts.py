import uuid
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import DistrictDetailResponse, CityResponse
from app.services.geography_service import GeographyService

router = APIRouter(prefix="/districts", tags=["Districts"])

@router.get("/{district_id}", response_model=DistrictDetailResponse)
def get_district(
    district_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve detail for a specific district. Restricted by geographic scope.
    """
    return GeographyService.get_district(db, district_id, current_user)

@router.get("/{district_id}/cities", response_model=List[CityResponse])
def list_district_cities(
    district_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve cities belonging to a district. Restricted by geographic scope.
    """
    return GeographyService.list_cities_by_district(
        db, district_id, current_user, limit=limit, offset=offset
    )
