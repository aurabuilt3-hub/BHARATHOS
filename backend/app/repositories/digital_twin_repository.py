from typing import List, Optional, Tuple
import uuid
import uuid
from datetime import datetime

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_

from app.models.models import DigitalTwinNode, NodeConnection, TelemetryRecord, State, District, City

DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def _apply_limit_offset(query, page: int = 1, limit: int = DEFAULT_LIMIT):
    limit = min(limit, MAX_LIMIT)
    offset = (page - 1) * limit
    return query.limit(limit).offset(offset)


def list_nodes(
    db: Session,
    state_id: Optional[uuid.UUID] = None,
    district_id: Optional[uuid.UUID] = None,
    city_id: Optional[uuid.UUID] = None,
    node_type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = DEFAULT_LIMIT,
) -> Tuple[List[DigitalTwinNode], int]:
    """Return a list of nodes matching filters and total count."""
    query = db.query(DigitalTwinNode)
    if state_id:
        query = query.filter(DigitalTwinNode.state_id == state_id)
    if district_id:
        # Join city -> district if needed
        query = query.join(DigitalTwinNode.city).filter(City.district_id == district_id)
    if city_id:
        query = query.filter(DigitalTwinNode.city_id == city_id)
    if node_type:
        query = query.filter(DigitalTwinNode.type == node_type)
    if status:
        query = query.filter(DigitalTwinNode.status == status)

    total = query.count()
    query = _apply_limit_offset(query, page, limit)
    nodes = query.all()
    return nodes, total


def get_node(db: Session, node_id: uuid.UUID) -> Optional[DigitalTwinNode]:
    return (
        db.query(DigitalTwinNode)
        .options(joinedload(DigitalTwinNode.state), joinedload(DigitalTwinNode.city))
        .filter(DigitalTwinNode.id == node_id)
        .first()
    )


def list_connections(
    db: Session,
    state_id: Optional[uuid.UUID] = None,
    district_id: Optional[uuid.UUID] = None,
    city_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = DEFAULT_LIMIT,
) -> Tuple[List[NodeConnection], int]:
    query = db.query(NodeConnection).join(NodeConnection.from_node).join(NodeConnection.to_node)
    if state_id:
        query = query.filter(
            and_(
                DigitalTwinNode.state_id == state_id,
                NodeConnection.to_node.has(state_id=state_id),
            )
        )
    if district_id:
        # filter via city->district chain for both ends
        query = query.filter(
            and_(
                DigitalTwinNode.city.has(district_id=district_id),
                NodeConnection.to_node.has(city.has(district_id=district_id)),
            )
        )
    if city_id:
        query = query.filter(
            and_(
                DigitalTwinNode.city_id == city_id,
                NodeConnection.to_node.has(city_id=city_id),
            )
        )
    if status:
        query = query.filter(NodeConnection.status == status)
    total = query.count()
    query = _apply_limit_offset(query, page, limit)
    connections = query.all()
    return connections, total


def get_connection(db: Session, connection_id: uuid.UUID) -> Optional[NodeConnection]:
    return (
        db.query(NodeConnection)
        .options(
            joinedload(NodeConnection.from_node).joinedload(DigitalTwinNode.state),
            joinedload(NodeConnection.from_node).joinedload(DigitalTwinNode.city),
            joinedload(NodeConnection.to_node).joinedload(DigitalTwinNode.state),
            joinedload(NodeConnection.to_node).joinedload(DigitalTwinNode.city),
        )
        .filter(NodeConnection.id == connection_id)
        .first()
    )


def get_telemetry_history(
    db: Session,
    node_id: uuid.UUID,
    metric_type: Optional[str] = None,
    start_ts: Optional[datetime] = None,
    end_ts: Optional[datetime] = None,
    page: int = 1,
    limit: int = DEFAULT_LIMIT,
) -> Tuple[List[TelemetryRecord], int]:
    query = db.query(TelemetryRecord).filter(TelemetryRecord.node_id == node_id)
    if metric_type:
        query = query.filter(TelemetryRecord.metric_type == metric_type)
    if start_ts:
        query = query.filter(TelemetryRecord.timestamp >= start_ts)
    if end_ts:
        query = query.filter(TelemetryRecord.timestamp <= end_ts)
    total = query.count()
    query = _apply_limit_offset(query.order_by(TelemetryRecord.timestamp.desc()), page, limit)
    records = query.all()
    return records, total


def aggregate_summary(
    db: Session,
    state_id: Optional[uuid.UUID] = None,
    district_id: Optional[uuid.UUID] = None,
    city_id: Optional[uuid.UUID] = None,
) -> dict:
    # Node counts
    node_q = db.query(
        func.count(DigitalTwinNode.id).label('total_nodes'),
        func.count(func.nullif(DigitalTwinNode.status != 'operational', True)).label('active_nodes'),
    )
    if state_id:
        node_q = node_q.filter(DigitalTwinNode.state_id == state_id)
    if district_id:
        node_q = node_q.join(DigitalTwinNode.city).filter(City.district_id == district_id)
    if city_id:
        node_q = node_q.filter(DigitalTwinNode.city_id == city_id)
    node_stats = node_q.one()

    # Connection counts
    conn_q = db.query(
        func.count(NodeConnection.id).label('total_connections'),
        func.count(func.nullif(NodeConnection.status != 'active', True)).label('active_connections'),
    )
    if state_id:
        conn_q = conn_q.join(NodeConnection.from_node).filter(DigitalTwinNode.state_id == state_id)
    if district_id:
        conn_q = conn_q.join(NodeConnection.from_node).join(DigitalTwinNode.city).filter(City.district_id == district_id)
    if city_id:
        conn_q = conn_q.filter(NodeConnection.from_node.has(city_id=city_id))
    conn_stats = conn_q.one()

    # Health status distribution for nodes
    health_q = db.query(DigitalTwinNode.status, func.count(DigitalTwinNode.id)).group_by(DigitalTwinNode.status)
    if state_id:
        health_q = health_q.filter(DigitalTwinNode.state_id == state_id)
    if district_id:
        health_q = health_q.join(DigitalTwinNode.city).filter(City.district_id == district_id)
    if city_id:
        health_q = health_q.filter(DigitalTwinNode.city_id == city_id)
    health_counts = {status: cnt for status, cnt in health_q.all()}

    return {
        'total_nodes': node_stats.total_nodes,
        'active_nodes': node_stats.active_nodes,
        'total_connections': conn_stats.total_connections,
        'active_connections': conn_stats.active_connections,
        'health_status_counts': health_counts,
    }
