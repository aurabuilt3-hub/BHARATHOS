from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from supabase import create_client, Client

from config import settings
from database import get_db
from models.models import User, Role

security = HTTPBearer()

# Initialize the official Supabase client on the backend using service role key
# Service role key bypasses RLS on database actions, but here we query auth.users API
supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    try:
        # Validate token using official Supabase client auth API
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Supabase Auth validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    supabase_user = Depends(get_supabase_user),
    db: Session = Depends(get_db)
) -> User:
    # Query custom user table in PostgreSQL matching the Supabase UUID
    user = db.query(User).filter(User.id == supabase_user.id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supabase session is active, but profile is not initialized in custom users database.",
        )
    return user
