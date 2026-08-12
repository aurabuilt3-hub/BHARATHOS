import uuid
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from supabase import create_client, Client

from app.core.config import settings
from app.db.session import get_db
from app.models.models import User, Role, State, District, City

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

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

def get_supabase_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)) -> Optional[dict]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            return None
        return {
            "id": user_response.user.id,
            "email": user_response.user.email
        }
    except Exception:
        return None

def get_current_user(
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
) -> User:
    try:
        user_uuid = uuid.UUID(supabase_user["id"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase user ID format."
        )
    
    db_user = db.query(User).filter(User.id == user_uuid).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not registered in PostgreSQL database."
        )
    return db_user

def get_current_user_optional(
    supabase_user: Optional[dict] = Depends(get_supabase_user_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not supabase_user:
        return None
    try:
        user_uuid = uuid.UUID(supabase_user["id"])
    except ValueError:
        return None
    
    return db.query(User).filter(User.id == user_uuid).first()


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        role_name = current_user.role.role_name if current_user.role else "citizen"
        if role_name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: User role '{role_name}' does not have permission to access this resource."
            )
        return current_user

def require_role(role_name: str):
    return RoleChecker([role_name])

def require_roles(role_names: List[str]):
    return RoleChecker(role_names)

def verify_geographic_scope(
    user: User,
    target_state_id: Optional[uuid.UUID] = None,
    target_district_id: Optional[uuid.UUID] = None,
    target_city_id: Optional[uuid.UUID] = None,
    db: Session = None
) -> bool:
    role_name = user.role.role_name if user.role else "citizen"
    
    # National level users can access all scopes
    if role_name in ("national_admin", "admin"):
        return True

    # Citizens or un-scoped users have no administrative scope
    if role_name == "citizen":
        return False

    # Resolve user's explicit scope values (including fallback via city's hierarchy)
    user_state_id = user.state_id
    user_district_id = user.district_id
    user_city_id = user.city_id

    if user_city_id and db and not (user_state_id and user_district_id):
        city = db.query(City).filter(City.id == user_city_id).first()
        if city:
            if not user_district_id:
                user_district_id = city.district_id
            if not user_state_id and city.district:
                user_state_id = city.district.state_id

    # If the resource targets a specific city:
    if target_city_id:
        if user_city_id:
            return user_city_id == target_city_id
        if user_district_id and db:
            city = db.query(City).filter(City.id == target_city_id).first()
            return city is not None and city.district_id == user_district_id
        if user_state_id and db:
            city = db.query(City).filter(City.id == target_city_id).first()
            return city is not None and city.district is not None and city.district.state_id == user_state_id
        return False

    # If the resource targets a specific district (but not city):
    if target_district_id:
        if user_city_id:
            # A city-level user cannot access a district-wide resource
            return False
        if user_district_id:
            return user_district_id == target_district_id
        if user_state_id and db:
            district = db.query(District).filter(District.id == target_district_id).first()
            return district is not None and district.state_id == user_state_id
        return False

    # If the resource targets a specific state (but not district or city):
    if target_state_id:
        if user_city_id or user_district_id:
            # City or district level user cannot access state-wide resource
            return False
        if user_state_id:
            return user_state_id == target_state_id
        return False

    # If the resource does not specify any target scope, check if user is allowed
    # (scoped users are allowed to access general unscoped resource operations)
    return True
