import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import WardDetailResponse
from app.services.geography_service import GeographyService

router = APIRouter(prefix="/wards", tags=["Wards"])

@router.get("/{ward_id}", response_model=WardDetailResponse)
def get_ward(
    ward_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details for a specific ward. Restricted by geographic scope.
    """
    return GeographyService.get_ward(db, ward_id, current_user)
