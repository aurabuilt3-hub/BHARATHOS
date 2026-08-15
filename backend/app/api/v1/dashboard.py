from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, select
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

from app.db.session import get_db
from app.models.models import User, Incident, Alert, Resource, Facility, DigitalTwinNode, TelemetryRecord, City, District
from app.dependencies.auth import get_current_user, verify_geographic_scope
from app.services.data_sync_service import calculate_freshness

router = APIRouter(prefix="/dashboard", tags=["Dashboard Aggregates"])

WEATHER_AQI_NODE_ID = "e47ac10b-58cc-4372-a567-0e02b2c3d495"

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Incident.id)).scalar() or 0
    active = db.query(func.count(Incident.id)).filter(Incident.status == "active").scalar() or 0
    assigned = db.query(func.count(Incident.id)).filter(Incident.status == "assigned").scalar() or 0
    in_progress = db.query(func.count(Incident.id)).filter(Incident.status == "in_progress").scalar() or 0
    resolved = db.query(func.count(Incident.id)).filter(Incident.status == "resolved").scalar() or 0
    critical = db.query(func.count(Incident.id)).filter(Incident.severity == "critical").scalar() or 0

    return {
        "total_incidents": total,
        "active_incidents": active,
        "assigned_incidents": assigned,
        "in_progress_incidents": in_progress,
        "resolved_incidents": resolved,
        "critical_alerts": critical
    }


@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role_name = current_user.role.role_name if current_user.role else "citizen"
    is_admin = role_name in ("admin", "national_admin")
    
    scope_city_id = current_user.city_id
    scope_district_id = current_user.district_id
    scope_state_id = current_user.state_id

    # 1. Incidents Count
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
            # Citizen fallback
            inc_query = inc_query.join(Zone, Incident.zone_id == Zone.id).filter(Zone.city_id == current_user.city_id)
            
    total_incidents = inc_query.count()
    active_incidents = inc_query.filter(Incident.status.in_(["active", "assigned", "in_progress"])).count()

    # 2. Alerts Count
    alert_query = db.query(Alert)
    if not is_admin:
        if scope_city_id:
            alert_query = alert_query.filter(Alert.city_id == scope_city_id)
        elif scope_district_id:
            alert_query = alert_query.join(City, Alert.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            alert_query = alert_query.filter(Alert.state_id == scope_state_id)
        else:
            alert_query = alert_query.filter(Alert.city_id == current_user.city_id)
            
    active_alerts = alert_query.filter(Alert.status.in_(["active", "acknowledged"])).count()

    # 3. Resources Count
    res_query = db.query(Resource)
    if not is_admin:
        if scope_city_id:
            res_query = res_query.filter(Resource.city_id == scope_city_id)
        elif scope_district_id:
            res_query = res_query.join(City, Resource.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            res_query = res_query.join(City, Resource.city_id == City.id).join(District, City.district_id == District.id).filter(District.state_id == scope_state_id)
        else:
            res_query = res_query.filter(Resource.city_id == current_user.city_id)

    total_resources = res_query.count()
    available_resources = res_query.filter(Resource.status == "available").count()
    allocated_resources = res_query.filter(Resource.status == "allocated").count()

    # 4. Facilities Count
    fac_query = db.query(Facility)
    if not is_admin:
        if scope_city_id:
            fac_query = fac_query.filter(Facility.city_id == scope_city_id)
        elif scope_district_id:
            fac_query = fac_query.filter(Facility.district_id == scope_district_id)
        elif scope_state_id:
            fac_query = fac_query.filter(Facility.state_id == scope_state_id)
        else:
            fac_query = fac_query.filter(Facility.city_id == current_user.city_id)
            
    total_facilities = fac_query.count()

    # 5. Digital Twin Nodes Count
    node_query = db.query(DigitalTwinNode)
    if not is_admin:
        if scope_city_id:
            node_query = node_query.filter(DigitalTwinNode.city_id == scope_city_id)
        elif scope_district_id:
            node_query = node_query.join(City, DigitalTwinNode.city_id == City.id).filter(City.district_id == scope_district_id)
        elif scope_state_id:
            node_query = node_query.filter(DigitalTwinNode.state_id == scope_state_id)
        else:
            node_query = node_query.filter(DigitalTwinNode.city_id == current_user.city_id)
            
    total_nodes = node_query.count()

    # 6. Telemetry Records Count
    # Sum of telemetry records matching accessible nodes
    node_ids = [n.id for n in node_query.all()]
    if node_ids:
        total_telemetry = db.query(func.count(TelemetryRecord.id)).filter(TelemetryRecord.node_id.in_(node_ids)).scalar() or 0
    else:
        total_telemetry = 0

    # 7. Weather & AQI (Sourced from seeded node e47ac10b-58cc-4372-a567-0e02b2c3d495)
    # Check if user geographic scope allows checking this node
    weather_info = None
    aqi_info = None
    
    monitoring_node = db.get(DigitalTwinNode, uuid.UUID(WEATHER_AQI_NODE_ID))
    if monitoring_node:
        has_node_access = False
        if is_admin:
            has_node_access = True
        else:
            has_node_access = verify_geographic_scope(
                user=current_user,
                target_state_id=monitoring_node.state_id,
                target_city_id=monitoring_node.city_id,
                db=db
            )
            
        if has_node_access and monitoring_node.last_telemetry:
            telemetry = monitoring_node.last_telemetry
            
            # Weather details
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
                
            # AQI details
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
