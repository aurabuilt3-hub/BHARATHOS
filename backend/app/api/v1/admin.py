from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import os
import json

from app.dependencies.auth import require_roles
from app.models.models import User

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

REPORT_PATH = "C:/Users/surya/Desktop/BharatOS/backend/app/data_sources/ingestion_report.json"

class IngestionStatusResponse(BaseModel):
    last_run: Optional[str] = None
    dry_run: bool = False
    source: str = "OpenStreetMap + AP Govt Directory Snapshot"
    discovered_count: int = 0
    inserted_count: int = 0
    updated_count: int = 0
    duplicate_count: int = 0
    invalid_count: int = 0
    needs_review_count: int = 0
    errors: List[str] = []

@router.get("/data-ingestion/status", response_model=IngestionStatusResponse)
def get_ingestion_status(
    current_user: User = Depends(require_roles(["admin", "national_admin"]))
):
    if not os.path.exists(REPORT_PATH):
        # If no ingestion has run yet, return empty defaults
        return IngestionStatusResponse()

    try:
        with open(REPORT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            stats = data.get("stats", {})
            return IngestionStatusResponse(
                last_run=data.get("last_run"),
                dry_run=data.get("dry_run", False),
                source=stats.get("source", "OpenStreetMap + AP Govt Directory Snapshot"),
                discovered_count=stats.get("discovered", 0),
                inserted_count=stats.get("inserted", 0),
                updated_count=stats.get("updated", 0),
                duplicate_count=stats.get("duplicates", 0),
                invalid_count=stats.get("invalid", 0),
                needs_review_count=stats.get("needs_review", 0),
                errors=stats.get("errors", [])
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read ingestion status report: {str(e)}"
        )
