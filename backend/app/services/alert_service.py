import uuid
from typing import List, Dict, Any, Optional, Tuple
from fastapi import HTTPException, status
from datetime import datetime, UTC

from sqlalchemy import select, and_, func
from app.models.models import Alert, User
from app.repositories.alert_repository import AlertRepository
from app.dependencies.auth import verify_geographic_scope
from app.repositories.incident_repository import IncidentRepository  # for log_audit

ALLOWED_WRITE_ROLES = {
    "dept_head",
    "state_admin",
    "admin",
    "national_admin",
}

def _has_modify_permission(user: User) -> bool:
    role = user.role.role_name if user.role else "citizen"
    return role in ALLOWED_WRITE_ROLES

class AlertService:
    @staticmethod
    def _enforce_scope(
        user: User,
        target_state_id: Any = None,
        target_district_id: Any = None,
        target_city_id: Any = None,
        db: Any = None,
    ) -> None:
        if not verify_geographic_scope(
            user=user,
            target_state_id=target_state_id,
            target_district_id=target_district_id,
            target_city_id=target_city_id,
            db=db,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: outside geographic scope"
            )

    @classmethod
    def list_alerts(
        cls,
        db,
        user: User,
        *,
        page: int = 1,
        limit: int = 20,
        severity: Optional[str] = None,
        status_val: Optional[str] = None,
        alert_type: Optional[str] = None,
        source: Optional[str] = None,
        state_id: Optional[str] = None,
        district_id: Optional[str] = None,
        city_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        ward_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Tuple[List[Alert], int]:
        # Enforce scope on filters passed
        cls._enforce_scope(user, state_id, district_id, city_id, db)

        # Retract scoped operators to their scope if no filter is passed
        role_name = user.role.role_name if user.role else "citizen"
        
        # Build dictionary of final filters to pass to repository
        filters = {
            "severity": severity,
            "status": status_val,
            "alert_type": alert_type,
            "source": source,
            "state_id": state_id,
            "district_id": district_id,
            "city_id": city_id,
            "zone_id": zone_id,
            "ward_id": ward_id,
            "date_from": date_from,
            "date_to": date_to,
        }

        if role_name not in ("national_admin", "admin"):
            if user.city_id:
                if city_id and str(city_id) != str(user.city_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["city_id"] = str(user.city_id)
            elif user.district_id:
                if district_id and str(district_id) != str(user.district_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["district_id"] = str(user.district_id)
            elif user.state_id:
                if state_id and str(state_id) != str(user.state_id):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: outside geographic scope")
                filters["state_id"] = str(user.state_id)
            else:
                # If citizen has no geographical restriction defined, they get citizen permissions (no city_id limit)
                # or raise error if citizen is restricted. Usually citizen can see all public alerts.
                pass

        repo = AlertRepository(db)
        items = repo.list_alerts(page=page, limit=limit, **filters)
        total = repo.get_alert_count(**filters)
        return items, total

    @classmethod
    def get_alert(cls, db, user: User, alert_id: str) -> Alert:
        try:
            uid = uuid.UUID(alert_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

        alert = AlertRepository(db).get_alert(uid)
        if not alert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

        # Enforce scope on resource
        cls._enforce_scope(
            user=user,
            target_state_id=alert.state_id,
            target_city_id=alert.city_id,
            db=db
        )
        return alert

    @classmethod
    def create_alert(cls, db, user: User, data: Dict[str, Any]) -> Alert:
        if not _has_modify_permission(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role to create alerts"
            )

        state_id = data.get("state_id")
        city_id = data.get("city_id")

        cls._enforce_scope(user, state_id, None, city_id, db)

        alert = AlertRepository(db).create_alert(data=data)

        # Log audit action
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="ALERT_CREATED",
            table_name="alerts",
            record_id=alert.id,
            new_values={
                "title": alert.title,
                "severity": alert.severity,
                "category": alert.category,
                "status": alert.status
            }
        )
        return alert

    @classmethod
    def acknowledge_alert(cls, db, user: User, alert_id: str) -> Alert:
        if not _has_modify_permission(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role to modify alerts"
            )

        alert = cls.get_alert(db, user, alert_id)

        # Check transition validation: ACTIVE -> ACKNOWLEDGED
        current_status = str(alert.status).upper()
        if current_status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition: Cannot acknowledge alert in status '{current_status}'"
            )

        updated_alert = AlertRepository(db).update_alert(alert, data={"status": "ACKNOWLEDGED"})

        # Log audit action
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="ALERT_ACKNOWLEDGED",
            table_name="alerts",
            record_id=alert.id,
            new_values={"status": "ACKNOWLEDGED"}
        )
        return updated_alert

    @classmethod
    def resolve_alert(cls, db, user: User, alert_id: str) -> Alert:
        if not _has_modify_permission(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role to modify alerts"
            )

        alert = cls.get_alert(db, user, alert_id)

        # Check transition validation: ACTIVE -> RESOLVED, ACKNOWLEDGED -> RESOLVED
        current_status = str(alert.status).upper()
        if current_status not in ("ACTIVE", "ACKNOWLEDGED"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition: Cannot resolve alert in status '{current_status}'"
            )

        updated_alert = AlertRepository(db).update_alert(alert, data={"status": "RESOLVED"})

        # Log audit action
        IncidentRepository.log_audit(
            db=db,
            user_id=user.id,
            action="ALERT_RESOLVED",
            table_name="alerts",
            record_id=alert.id,
            new_values={"status": "RESOLVED"}
        )
        return updated_alert

    @classmethod
    def expire_alerts(cls, db) -> int:
        now = datetime.now(UTC)
        repo = AlertRepository(db)
        
        # Find all alerts that are ACTIVE/ACKNOWLEDGED and past their expiry
        from sqlalchemy import or_
        from app.models.models import Alert
        
        stmt = select(Alert).where(
            and_(
                or_(
                    func.upper(Alert.status) == "ACTIVE",
                    func.upper(Alert.status) == "ACKNOWLEDGED"
                ),
                Alert.expires_at < now
            )
        )
        expired_list = list(db.execute(stmt).scalars().all())
        
        count = 0
        for alert in expired_list:
            repo.update_alert(alert, data={"status": "EXPIRED"})
            IncidentRepository.log_audit(
                db=db,
                user_id=None,
                action="ALERT_EXPIRED",
                table_name="alerts",
                record_id=alert.id,
                new_values={"status": "EXPIRED"}
            )
            count += 1
            
        if count > 0:
            db.commit()
            
        return count

    @classmethod
    def get_summary(cls, db, user: User) -> Dict[str, int]:
        role_name = user.role.role_name if user.role else "citizen"
        
        state_id = None
        city_id = None
        district_id = None

        if role_name not in ("national_admin", "admin"):
            if user.city_id:
                city_id = str(user.city_id)
            elif user.district_id:
                district_id = str(user.district_id)
            elif user.state_id:
                state_id = str(user.state_id)

        repo = AlertRepository(db)
        status_counts = repo.count_by_status(state_id=state_id, city_id=city_id, district_id=district_id)
        severity_counts = repo.count_by_severity(state_id=state_id, city_id=city_id, district_id=district_id)

        total = sum(status_counts.values())

        return {
            "total": total,
            "active": status_counts.get("ACTIVE", 0),
            "acknowledged": status_counts.get("ACKNOWLEDGED", 0),
            "resolved": status_counts.get("RESOLVED", 0),
            "expired": status_counts.get("EXPIRED", 0),
            "critical": severity_counts.get("CRITICAL", 0),
            "high": severity_counts.get("HIGH", 0),
            "medium": severity_counts.get("MEDIUM", 0),
            "low": severity_counts.get("LOW", 0),
        }
