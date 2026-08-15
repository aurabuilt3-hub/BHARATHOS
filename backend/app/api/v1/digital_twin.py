from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from typing import List, Optional
import uuid
import os
from datetime import datetime
from pydantic import BaseModel, Field
from sqlalchemy.orm.attributes import flag_modified

from app.dependencies.auth import get_current_user, verify_geographic_scope
from app.db.session import get_db
from app.models.models import User, DigitalTwinNode, TelemetryRecord
from app.services.alert_rule_service import AlertRuleService
from app.realtime.event_service import event_service
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


class IoTTelemetryIn(BaseModel):
    metric_type: str = Field(..., description="e.g. water_level")
    value: float = Field(..., description="Calibrated sensor water level")
    unit: Optional[str] = "m"
    timestamp: Optional[datetime] = None

@router.post("/nodes/{node_id}/telemetry", status_code=status.HTTP_201_CREATED)
async def post_node_telemetry(
    node_id: uuid.UUID,
    payload: IoTTelemetryIn,
    x_iot_key: Optional[str] = Header(None, alias="X-IOT-KEY"),
    db: get_db = Depends(get_db),
):
    # Enforce API Key authentication
    expected_key = os.getenv("IOT_INGESTION_KEY")
    if not expected_key or x_iot_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized or missing X-IOT-KEY header."
        )

    # Fetch target digital twin node
    node = db.query(DigitalTwinNode).filter(DigitalTwinNode.id == node_id).first()
    if not node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Digital Twin Node not found."
        )

    # Determine state/severity based on thresholds
    # Threshold rules: critical >= 4.2, warning >= 4.0, else normal
    val = payload.value
    status_str = "critical" if val >= 4.2 else "warning" if val >= 4.0 else "normal"

    # Cache telemetry inside node
    node.status = status_str
    current_telemetry = dict(node.last_telemetry or {})
    current_telemetry.update({
        payload.metric_type: val,
        "unit": payload.unit,
        "source_type": "REAL_IOT",
        "observed_at": datetime.utcnow().isoformat()
    })
    node.last_telemetry = current_telemetry
    flag_modified(node, "last_telemetry")

    # Create Telemetry Record
    rec = TelemetryRecord(
        id=uuid.uuid4(),
        node_id=node.id,
        metric_type=payload.metric_type,
        value=val,
        unit=payload.unit,
        status=status_str,
        timestamp=payload.timestamp or datetime.utcnow()
    )
    # Transient attribute to pass source_type provenance to AlertRuleService
    rec.source_type = "REAL_IOT"
    db.add(rec)
    db.flush()

    # Evaluate rules & generate alerts/incidents
    alert = AlertRuleService.evaluate_telemetry(db, rec)

    # Commit changes
    db.commit()
    db.refresh(rec)
    db.refresh(node)
    if alert:
        db.refresh(alert)

    # Broadcast updates dynamically
    await event_service.publish_telemetry_updated(db, rec, node)
    await event_service.publish_node_updated(db, node)
    if alert:
        await event_service.publish_alert_created(db, alert)

    return {
        "status": "ok",
        "telemetry_id": str(rec.id),
        "node_status": node.status,
        "alert_generated": alert is not None
    }
