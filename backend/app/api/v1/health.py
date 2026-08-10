from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("", status_code=status.HTTP_200_OK)
def health_check():
    return {
        "status": "ok",
        "service": "BHARATOS Backend",
        "version": "1.0.0"
    }

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        # Perform simple SELECT 1 database query check
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected"
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "database": "unavailable"
            }
        )
