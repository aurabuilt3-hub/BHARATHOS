import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from app.models.models import User, Incident, Alert, Facility, Resource, TelemetryRecord, DigitalTwinNode, State, District, City
from app.services.incident_service import IncidentService
from app.services.alert_service import AlertService
from app.services.facility_service import FacilityService
from app.services.resource_service import ResourceService
from app.services.command_center_service import CommandCenterService
from app.dependencies.auth import verify_geographic_scope

# ----------------- Helper functions -----------------
def _check_scope(user: User, state_id: Any, city_id: Any, db: Session) -> None:
    if not verify_geographic_scope(
        user=user,
        target_state_id=state_id,
        target_city_id=city_id,
        db=db
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: outside geographic scope"
        )

# ----------------- READ Tools -----------------

def get_incidents(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Query incidents matching criteria, respecting user's geographic scope."""
    # list_incidents on IncidentService doesn't accept user
    category = filters.get("category")
    severity = filters.get("severity")
    status_filter = filters.get("status")
    zone_id = filters.get("zone_id")
    
    incidents = IncidentService.list_incidents(
        db=db,
        category=category,
        severity=severity,
        status=status_filter,
        zone_id=zone_id
    )
    
    # Filter by user's geographic scope
    scoped_incidents = []
    for inc in incidents:
        state_id = inc.zone.city.district.state_id if inc.zone and inc.zone.city and inc.zone.city.district else None
        city_id = inc.zone.city_id if inc.zone else None
        if verify_geographic_scope(user, state_id, None, city_id, db):
            scoped_incidents.append(inc)
            
    return [
        {
            "id": str(inc.id),
            "ticket_number": inc.ticket_number,
            "title": inc.title,
            "description": inc.description,
            "status": inc.status,
            "priority": inc.severity,
            "category": inc.category,
            "zone_id": str(inc.zone_id) if inc.zone_id else None,
            "city_name": inc.zone.city.city_name if inc.zone and inc.zone.city else None,
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
            "source_type": "SIMULATED" if "simulated" in str(inc.title).lower() or "demo" in str(inc.title).lower() else "VERIFIED_PUBLIC"
        }
        for inc in scoped_incidents
    ]

def get_incident(db: Session, user: User, incident_id: str) -> Dict[str, Any]:
    """Retrieve detailed information for a single incident, enforcing scope."""
    try:
        uid = uuid.UUID(str(incident_id))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        
    inc = IncidentService.get_incident(db, uid)
    
    state_id = inc.zone.city.district.state_id if inc.zone and inc.zone.city and inc.zone.city.district else None
    city_id = inc.zone.city_id if inc.zone else None
    _check_scope(user, state_id, city_id, db)
    
    return {
        "id": str(inc.id),
        "ticket_number": inc.ticket_number,
        "title": inc.title,
        "description": inc.description,
        "status": inc.status,
        "priority": inc.severity,
        "category": inc.category,
        "zone_id": str(inc.zone_id) if inc.zone_id else None,
        "created_at": inc.created_at.isoformat() if inc.created_at else None,
    }

def get_alerts(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Retrieve active system alerts matching scope and optional parameters."""
    status_val = filters.pop("status", None) or filters.pop("status_val", None)
    
    alerts, _ = AlertService.list_alerts(
        db,
        user,
        status_val=status_val,
        severity=filters.get("severity"),
        alert_type=filters.get("alert_type"),
        source=filters.get("source"),
        state_id=filters.get("state_id"),
        district_id=filters.get("district_id"),
        city_id=filters.get("city_id"),
        zone_id=filters.get("zone_id"),
        ward_id=filters.get("ward_id")
    )
    
    return [
        {
            "id": str(al.id),
            "title": al.title,
            "description": al.description,
            "severity": al.severity,
            "category": al.category,
            "status": al.status,
            "source": al.source,
            "created_at": al.created_at.isoformat() if al.created_at else None,
        }
        for al in alerts
    ]

def get_alert_summary(db: Session, user: User) -> Dict[str, Any]:
    """Get summarized counts of active, acknowledged, resolved, and critical alerts in scope."""
    return AlertService.get_summary(db, user)

def get_facilities(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Retrieve physical emergency infrastructure facilities (hospitals, police, fire)."""
    facilities = FacilityService.list_facilities(db, user, **filters)
    return [
        {
            "id": str(fac.id),
            "name": fac.name,
            "facility_type": fac.facility_type,
            "address": fac.address,
            "phone": fac.phone,
            "latitude": fac.latitude,
            "longitude": fac.longitude,
            "source_type": fac.source_type,
            "source_name": fac.source_name,
            "source_url": fac.source_url
        }
        for fac in facilities
    ]

def get_resources(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Retrieve response units (ambulance vehicles, fire engines, police patrols)."""
    resources = ResourceService.list_resources(db, user, **filters)
    
    # Filter by user's geographic scope to prevent cross-jurisdiction leakage
    scoped_resources = []
    for res in resources:
        if verify_geographic_scope(user, None, None, res.city_id, db):
            scoped_resources.append(res)

    return [
        {
            "id": str(res.id),
            "name": res.name,
            "type": res.type,
            "status": res.status,
            "latitude": res.latitude,
            "longitude": res.longitude,
            "city_id": str(res.city_id) if res.city_id else None,
            "department_id": str(res.department_id) if res.department_id else None,
        }
        for res in scoped_resources
    ]

def get_available_resources(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Helper tool specifically filtering for available resources."""
    filters["status"] = "available"
    return get_resources(db, user, **filters)

def get_telemetry(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Query telemetry logs for sensor nodes inside the authorized scope."""
    stmt = select(TelemetryRecord)
    
    node_id = filters.get("node_id")
    if node_id:
        stmt = stmt.where(TelemetryRecord.node_id == uuid.UUID(str(node_id)))
        
    metric_type = filters.get("metric_type")
    if metric_type:
        stmt = stmt.where(TelemetryRecord.metric_type == metric_type)
        
    records = list(db.execute(stmt).scalars().all())
    
    out = []
    for rec in records:
        if rec.node:
            if verify_geographic_scope(user, rec.node.state_id, None, rec.node.city_id, db):
                out.append({
                    "id": str(rec.id),
                    "node_id": str(rec.node_id),
                    "node_name": rec.node.name,
                    "metric_type": rec.metric_type,
                    "value": rec.value,
                    "unit": rec.unit,
                    "status": rec.status,
                    "timestamp": rec.timestamp.isoformat() if rec.timestamp else None,
                })
    return out

def get_digital_twin_nodes(db: Session, user: User, **filters) -> List[Dict[str, Any]]:
    """Query registered digital twin nodes and sensor endpoints."""
    stmt = select(DigitalTwinNode)
    if "type" in filters:
        stmt = stmt.where(DigitalTwinNode.type == filters["type"])
    nodes = list(db.execute(stmt).scalars().all())
    
    out = []
    for n in nodes:
        if verify_geographic_scope(user, n.state_id, None, n.city_id, db):
            out.append({
                "id": str(n.id),
                "name": n.name,
                "type": n.type,
                "level": n.level,
                "status": n.status,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "last_telemetry": n.last_telemetry,
            })
    return out

def get_command_center_summary(db: Session, user: User, command_center_id: str) -> Dict[str, Any]:
    """Retrieve structural statistics and summaries for a specific command center."""
    return CommandCenterService.get_command_center_summary(db, user, command_center_id)

def get_geography(db: Session, user: User, **filters) -> Dict[str, Any] :
    """Retrieve state, district, or city choices available within user's scope."""
    states = list(db.execute(select(State)).scalars().all())
    cities = list(db.execute(select(City)).scalars().all())
    
    scoped_states = [s for s in states if verify_geographic_scope(user, s.id, None, None, db)]
    scoped_cities = [c for c in cities if verify_geographic_scope(user, c.district.state_id if c.district else None, None, c.id, db)]
    
    return {
        "states": [{"id": str(s.id), "name": s.state_name} for s in scoped_states],
        "cities": [{"id": str(c.id), "name": c.city_name} for c in scoped_cities]
    }

# ----------------- WRITE Tools (Controlled Actions) -----------------

def create_incident(db: Session, user: User, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new incident report. Calls IncidentService.create_incident."""
    role_name = user.role.role_name if user.role else "citizen"
    if role_name not in ("dept_head", "state_admin", "admin", "national_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient role to create incidents"
        )
        
    from app.schemas.schemas import IncidentCreate
    # Parse dict to IncidentCreate schema
    incident_data = IncidentCreate(**data)
    inc = IncidentService.create_incident(db, incident_data, user.id)
    return {"id": str(inc.id), "ticket_number": inc.ticket_number, "status": inc.status}

def create_alert(db: Session, user: User, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new alert. Calls AlertService.create_alert."""
    al = AlertService.create_alert(db, user, data)
    return {"id": str(al.id), "title": al.title, "status": al.status}

def acknowledge_alert(db: Session, user: User, alert_id: str) -> Dict[str, Any]:
    """Acknowledge an active alert. Calls AlertService.acknowledge_alert."""
    al = AlertService.acknowledge_alert(db, user, alert_id)
    return {"id": str(al.id), "status": al.status}

def resolve_alert(db: Session, user: User, alert_id: str) -> Dict[str, Any]:
    """Resolve an alert. Calls AlertService.resolve_alert."""
    al = AlertService.resolve_alert(db, user, alert_id)
    return {"id": str(al.id), "status": al.status}

def allocate_resource(db: Session, user: User, incident_id: str, resource_id: str) -> Dict[str, Any]:
    """Allocate an emergency unit to a specific incident. Requires Human/Operator auth role."""
    alloc = ResourceService.allocate_resource(db, incident_id, resource_id, user)
    return {"id": str(alloc.id), "status": "allocated"}

def release_resource(db: Session, user: User, incident_id: str, resource_id: str) -> Dict[str, Any]:
    """Release an active resource allocation back to available. Requires Human/Operator auth role."""
    alloc = ResourceService.release_resource(db, incident_id, resource_id, user)
    return {"id": str(alloc.id), "status": "released"}

WEATHER_AQI_NODE_ID = "e47ac10b-58cc-4372-a567-0e02b2c3d495"

def get_weather(db: Session, user: User) -> Dict[str, Any]:
    """Retrieve weather telemetry and current conditions for Visakhapatnam if user scope permits."""
    node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
    if not node:
        return {"error": "Weather station node not found"}
        
    if not verify_geographic_scope(user, node.state_id, None, node.city_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: outside geographic scope"
        )
        
    telemetry = node.last_telemetry or {}
    if "temperature" not in telemetry:
        return {"status": "No weather data synchronized"}
        
    from app.services.data_sync_service import calculate_freshness
    obs_time = datetime.fromisoformat(telemetry.get("observed_at")) if telemetry.get("observed_at") else None
    return {
        "temperature_celsius": telemetry.get("temperature"),
        "relative_humidity_percent": telemetry.get("humidity"),
        "precipitation_mm": telemetry.get("precipitation"),
        "wind_speed_kmh": telemetry.get("wind_speed"),
        "weather_code": telemetry.get("weather_code"),
        "observed_at": telemetry.get("observed_at"),
        "freshness": calculate_freshness(obs_time) if obs_time else "UNKNOWN",
        "source_type": telemetry.get("source_type", "OPEN_DATA"),
        "source_name": telemetry.get("source_name", "Open-Meteo"),
        "source_url": telemetry.get("source_url", "")
    }

def get_air_quality(db: Session, user: User) -> Dict[str, Any]:
    """Retrieve air quality index (AQI) metrics for Visakhapatnam if user scope permits."""
    node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
    if not node:
        return {"error": "AQI station node not found"}
        
    if not verify_geographic_scope(user, node.state_id, None, node.city_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: outside geographic scope"
        )
        
    telemetry = node.last_telemetry or {}
    if "aqi" not in telemetry:
        return {"status": "No AQI data synchronized"}
        
    from app.services.data_sync_service import calculate_freshness
    aqi_obs_time = datetime.fromisoformat(telemetry.get("aqi_observed_at")) if telemetry.get("aqi_observed_at") else None
    return {
        "us_aqi": telemetry.get("aqi"),
        "pm2_5_ug_m3": telemetry.get("pm2_5"),
        "pm10_ug_m3": telemetry.get("pm10"),
        "nitrogen_dioxide_ug_m3": telemetry.get("nitrogen_dioxide"),
        "ozone_ug_m3": telemetry.get("ozone"),
        "observed_at": telemetry.get("aqi_observed_at"),
        "freshness": calculate_freshness(aqi_obs_time) if aqi_obs_time else "UNKNOWN",
        "source_type": telemetry.get("aqi_source_type", "OPEN_DATA"),
        "source_name": telemetry.get("aqi_source_name", "Open-Meteo"),
        "source_url": telemetry.get("aqi_source_url", "")
    }

def get_dashboard_overview(db: Session, user: User) -> Dict[str, Any]:
    """Get a comprehensive situational overview of incidents, resources, alerts, weather, and AQI."""
    role_name = user.role.role_name if user.role else "citizen"
    is_admin = role_name in ("admin", "national_admin")
    
    scope_city_id = user.city_id
    scope_district_id = user.district_id
    scope_state_id = user.state_id

    # 1. Incidents
    from app.models.models import Zone
    inc_query = db.query(Incident)
    if not is_admin:
        if scope_city_id:
            inc_query = inc_query.join(Zone, Incident.zone_id == Zone.id).filter(Zone.city_id == scope_city_id)
        elif scope_district_id:
            inc_query = inc_query.join(Zone, Incident.zone_id == Zone.id).join(City, Zone.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            inc_query = inc_query.join(Zone, Incident.zone_id == Zone.id).join(City, Zone.city_id == City.id).join(District, City.district_id == District.id).filter(District.state_id == scope_state_id)
        else:
            inc_query = inc_query.join(Zone, Incident.zone_id == Zone.id).filter(Zone.city_id == user.city_id)
    total_incidents = inc_query.count()
    active_incidents = inc_query.filter(Incident.status.in_(["active", "assigned", "in_progress"])).count()

    # 2. Alerts
    alert_query = db.query(Alert)
    if not is_admin:
        if scope_city_id:
            alert_query = alert_query.filter(Alert.city_id == scope_city_id)
        elif scope_district_id:
            alert_query = alert_query.join(City, Alert.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            alert_query = alert_query.filter(Alert.state_id == scope_state_id)
        else:
            alert_query = alert_query.filter(Alert.city_id == user.city_id)
    active_alerts = alert_query.filter(Alert.status.in_(["active", "acknowledged"])).count()

    # 3. Resources
    res_query = db.query(Resource)
    if not is_admin:
        if scope_city_id:
            res_query = res_query.filter(Resource.city_id == scope_city_id)
        elif scope_district_id:
            res_query = res_query.join(City, Resource.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            res_query = res_query.join(City, Resource.city_id == City.id).join(District, City.district_id == District.id).filter(District.state_id == scope_state_id)
        else:
            res_query = res_query.filter(Resource.city_id == user.city_id)
    total_resources = res_query.count()
    available_resources = res_query.filter(Resource.status == "available").count()
    allocated_resources = res_query.filter(Resource.status == "allocated").count()

    # 4. Facilities
    fac_query = db.query(Facility)
    if not is_admin:
        if scope_city_id:
            fac_query = fac_query.filter(Facility.city_id == scope_city_id)
        elif scope_district_id:
            fac_query = fac_query.filter(Facility.district_id == scope_district_id)
        elif scope_state_id:
            fac_query = fac_query.filter(Facility.state_id == scope_state_id)
        else:
            fac_query = fac_query.filter(Facility.city_id == user.city_id)
    total_facilities = fac_query.count()

    # 5. Nodes
    node_query = db.query(DigitalTwinNode)
    if not is_admin:
        if scope_city_id:
            node_query = node_query.filter(DigitalTwinNode.city_id == scope_city_id)
        elif scope_district_id:
            node_query = node_query.join(City, DigitalTwinNode.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            node_query = node_query.filter(DigitalTwinNode.state_id == scope_state_id)
        else:
            node_query = node_query.filter(DigitalTwinNode.city_id == user.city_id)
    total_nodes = node_query.count()

    # 6. Telemetry Records
    node_ids = [n.id for n in node_query.all()]
    total_telemetry = db.query(func.count(TelemetryRecord.id)).filter(TelemetryRecord.node_id.in_(node_ids)).scalar() or 0 if node_ids else 0

    # 7. Weather & AQI details
    weather_info = None
    aqi_info = None
    
    monitoring_node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
    if monitoring_node:
        has_node_access = is_admin or verify_geographic_scope(
            user=user,
            target_state_id=monitoring_node.state_id,
            target_city_id=monitoring_node.city_id,
            db=db
        )
            
        if has_node_access and monitoring_node.last_telemetry:
            telemetry = monitoring_node.last_telemetry
            from app.services.data_sync_service import calculate_freshness
            
            if "temperature" in telemetry:
                obs_time = datetime.fromisoformat(telemetry.get("observed_at")) if telemetry.get("observed_at") else None
                weather_info = {
                    "temperature": telemetry.get("temperature"),
                    "humidity": telemetry.get("humidity"),
                    "precipitation": telemetry.get("precipitation"),
                    "wind_speed": telemetry.get("wind_speed"),
                    "weather_code": telemetry.get("weather_code"),
                    "observed_at": telemetry.get("observed_at"),
                    "freshness": calculate_freshness(obs_time) if obs_time else "UNKNOWN",
                    "source_type": telemetry.get("source_type", "OPEN_DATA"),
                    "source_name": telemetry.get("source_name", "Open-Meteo"),
                    "source_url": telemetry.get("source_url", "")
                }
                
            if "aqi" in telemetry:
                aqi_obs_time = datetime.fromisoformat(telemetry.get("aqi_observed_at")) if telemetry.get("aqi_observed_at") else None
                aqi_info = {
                    "aqi": telemetry.get("aqi"),
                    "pm2_5": telemetry.get("pm2_5"),
                    "pm10": telemetry.get("pm10"),
                    "nitrogen_dioxide": telemetry.get("nitrogen_dioxide"),
                    "ozone": telemetry.get("ozone"),
                    "observed_at": telemetry.get("aqi_observed_at"),
                    "freshness": calculate_freshness(aqi_obs_time) if aqi_obs_time else "UNKNOWN",
                    "source_type": telemetry.get("aqi_source_type", "OPEN_DATA"),
                    "source_name": telemetry.get("aqi_source_name", "Open-Meteo"),
                    "source_url": telemetry.get("aqi_source_url", "")
                }

    return {
        "active_incidents_count": active_incidents,
        "total_incidents_count": total_incidents,
        "active_alerts_count": active_alerts,
        "resources": {
            "total": total_resources,
            "available": available_resources,
            "allocated": allocated_resources
        },
        "facilities_count": total_facilities,
        "digital_twin_nodes_count": total_nodes,
        "telemetry": {
            "total_records": total_telemetry,
            "status": "active" if total_telemetry > 0 else "inactive"
        },
        "weather": weather_info,
        "air_quality": aqi_info
    }

