from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import uuid
from datetime import datetime

from app.dependencies.auth import get_current_user, verify_geographic_scope
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    DigitalTwinNodeResponse,
    NodeConnectionResponse,
    NodeConnectionDetailResponse,
    TelemetryRecordResponse,
    DigitalTwinSummaryResponse,
    PaginatedNodeResponse,
    PaginatedConnectionResponse,
    PaginatedTelemetryResponse,
)
from app.services.digital_twin_service import (
    list_nodes_service,
    get_node_service,
    list_connections_service,
    get_connection_service,
    get_telemetry_history_service,
    get_summary_service,
)

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"]) 

@router.get("/nodes", response_model=PaginatedNodeResponse)
def list_nodes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    node_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    nodes, total = list_nodes_service(
        db=db,
        user=current_user,
        state_id=state_id,
        district_id=district_id,
        city_id=city_id,
        node_type=node_type,
        status=status_filter,
        page=page,
        limit=limit,
    )
    return PaginatedNodeResponse(items=nodes, page=page, limit=limit, total=total)

@router.get("/nodes/{node_id}", response_model=DigitalTwinNodeResponse)
def get_node(
    node_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    node = get_node_service(db, current_user, node_id)
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    return node

@router.get("/connections", response_model=PaginatedConnectionResponse)
def list_connections(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    connections, total = list_connections_service(
        db=db,
        user=current_user,
        state_id=state_id,
        district_id=district_id,
        city_id=city_id,
        status=status_filter,
        page=page,
        limit=limit,
    )
    return PaginatedConnectionResponse(items=connections, page=page, limit=limit, total=total)

@router.get("/connections/{connection_id}", response_model=NodeConnectionDetailResponse)
def get_connection(
    connection_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    connection = get_connection_service(db, current_user, connection_id)
    if not connection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
    return connection

@router.get("/nodes/{node_id}/telemetry", response_model=PaginatedTelemetryResponse)
def get_telemetry(
    node_id: uuid.UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    metric_type: Optional[str] = Query(None),
    start_ts: Optional[datetime] = Query(None),
    end_ts: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    telemetry, total = get_telemetry_history_service(
        db=db,
        user=current_user,
        node_id=node_id,
        metric_type=metric_type,
        start_ts=start_ts,
        end_ts=end_ts,
        page=page,
        limit=limit,
    )
    return PaginatedTelemetryResponse(items=telemetry, page=page, limit=limit, total=total)

@router.get("/summary", response_model=DigitalTwinSummaryResponse)
def get_summary(
    state_id: Optional[uuid.UUID] = Query(None),
    district_id: Optional[uuid.UUID] = Query(None),
    city_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: get_db = Depends(get_db),
):
    # Verify scope for summary request
    if not verify_geographic_scope(
        user=current_user,
        target_state_id=state_id,
        target_district_id=district_id,
        target_city_id=city_id,
        db=db,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of scope")
    return get_summary_service(db, state_id, district_id, city_id)
