import uuid
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User, City
from app.schemas.schemas import CityResponse, CityDetailResponse, ZoneResponse
from app.services.geography_service import GeographyService

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("", response_model=List[CityResponse])
def list_cities(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve cities list. Accessible to authenticated users.
    """
    return db.query(City).order_by(City.city_name).offset(offset).limit(limit).all()

@router.get("/{city_id}", response_model=CityDetailResponse)
def get_city(
    city_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details for a specific city. Restricted by geographic scope.
    """
    return GeographyService.get_city(db, city_id, current_user)

@router.get("/{city_id}/zones", response_model=List[ZoneResponse])
def list_city_zones(
    city_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve zones inside a city. Restricted by geographic scope.
    """
    return GeographyService.list_zones_by_city(
        db, city_id, current_user, limit=limit, offset=offset
    )
