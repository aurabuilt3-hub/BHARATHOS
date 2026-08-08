from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from app.schemas.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "error"

    supabase_status = "configured" if settings.SUPABASE_URL else "missing"
    env_status = "valid"

    return HealthResponse(
        status="active",
        database=db_status,
        supabase=supabase_status,
        env_config=env_status,
        timestamp=datetime.utcnow()
    )
