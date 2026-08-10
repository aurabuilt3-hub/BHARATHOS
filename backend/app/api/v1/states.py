import uuid
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import StateResponse, DistrictResponse
from app.services.geography_service import GeographyService

router = APIRouter(prefix="/states", tags=["States"])

@router.get("", response_model=List[StateResponse])
def list_states(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all registered states. Accessible to all authenticated users.
    """
    return GeographyService.list_states(db, current_user, limit=limit, offset=offset)

@router.get("/{state_id}", response_model=StateResponse)
def get_state(
    state_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details for a specific state. Restricted by geographic scope.
    """
    return GeographyService.get_state(db, state_id, current_user)

@router.get("/{state_id}/districts", response_model=List[DistrictResponse])
def list_state_districts(
    state_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all districts under a specific state. Restricted by geographic scope.
    """
    return GeographyService.list_districts_by_state(
        db, state_id, current_user, limit=limit, offset=offset
    )
