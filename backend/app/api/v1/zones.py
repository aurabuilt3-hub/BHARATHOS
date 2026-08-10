import uuid
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import WardResponse
from app.services.geography_service import GeographyService

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.get("/{zone_id}/wards", response_model=List[WardResponse])
def list_zone_wards(
    zone_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve wards belonging to a specific zone. Restricted by geographic scope.
    """
    return GeographyService.list_wards_by_zone(
        db, zone_id, current_user, limit=limit, offset=offset
    )
