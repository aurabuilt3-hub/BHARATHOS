from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.models.models import Alert, City

DEFAULT_LIMIT = 20
MAX_LIMIT = 100

class AlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_alerts(
        self,
        *,
        page: int = 1,
        limit: int = DEFAULT_LIMIT,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        alert_type: Optional[str] = None,  # maps to Alert.category
        source: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        ward_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> List[Alert]:
        if limit > MAX_LIMIT:
            limit = MAX_LIMIT
        offset = (page - 1) * limit

        stmt = select(Alert)

        # Apply filters
        if severity:
            stmt = stmt.where(func.lower(Alert.severity) == severity.lower())
        if status:
            stmt = stmt.where(func.lower(Alert.status) == status.lower())
        if alert_type:
            stmt = stmt.where(func.lower(Alert.category) == alert_type.lower())
        if source:
            stmt = stmt.where(func.lower(Alert.source) == source.lower())
        if state_id:
            stmt = stmt.where(Alert.state_id == uuid.UUID(state_id))
        if city_id:
            stmt = stmt.where(Alert.city_id == uuid.UUID(city_id))
            
        # Join with City for district filtering since Alert does not have district_id directly
        if district_id:
            stmt = stmt.join(City, Alert.city_id == City.id).where(City.district_id == uuid.UUID(district_id))

        if date_from:
            stmt = stmt.where(Alert.created_at >= date_from)
        if date_to:
            stmt = stmt.where(Alert.created_at <= date_to)

        # For zone_id/ward_id, since Alert has no direct relationship or column, if they are passed
        # we can check if the Alert's city contains that zone/ward or we can just allow it to return
        # city-level alerts if the user wants city-wide alerts.
        # But to be safe and avoid query errors, we don't apply zone_id/ward_id filters unless requested.
        # (There are no zone_id/ward_id columns in alerts table).

        stmt = stmt.order_by(Alert.created_at.desc()).offset(offset).limit(limit)
        return list(self.db.execute(stmt).scalars().all())

    def get_alert_count(
        self,
        *,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        alert_type: Optional[str] = None,
        source: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        ward_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> int:
        stmt = select(func.count(Alert.id))
        if severity:
            stmt = stmt.where(func.lower(Alert.severity) == severity.lower())
        if status:
            stmt = stmt.where(func.lower(Alert.status) == status.lower())
        if alert_type:
            stmt = stmt.where(func.lower(Alert.category) == alert_type.lower())
        if source:
            stmt = stmt.where(func.lower(Alert.source) == source.lower())
        if state_id:
            stmt = stmt.where(Alert.state_id == uuid.UUID(state_id))
        if city_id:
            stmt = stmt.where(Alert.city_id == uuid.UUID(city_id))
        if district_id:
            stmt = stmt.join(City, Alert.city_id == City.id).where(City.district_id == uuid.UUID(district_id))
        if date_from:
            stmt = stmt.where(Alert.created_at >= date_from)
        if date_to:
            stmt = stmt.where(Alert.created_at <= date_to)

        return self.db.execute(stmt).scalar() or 0

    def get_alert(self, alert_id: uuid.UUID) -> Optional[Alert]:
        return self.db.get(Alert, alert_id)

    def create_alert(self, *, data: Dict[str, Any]) -> Alert:
        # Standardize strings to uppercase
        severity = str(data.get("severity", "MEDIUM")).upper()
        status_val = str(data.get("status", "ACTIVE")).upper()
        category = str(data.get("category", "OTHER")).upper()

        alert = Alert(
            id=uuid.uuid4(),
            title=data["title"],
            description=data["description"],
            severity=severity,
            category=category,
            state_id=data.get("state_id"),
            city_id=data.get("city_id"),
            source=data.get("source", "system"),
            status=status_val,
            expires_at=data.get("expires_at")
        )
        self.db.add(alert)
        self.db.flush()
        return alert

    def update_alert(self, alert: Alert, *, data: Dict[str, Any]) -> Alert:
        for field in ("title", "description", "expires_at", "source"):
            if field in data and data[field] is not None:
                setattr(alert, field, data[field])
        
        if "severity" in data and data["severity"] is not None:
            alert.severity = str(data["severity"]).upper()
        if "category" in data and data["category"] is not None:
            alert.category = str(data["category"]).upper()
        if "status" in data and data["status"] is not None:
            alert.status = str(data["status"]).upper()
        if "state_id" in data:
            alert.state_id = data["state_id"]
        if "city_id" in data:
            alert.city_id = data["city_id"]

        alert.updated_at = datetime.utcnow()
        self.db.flush()
        return alert

    def count_by_severity(self, *, state_id: Optional[str] = None, city_id: Optional[str] = None, district_id: Optional[str] = None) -> Dict[str, int]:
        stmt = select(Alert.severity, func.count(Alert.id))
        if state_id:
            stmt = stmt.where(Alert.state_id == uuid.UUID(state_id))
        if city_id:
            stmt = stmt.where(Alert.city_id == uuid.UUID(city_id))
        if district_id:
            stmt = stmt.join(City, Alert.city_id == City.id).where(City.district_id == uuid.UUID(district_id))
        
        stmt = stmt.group_by(Alert.severity)
        rows = self.db.execute(stmt).all()
        counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for severity_name, count in rows:
            counts[str(severity_name).upper()] = count
        return counts

    def count_by_status(self, *, state_id: Optional[str] = None, city_id: Optional[str] = None, district_id: Optional[str] = None) -> Dict[str, int]:
        stmt = select(Alert.status, func.count(Alert.id))
        if state_id:
            stmt = stmt.where(Alert.state_id == uuid.UUID(state_id))
        if city_id:
            stmt = stmt.where(Alert.city_id == uuid.UUID(city_id))
        if district_id:
            stmt = stmt.join(City, Alert.city_id == City.id).where(City.district_id == uuid.UUID(district_id))
            
        stmt = stmt.group_by(Alert.status)
        rows = self.db.execute(stmt).all()
        counts = {"ACTIVE": 0, "ACKNOWLEDGED": 0, "RESOLVED": 0, "EXPIRED": 0}
        for status_name, count in rows:
            counts[str(status_name).upper()] = count
        return counts
