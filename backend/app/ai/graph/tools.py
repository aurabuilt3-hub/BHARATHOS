from typing import List, Dict, Any, Optional
import uuid
from sqlalchemy.orm import Session
from langchain_core.tools import tool

from app.models.models import User, DigitalTwinNode
from app.agents.tools import (
    get_incidents as raw_get_incidents,
    get_incident as raw_get_incident,
    get_alerts as raw_get_alerts,
    get_facilities as raw_get_facilities,
    get_resources as raw_get_resources,
    get_available_resources as raw_get_available_resources,
    get_telemetry as raw_get_telemetry,
    get_digital_twin_nodes as raw_get_digital_twin_nodes,
    get_weather as raw_get_weather,
    get_air_quality as raw_get_air_quality,
    get_dashboard_overview as raw_get_dashboard_overview
)

def validate_resource_recommendation(
    recommended_resource_id: Optional[str],
    available_resources: List[Dict[str, Any]]
) -> tuple[Optional[str], Optional[str]]:
    """
    Validates that a recommended resource ID actually exists in the list of available resources.
    Returns (validated_id, adjustment_reason).
    """
    if not recommended_resource_id:
        return None, "No resource ID was recommended."

    # Validate ID exists in available resources list
    for res in available_resources:
        if str(res.get("id")) == str(recommended_resource_id):
            return str(res["id"]), None

    return None, f"Recommended resource ID '{recommended_resource_id}' does not exist in available assets or is out of scope."

def create_agent_tools(db: Session, user: User) -> List[Any]:
    """
    Factory function generating normalized, read-only LangChain tools
    binding database session and geographic user scope context.
    """

    @tool
    def get_weather_tool() -> Dict[str, Any]:
        """Retrieve current weather conditions and rainfall metrics for Visakhapatnam."""
        raw = raw_get_weather(db, user)
        return {
            "location": raw.get("city", "Visakhapatnam"),
            "rainfall_mm": raw.get("rainfall_24h_mm", 0),
            "temperature_c": raw.get("temperature_celsius", 28),
            "forecast": raw.get("condition", "rain")
        }

    @tool
    def get_telemetry_tool(node_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve dynamic water level and storm drain telemetry records. Preserves source provenance (SIMULATED or REAL_IOT)."""
        filters = {}
        if node_id:
            filters["node_id"] = node_id
        raw = raw_get_telemetry(db, user, **filters)
        
        # Enforce page limits to prevent context blowing up
        raw = raw[:30]
        
        out = []
        for r in raw:
            node = db.get(DigitalTwinNode, uuid.UUID(r["node_id"]))
            src_type = "SIMULATED"
            if node and node.last_telemetry:
                src_type = node.last_telemetry.get("source_type", "SIMULATED")
            
            out.append({
                "node_id": str(r.get("node_id")),
                "node_name": r.get("node_name"),
                "metric_type": r.get("metric_type", "water_level"),
                "value": r.get("value"),
                "unit": r.get("unit"),
                "status": r.get("status"),
                "source_type": src_type,
                "timestamp": r.get("timestamp")
            })
        return out

    @tool
    def get_incidents_tool(status: Optional[str] = None, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        """List active or historical flood incidents inside the user's geographic authorization boundary."""
        filters = {}
        if status:
            filters["status"] = status
        if severity:
            filters["severity"] = severity
        raw = raw_get_incidents(db, user, **filters)
        raw = raw[:30]
        return [
            {
                "id": str(r.get("id")),
                "ticket_number": r.get("ticket_number"),
                "title": r.get("title"),
                "description": r.get("description"),
                "status": r.get("status"),
                "severity": r.get("priority"),
                "category": r.get("category"),
                "source_type": r.get("source_type", "VERIFIED_PUBLIC")
            }
            for r in raw
        ]

    @tool
    def get_incident_details_tool(incident_id: str) -> Dict[str, Any]:
        """Retrieve metadata, description, and severity state for a single incident by its ID."""
        if not incident_id or len(incident_id.strip()) > 50:
            raise ValueError("Invalid incident ID format.")
        r = raw_get_incident(db, user, incident_id)
        return {
            "id": str(r.get("id")),
            "ticket_number": r.get("ticket_number"),
            "title": r.get("title"),
            "description": r.get("description"),
            "status": r.get("status"),
            "severity": r.get("priority"),
            "category": r.get("category"),
            "source_type": r.get("source_type", "VERIFIED_PUBLIC")
        }

    @tool
    def get_alerts_tool(status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get regional disaster warnings and critical weather alerts."""
        filters = {}
        if status:
            filters["status"] = status
        raw = raw_get_alerts(db, user, **filters)
        raw = raw[:30]
        return [
            {
                "id": str(r.get("id")),
                "title": r.get("title"),
                "severity": r.get("severity"),
                "status": r.get("status"),
                "source_type": "REAL_IOT" if r.get("source_type") == "REAL_IOT" else "SIMULATED"
            }
            for r in raw
        ]

    @tool
    def get_available_resources_tool(resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """List active, unassigned emergency response assets (e.g. dewatering pumps, fire tenders, rescue boats)."""
        filters = {}
        if resource_type:
            filters["resource_type"] = resource_type
        raw = raw_get_available_resources(db, user, **filters)
        raw = raw[:30]
        return [
            {
                "id": str(r.get("id")),
                "name": r.get("name"),
                "type": r.get("type"),
                "status": r.get("status"),
                "capacity": r.get("capacity"),
                "location_coords": r.get("location_coords")
            }
            for r in raw
        ]

    @tool
    def get_facilities_tool(facility_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """List municipal relief centers, safe shelters, and hospitals in the local district."""
        filters = {}
        if facility_type:
            filters["facility_type"] = facility_type
        raw = raw_get_facilities(db, user, **filters)
        raw = raw[:30]
        return [
            {
                "id": str(r.get("id")),
                "name": r.get("name"),
                "type": r.get("type"),
                "status": r.get("status"),
                "capacity": r.get("capacity")
            }
            for r in raw
        ]

    @tool
    def get_dashboard_overview_tool() -> Dict[str, Any]:
        """Fetch general count KPIs of active incidents, alerts, and available resources."""
        raw = raw_get_dashboard_overview(db, user)
        return {
            "active_incidents": raw.get("active_incidents", 0),
            "active_alerts": raw.get("active_alerts", 0),
            "available_resources": raw.get("available_resources", 0)
        }

    return [
        get_weather_tool,
        get_telemetry_tool,
        get_incidents_tool,
        get_incident_details_tool,
        get_alerts_tool,
        get_available_resources_tool,
        get_facilities_tool,
        get_dashboard_overview_tool
    ]
