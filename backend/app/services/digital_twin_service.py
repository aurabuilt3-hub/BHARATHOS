from typing import List, Optional
import uuid
from datetime import datetime

from fastapi import HTTPException, status

from app.dependencies.auth import verify_geographic_scope
from app.models.models import DigitalTwinNode, NodeConnection, TelemetryRecord
from app.repositories.digital_twin_repository import (
    list_nodes,
    get_node,
    list_connections,
    get_connection,
    get_telemetry_history,
    aggregate_summary,
)


def _is_user_allowed(user, target_state_id: Optional[uuid.UUID], target_district_id: Optional[uuid.UUID], target_city_id: Optional[uuid.UUID], db) -> bool:
    role = user.role.role_name if user.role else "citizen"
    if role in ("national_admin", "admin", "citizen"):
        return True
    return verify_geographic_scope(
        user=user,
        target_state_id=target_state_id,
        target_district_id=target_district_id,
        target_city_id=target_city_id,
        db=db,
    )


def list_nodes_service(
    db,
    user,
    state_id: Optional[uuid.UUID] = None,
    district_id: Optional[uuid.UUID] = None,
    city_id: Optional[uuid.UUID] = None,
    node_type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    if not _is_user_allowed(user, state_id, district_id, city_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of scope")
    nodes, total = list_nodes(
        db=db,
        state_id=state_id,
        district_id=district_id,
        city_id=city_id,
        node_type=node_type,
        status=status,
        page=page,
        limit=limit,
    )
    return nodes, total


def get_node_service(db, user, node_id: uuid.UUID):
    node = get_node(db, node_id)
    if not node:
        return None
    if not _is_user_allowed(user, node.state_id, None, node.city_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of scope")
    return node


def list_connections_service(
    db,
    user,
    state_id: Optional[uuid.UUID] = None,
    district_id: Optional[uuid.UUID] = None,
    city_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    # Retrieve connections with any filters (these filters are applied at DB level)
    connections, total = list_connections(
        db=db,
        state_id=state_id,
        district_id=district_id,
        city_id=city_id,
        status=status,
        page=page,
        limit=limit,
    )
    # Apply double‑scope rule
    allowed = []
    for conn in connections:
        from_node = conn.from_node
        to_node = conn.to_node
        if (
            _is_user_allowed(user, from_node.state_id, None, from_node.city_id, db)
            and _is_user_allowed(user, to_node.state_id, None, to_node.city_id, db)
        ):
            allowed.append(conn)
    return allowed, total


def get_connection_service(db, user, connection_id: uuid.UUID):
    conn = get_connection(db, connection_id)
    if not conn:
        return None
    from_node = conn.from_node
    to_node = conn.to_node
    if not (
        _is_user_allowed(user, from_node.state_id, None, from_node.city_id, db)
        and _is_user_allowed(user, to_node.state_id, None, to_node.city_id, db)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of scope")
    return conn


def get_telemetry_history_service(
    db,
    user,
    node_id: uuid.UUID,
    metric_type: Optional[str] = None,
    start_ts: Optional[datetime] = None,
    end_ts: Optional[datetime] = None,
    page: int = 1,
    limit: int = 20,
):
    node = get_node(db, node_id)
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    if not _is_user_allowed(user, node.state_id, None, node.city_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Out of scope")
    telemetry, total = get_telemetry_history(
        db=db,
        node_id=node_id,
        metric_type=metric_type,
        start_ts=start_ts,
        end_ts=end_ts,
        page=page,
        limit=limit,
    )
    return telemetry, total


def get_summary_service(db, state_id: Optional[uuid.UUID], district_id: Optional[uuid.UUID], city_id: Optional[uuid.UUID]):
    # Scope already verified by caller for summary endpoint
    return aggregate_summary(db, state_id, district_id, city_id)
