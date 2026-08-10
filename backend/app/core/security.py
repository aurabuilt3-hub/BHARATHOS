import uuid
from typing import Optional
from fastapi import HTTPException, status

def validate_uuid(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid UUID string format: '{value}'"
        )
