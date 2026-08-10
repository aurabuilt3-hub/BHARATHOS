import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_supabase_user, get_current_user
from app.models.models import User, Role, City, District
from app.schemas.schemas import ProfileCreate, UserResponse, UserScope

router = APIRouter(tags=["Authentication & Users"])

def get_user_scope_dict(user: User, db: Session) -> dict:
    state_id = user.state_id
    district_id = user.district_id
    city_id = user.city_id

    if city_id and not (state_id and district_id):
        city = db.query(City).filter(City.id == city_id).first()
        if city:
            if not district_id:
                district_id = city.district_id
            if not state_id and city.district:
                state_id = city.district.state_id
                
    return {
        "state_id": state_id,
        "district_id": district_id,
        "city_id": city_id
    }

def sync_profile_internal(
    profile_in: ProfileCreate,
    supabase_user: dict,
    db: Session
) -> UserResponse:
    user_uuid = uuid.UUID(supabase_user["id"])
    email = supabase_user["email"]

    existing_user = db.query(User).filter(User.id == user_uuid).first()
    if existing_user:
        # Update only safe fields
        existing_user.full_name = profile_in.full_name
        if profile_in.phone is not None:
            existing_user.phone = profile_in.phone
        db.commit()
        db.refresh(existing_user)
        
        role_name = existing_user.role.role_name if existing_user.role else "citizen"
        scope = get_user_scope_dict(existing_user, db)
        return UserResponse(
            id=existing_user.id,
            full_name=existing_user.full_name,
            email=existing_user.email,
            phone=existing_user.phone,
            role_name=role_name,
            city_id=existing_user.city_id,
            status=existing_user.status,
            created_at=existing_user.created_at,
            updated_at=existing_user.updated_at,
            scope=UserScope(**scope)
        )

    # For new users, default strictly to "citizen" role to prevent role escalation
    role = db.query(Role).filter(Role.role_name == "citizen").first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name="citizen")
        db.add(role)
        db.flush()

    new_user = User(
        id=user_uuid,
        full_name=profile_in.full_name,
        email=email,
        phone=profile_in.phone,
        role_id=role.id,
        city_id=None,  # Do not allow client to assign geographic scope on sync
        state_id=None,
        district_id=None,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    scope = get_user_scope_dict(new_user, db)
    return UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone,
        role_name=role.role_name,
        city_id=new_user.city_id,
        status=new_user.status,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
        scope=UserScope(**scope)
    )

# 1. POST /users/profile (for frontend store backward-compatibility)
@router.post("/users/profile", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_or_sync_profile(
    profile_in: ProfileCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    return sync_profile_internal(profile_in, supabase_user, db)

# 2. POST /auth/sync-profile
@router.post("/auth/sync-profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
def sync_profile(
    profile_in: ProfileCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    return sync_profile_internal(profile_in, supabase_user, db)

# 3. GET /auth/me
@router.get("/auth/me", response_model=UserResponse)
def get_auth_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role_name = current_user.role.role_name if current_user.role else "citizen"
    scope = get_user_scope_dict(current_user, db)
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role_name=role_name,
        city_id=current_user.city_id,
        status=current_user.status,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        scope=UserScope(**scope)
    )

# 4. GET /auth/profile (Alias for /auth/me)
@router.get("/auth/profile", response_model=UserResponse)
def get_auth_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_auth_me(current_user, db)

# 5. GET /auth/test (Protected internal test endpoint)
@router.get("/auth/test")
def get_auth_test(
    current_user: User = Depends(get_current_user)
):
    role_name = current_user.role.role_name if current_user.role else "citizen"
    return {
        "message": "Authentication successful.",
        "user_id": str(current_user.id),
        "email": current_user.email,
        "role": role_name
    }
