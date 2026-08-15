import uuid
import asyncio
from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any, List
from sqlalchemy import select, and_, or_

from app.models.models import TelemetryRecord, DigitalTwinNode, Alert
from app.services.alert_service import AlertService
from app.repositories.alert_repository import AlertRepository

ALERT_RULES = {
    "water_level": {
        "metric": "water_level",
        "category": "WATER_LEVEL",
        "thresholds": [
            {"min_value": 4.5, "severity": "CRITICAL", "title": "Critical Flooding Alert", "description": "Water level breached critical threshold"},
            {"min_value": 4.0, "severity": "HIGH", "title": "High Water Level Alert", "description": "Water level breached warning threshold"}
        ]
    },
    "aqi": {
        "metric": "aqi",
        "category": "AIR_QUALITY",
        "thresholds": [
            {"min_value": 300.0, "severity": "CRITICAL", "title": "Severe AQI Alert", "description": "AQI level is hazardous"},
            {"min_value": 200.0, "severity": "HIGH", "title": "Poor AQI Alert", "description": "AQI level is unhealthy"}
        ]
    },
    "temperature": {
        "metric": "temperature",
        "category": "WEATHER",
        "thresholds": [
            {"min_value": 45.0, "severity": "CRITICAL", "title": "Extreme Heat Alert", "description": "Critical ambient temperature recorded"},
            {"min_value": 40.0, "severity": "HIGH", "title": "High Heat Alert", "description": "Warning level ambient temperature recorded"}
        ]
    }
}

class AlertRuleService:
    @staticmethod
    def evaluate_telemetry(db, telemetry: TelemetryRecord) -> Optional[Alert]:
        """Evaluate a single telemetry record against deterministic rules and generate an Alert if threshold is breached."""
        metric = telemetry.metric_type
        if metric not in ALERT_RULES:
            return None

        rule_config = ALERT_RULES[metric]
        matched_threshold = None
        
        # Sort thresholds descending by min_value to match highest breach first
        sorted_thresholds = sorted(rule_config["thresholds"], key=lambda x: x["min_value"], reverse=True)
        for t in sorted_thresholds:
            if telemetry.value >= t["min_value"]:
                matched_threshold = t
                break

        if not matched_threshold:
            return None

        # Resolve geographic info from telemetry node
        node = db.get(DigitalTwinNode, telemetry.node_id)
        if not node:
            return None

        source = "REAL_IOT" if getattr(telemetry, "source_type", None) == "REAL_IOT" else "SIMULATED"
        if source == "REAL_IOT":
            title = f"[REAL IoT] {matched_threshold['title']} at {node.name}"
        else:
            title = f"[SIMULATED] {matched_threshold['title']} at {node.name}"

        description = f"{matched_threshold['description']}: {telemetry.value}{telemetry.unit or ''} at sensor '{node.name}' (Node ID: {node.id})."
        severity = matched_threshold["severity"]
        category = rule_config["category"]

        # Deduplication Strategy:
        # Check if there is an already ACTIVE or ACKNOWLEDGED alert for this category/city/node recently
        repo = AlertRepository(db)
        existing_stmt = select(Alert).where(
            and_(
                Alert.city_id == node.city_id,
                Alert.category == category,
                or_(
                    Alert.status == "ACTIVE",
                    Alert.status == "ACKNOWLEDGED"
                ),
                Alert.title == title
            )
        )
        existing_alerts = list(db.execute(existing_stmt).scalars().all())

        if existing_alerts:
            # Duplicate found! Update/retain the existing alert instead of creating a duplicate
            existing_alert = existing_alerts[0]
            # Update description with latest value and extend expiration
            update_data = {
                "description": description,
                "expires_at": datetime.utcnow() + timedelta(hours=2)
            }
            repo.update_alert(existing_alert, data=update_data)
            db.commit()
            return existing_alert

        # No duplicate, create a new alert
        alert_data = {
            "title": title,
            "description": description,
            "severity": severity,
            "category": category,
            "state_id": node.state_id,
            "city_id": node.city_id,
            "source": source,
            "status": "ACTIVE",
            "expires_at": datetime.utcnow() + timedelta(hours=2)
        }

        # We need a system/user context or bypass RBAC check for telemetry ingestion.
        # We can construct a system dummy User or call repo.create_alert directly.
        # Since it's system-generated telemetry, calling repo.create_alert directly is clean and safe,
        # but let's make sure it is auditable or logged.
        new_alert = repo.create_alert(data=alert_data)
        
        # Log system action to audit log
        from app.repositories.incident_repository import IncidentRepository
        IncidentRepository.log_audit(
            db=db,
            user_id=None,  # system-generated
            action="ALERT_CREATED",
            table_name="alerts",
            record_id=new_alert.id,
            new_values={
                "title": new_alert.title,
                "severity": new_alert.severity,
                "category": new_alert.category,
                "source": source,
                "telemetry_record_id": str(telemetry.id)
            }
        )
        db.commit()

        # Check and create automatic incident for real IoT alerts
        if source == "REAL_IOT" and severity in ["HIGH", "CRITICAL"]:
            from app.models.models import Incident
            from app.services.incident_service import IncidentService
            from app.schemas.schemas import IncidentCreate
            
            # Deduplication check: check if an active (non-resolved) incident already exists for this node
            existing_incident = db.query(Incident).filter(
                Incident.status != "resolved",
                Incident.title == f"[REAL IoT ALERT] Critical water level at {node.name}"
            ).first()
            
            if not existing_incident:
                # Create automatic incident
                incident_in = IncidentCreate(
                    category="Flood",
                    title=f"[REAL IoT ALERT] Critical water level at {node.name}",
                    description=f"Automatic flood incident generated by BHARATOS IoT sensor '{node.name}'. Reading: {telemetry.value}{telemetry.unit or ''}.",
                    latitude=node.latitude,
                    longitude=node.longitude,
                    address=node.name,
                    severity=severity.lower(),
                    zone_id=None,
                    ward_id=None,
                    image_urls=[]
                )
                # Create using IncidentService
                incident = IncidentService.create_incident(db, incident_in, citizen_id=None)
                db.commit()
                db.refresh(incident)
                
                # Publish incident created WebSocket event
                from app.realtime.event_service import event_service
                try:
                    loop = asyncio.get_running_loop()
                    if loop.is_running():
                        loop.create_task(event_service.publish_incident_created(db, incident))
                    else:
                        loop.run_until_complete(event_service.publish_incident_created(db, incident))
                except RuntimeError:
                    asyncio.run(event_service.publish_incident_created(db, incident))

        return new_alert
