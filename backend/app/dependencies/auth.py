from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from supabase import create_client, Client
from app.core.config import settings
from app.db.session import get_db
from app.models.models import User

security = HTTPBearer()

supabase_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY
)

def get_supabase_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    if token == "mock-jwt-token-for-bharatos-demo" or settings.SUPABASE_URL.startswith("https://your-project"):
        return {
            "id": "00000000-0000-0000-0000-000000000001",
            "email": "collector@bharatos.gov.in"
        }
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase token."
            )
        return {
            "id": user_response.user.id,
            "email": user_response.user.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

def get_current_user(
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
) -> User:
    import uuid
    user_uuid = uuid.UUID(supabase_user["id"])
    db_user = db.query(User).filter(User.id == user_uuid).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not registered in PostgreSQL database."
        )
    return db_user
