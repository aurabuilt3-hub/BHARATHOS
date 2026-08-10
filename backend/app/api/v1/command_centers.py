from fastapi import APIRouter, Depends, Query, status, HTTPException
import uuid
from typing import List, Optional

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.command_center import CommandCenterResponse, CommandCenterSummaryResponse
from app.services.command_center_service import CommandCenterService

router = APIRouter(prefix="/command-centers", tags=["Command Centers"])

@router.get("/", response_model=List[CommandCenterResponse])
def list_command_centers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    centers = CommandCenterService.list_command_centers(
        db=db,
        user=current_user,
        page=page,
        limit=limit,
        state_id=state_id,
        city_id=city_id,
    )
    return centers

@router.get("/{command_center_id}", response_model=CommandCenterResponse)
def get_command_center(
    command_center_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return CommandCenterService.get_command_center(db, current_user, str(command_center_id))

@router.get("/{command_center_id}/summary", response_model=CommandCenterSummaryResponse)
def get_command_center_summary(
    command_center_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    return CommandCenterService.get_command_center_summary(db, current_user, str(command_center_id))
