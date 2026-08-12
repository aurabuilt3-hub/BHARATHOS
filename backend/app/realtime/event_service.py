import uuid
import logging
from datetime import datetime
from typing import Optional, Any, Dict
from sqlalchemy.orm import Session

from app.models.models import Incident, Alert, Resource, ResourceAllocation, DigitalTwinNode, TelemetryRecord, Zone, City
from app.realtime.connection_manager import connection_manager
from app.realtime.schemas import RealtimeEvent, EventGeography

logger = logging.getLogger("app.realtime")

class EventService:
    @staticmethod
    def _resolve_incident_geography(db: Session, incident: Incident) -> EventGeography:
        state_id, district_id, city_id = None, None, None
        if incident.zone_id:
            zone = db.query(Zone).filter(Zone.id == incident.zone_id).first()
            if zone:
                city_id = str(zone.city_id) if zone.city_id else None
                city = db.query(City).filter(City.id == zone.city_id).first() if zone.city_id else None
                if city:
                    district_id = str(city.district_id) if city.district_id else None
                    if city.district:
                        state_id = str(city.district.state_id)
        return EventGeography(
            state_id=state_id,
            district_id=district_id,
            city_id=city_id,
            zone_id=str(incident.zone_id) if incident.zone_id else None,
            ward_id=str(incident.ward_id) if incident.ward_id else None
        )

    @staticmethod
    def _resolve_resource_geography(db: Session, resource: Resource) -> EventGeography:
        state_id, district_id, city_id = None, None, None
        if resource.city_id:
            city_id = str(resource.city_id)
            city = db.query(City).filter(City.id == resource.city_id).first()
            if city:
                district_id = str(city.district_id) if city.district_id else None
                if city.district:
                    state_id = str(city.district.state_id)
        return EventGeography(
            state_id=state_id,
            district_id=district_id,
            city_id=city_id
        )

    @staticmethod
    def _resolve_node_geography(db: Session, node: DigitalTwinNode) -> EventGeography:
        state_id, district_id, city_id = None, None, None
        if node.city_id:
            city_id = str(node.city_id)
            city = db.query(City).filter(City.id == node.city_id).first()
            if city:
                district_id = str(city.district_id) if city.district_id else None
                if city.district:
                    state_id = str(city.district.state_id)
        elif node.state_id:
            state_id = str(node.state_id)
        return EventGeography(
            state_id=state_id,
            district_id=district_id,
            city_id=city_id,
            zone_id=None,
            ward_id=None
        )

    @staticmethod
    def _resolve_alert_geography(db: Session, alert: Alert) -> EventGeography:
        state_id = str(alert.state_id) if alert.state_id else None
        district_id = None
        city_id = str(alert.city_id) if alert.city_id else None
        
        if alert.city_id and db:
            city = db.query(City).filter(City.id == alert.city_id).first()
            if city:
                district_id = str(city.district_id) if city.district_id else None
                if not state_id and city.district:
                    state_id = str(city.district.state_id)
        return EventGeography(
            state_id=state_id,
            district_id=district_id,
            city_id=city_id
        )

    async def publish_incident_created(self, db: Session, incident: Incident):
        geo = self._resolve_incident_geography(db, incident)
        event = RealtimeEvent(
            event="INCIDENT_CREATED",
            entity_type="incident",
            entity_id=str(incident.id),
            data={
                "id": str(incident.id),
                "ticket_number": incident.ticket_number,
                "category": incident.category,
                "title": incident.title,
                "description": incident.description,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
                "severity": incident.severity,
                "status": incident.status,
                "created_at": (incident.created_at or datetime.utcnow()).isoformat()
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("incidents", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_incident_status_changed(self, db: Session, incident: Incident, new_status: str):
        geo = self._resolve_incident_geography(db, incident)
        event = RealtimeEvent(
            event="INCIDENT_STATUS_CHANGED",
            entity_type="incident",
            entity_id=str(incident.id),
            data={
                "id": str(incident.id),
                "ticket_number": incident.ticket_number,
                "status": new_status,
                "severity": incident.severity,
                "category": incident.category,
                "title": incident.title,
                "latitude": incident.latitude,
                "longitude": incident.longitude
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("incidents", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_incident_assigned(self, db: Session, assignment: Any, incident: Incident):
        geo = self._resolve_incident_geography(db, incident)
        event = RealtimeEvent(
            event="INCIDENT_ASSIGNED",
            entity_type="incident",
            entity_id=str(incident.id),
            data={
                "id": str(incident.id),
                "ticket_number": incident.ticket_number,
                "department_id": str(assignment.department_id),
                "status": "assigned",
                "notes": assignment.notes
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("incidents", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_alert_created(self, db: Session, alert: Alert):
        geo = self._resolve_alert_geography(db, alert)
        event = RealtimeEvent(
            event="ALERT_CREATED",
            entity_type="alert",
            entity_id=str(alert.id),
            data={
                "id": str(alert.id),
                "title": alert.title,
                "description": alert.description,
                "severity": alert.severity,
                "category": alert.category,
                "status": alert.status,
                "source": alert.source,
                "created_at": (alert.created_at or datetime.utcnow()).isoformat()
            },
            source_type=alert.source,
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("notifications", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_alert_status_changed(self, db: Session, alert: Alert, new_status: str):
        geo = self._resolve_alert_geography(db, alert)
        event = RealtimeEvent(
            event="ALERT_STATUS_CHANGED",
            entity_type="alert",
            entity_id=str(alert.id),
            data={
                "id": str(alert.id),
                "title": alert.title,
                "status": new_status,
                "severity": alert.severity
            },
            source_type=alert.source,
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("notifications", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_resource_created(self, db: Session, resource: Resource):
        geo = self._resolve_resource_geography(db, resource)
        event = RealtimeEvent(
            event="RESOURCE_CREATED",
            entity_type="resource",
            entity_id=str(resource.id),
            data={
                "id": str(resource.id),
                "name": resource.name,
                "type": resource.type,
                "status": resource.status,
                "latitude": resource.latitude,
                "longitude": resource.longitude
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_resource_updated(self, db: Session, resource: Resource, updates: dict):
        geo = self._resolve_resource_geography(db, resource)
        event = RealtimeEvent(
            event="RESOURCE_UPDATED",
            entity_type="resource",
            entity_id=str(resource.id),
            data={
                "id": str(resource.id),
                "name": resource.name,
                "type": resource.type,
                "status": resource.status,
                **updates
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_resource_allocated(self, db: Session, allocation: ResourceAllocation, resource: Resource, incident: Incident):
        geo_resource = self._resolve_resource_geography(db, resource)
        event = RealtimeEvent(
            event="RESOURCE_ALLOCATED",
            entity_type="resource",
            entity_id=str(resource.id),
            data={
                "id": str(resource.id),
                "name": resource.name,
                "type": resource.type,
                "status": "allocated",
                "allocation_id": str(allocation.id),
                "incident_id": str(incident.id),
                "incident_ticket": incident.ticket_number
            },
            geography=geo_resource
        )
        payload = event.model_dump()
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_resource_released(self, db: Session, allocation: ResourceAllocation, resource: Resource, incident: Incident):
        geo_resource = self._resolve_resource_geography(db, resource)
        event = RealtimeEvent(
            event="RESOURCE_RELEASED",
            entity_type="resource",
            entity_id=str(resource.id),
            data={
                "id": str(resource.id),
                "name": resource.name,
                "type": resource.type,
                "status": "available",
                "allocation_id": str(allocation.id),
                "incident_id": str(incident.id),
                "incident_ticket": incident.ticket_number
            },
            geography=geo_resource
        )
        payload = event.model_dump()
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_telemetry_updated(self, db: Session, telemetry: TelemetryRecord, node: DigitalTwinNode):
        geo = self._resolve_node_geography(db, node)
        event = RealtimeEvent(
            event="TELEMETRY_UPDATED",
            entity_type="telemetry",
            entity_id=str(telemetry.id),
            data={
                "id": str(telemetry.id),
                "node_id": str(telemetry.node_id),
                "node_name": node.name,
                "metric_type": telemetry.metric_type,
                "value": telemetry.value,
                "unit": telemetry.unit,
                "status": telemetry.status,
                "timestamp": (telemetry.timestamp or datetime.utcnow()).isoformat()
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("sensors", payload, db)
        await connection_manager.broadcast("dashboard", payload, db)

    async def publish_node_updated(self, db: Session, node: DigitalTwinNode):
        geo = self._resolve_node_geography(db, node)
        event = RealtimeEvent(
            event="DIGITAL_TWIN_NODE_UPDATED",
            entity_type="digital_twin_node",
            entity_id=str(node.id),
            data={
                "id": str(node.id),
                "name": node.name,
                "type": node.type,
                "status": node.status,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "last_telemetry": node.last_telemetry
            },
            geography=geo
        )
        payload = event.model_dump()
        await connection_manager.broadcast("dashboard", payload, db)

event_service = EventService()
