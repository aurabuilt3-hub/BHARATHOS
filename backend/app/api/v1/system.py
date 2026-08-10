import time
import sys
from datetime import datetime
from fastapi import APIRouter
from app.schemas.schemas import SystemStatusResponse, VersionResponse

router = APIRouter(prefix="/system", tags=["Health & Status"])

START_TIME = time.time()

@router.get("/status", response_model=SystemStatusResponse)
def get_system_status():
    uptime = time.time() - START_TIME
    return SystemStatusResponse(
        status="running",
        uptime_seconds=round(uptime, 2),
        platform=sys.platform,
        timestamp=datetime.utcnow()
    )

@router.get("/version", response_model=VersionResponse)
def get_version():
    return VersionResponse(
        version="1.0.0",
        sprint="Sprint 4",
        environment="development",
        timestamp=datetime.utcnow()
    )
