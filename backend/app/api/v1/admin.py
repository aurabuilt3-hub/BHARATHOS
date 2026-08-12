from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies.auth import require_roles
from app.models.models import User, AuditLog, TelemetryRecord, DigitalTwinNode
from app.db.session import get_db
from app.services.data_sync_service import DataSyncService
from app.services.alert_rule_service import AlertRuleService
from app.realtime.event_service import event_service

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

REPORT_PATH = "C:/Users/surya/Desktop/BharatOS/backend/app/data_sources/ingestion_report.json"

class SourceStatus(BaseModel):
    status: str
    records_processed: int
    records_created: int
    records_updated: int
    errors: List[str] = []

class IngestionStatusResponse(BaseModel):
    last_run: Optional[str] = None
    status: str = "unknown"
    duration_ms: int = 0
    sources: Dict[str, Any] = {}

@router.get("/data-ingestion/status", response_model=IngestionStatusResponse)
def get_ingestion_status(
    current_user: User = Depends(require_roles(["admin", "national_admin"])),
    db: Session = Depends(get_db)
):
    # Fetch from PostgreSQL AuditLog (Authoritative Source)
    stmt = select(AuditLog).where(AuditLog.action == "DATA_INGESTION_SYNC").order_by(AuditLog.created_at.desc()).limit(1)
    latest_sync = db.execute(stmt).scalar_one_or_none()
    
    if latest_sync and latest_sync.new_values:
        report = latest_sync.new_values
        return IngestionStatusResponse(
            last_run=report.get("completed_at") or latest_sync.created_at.isoformat(),
            status=report.get("status", "success"),
            duration_ms=report.get("duration_ms", 0),
            sources=report.get("sources", {})
        )

    # Fallback to local JSON report
    if os.path.exists(REPORT_PATH):
        try:
            with open(REPORT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                stats = data.get("stats", {})
                errors = stats.get("errors", [])
                
                # Format to match the new schema
                source_reports = {
                    "open_meteo_weather": {
                        "status": "success" if not errors else "warning",
                        "records_processed": stats.get("discovered", 0),
                        "records_created": stats.get("inserted", 0),
                        "records_updated": stats.get("updated", 0),
                        "errors": errors
                    }
                }
                return IngestionStatusResponse(
                    last_run=data.get("last_run"),
                    status="success" if not errors else "failed",
                    duration_ms=0,
                    sources=source_reports
                )
        except Exception:
            pass

    return IngestionStatusResponse()


@router.post("/data-ingestion/sync")
async def trigger_data_ingestion(
    current_user: User = Depends(require_roles(["admin", "national_admin"])),
    db: Session = Depends(get_db)
):
    try:
        report = DataSyncService.sync_all(db, user_id=current_user.id)
        
        # Query recently ingested telemetry records (within last 60 seconds)
        records = db.query(TelemetryRecord).filter(
            TelemetryRecord.timestamp >= datetime.utcnow() - timedelta(seconds=60)
        ).all()
        
        for rec in records:
            node = db.get(DigitalTwinNode, rec.node_id)
            if node:
                alert = AlertRuleService.evaluate_telemetry(db, rec)
                await event_service.publish_telemetry_updated(db, rec, node)
                if alert:
                    await event_service.publish_alert_created(db, alert)
                    
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Synchronization failed: {str(e)}"
        )
