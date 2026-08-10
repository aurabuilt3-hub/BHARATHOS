from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import Incident

router = APIRouter(prefix="/dashboard", tags=["Dashboard Aggregates"])

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
