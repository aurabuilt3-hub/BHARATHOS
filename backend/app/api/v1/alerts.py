from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
import uuid
from sqlalchemy.orm import Session
from datetime import datetime

from app.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.alert import (
    AlertCreate,
    AlertUpdate,
    AlertResponse,
    PaginatedAlertResponse,
    AlertSummaryResponse,
)
from app.services.alert_service import AlertService
from app.realtime.event_service import event_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/summary", response_model=AlertSummaryResponse)
def get_alerts_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Expire outdated alerts first (maintenance action on telemetry alerts)
    AlertService.expire_alerts(db)
    return AlertService.get_summary(db, current_user)

@router.get("/", response_model=PaginatedAlertResponse)
def list_alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    severity: Optional[str] = Query(None),
    status_val: Optional[str] = Query(None, alias="status"),
    alert_type: Optional[str] = Query(None, alias="alert_type"),
    source: Optional[str] = Query(None),
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    zone_id: Optional[uuid.UUID] = Query(None),
    ward_id: Optional[uuid.UUID] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Expire outdated alerts first (maintenance action on telemetry alerts)
    AlertService.expire_alerts(db)

    items, total = AlertService.list_alerts(
        db,
        current_user,
        page=page,
        limit=limit,
        severity=severity,
        status_val=status_val,
        alert_type=alert_type,
        source=source,
        state_id=str(state_id) if state_id else None,
        district_id=str(district_id) if district_id else None,
        city_id=str(city_id) if city_id else None,
        zone_id=str(zone_id) if zone_id else None,
        ward_id=str(ward_id) if ward_id else None,
        date_from=date_from,
        date_to=date_to,
    )
    return PaginatedAlertResponse(items=items, total=total, page=page, limit=limit)

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Expire outdated alerts first (maintenance action on telemetry alerts)
    AlertService.expire_alerts(db)
    return AlertService.get_alert(db, current_user, alert_id)

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    payload: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = AlertService.create_alert(db, current_user, payload.model_dump())
    db.commit()
    await event_service.publish_alert_created(db, alert)
    return alert

@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = AlertService.acknowledge_alert(db, current_user, alert_id)
    db.commit()
    await event_service.publish_alert_status_changed(db, alert, "acknowledged")
    return alert

@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = AlertService.resolve_alert(db, current_user, alert_id)
    db.commit()
    await event_service.publish_alert_status_changed(db, alert, "resolved")
    return alert
