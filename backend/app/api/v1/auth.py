import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_supabase_user, get_current_user
from app.models.models import User, Role
from app.schemas.schemas import ProfileCreate, UserResponse

router = APIRouter(tags=["Authentication & Users"])

@router.post("/users/profile", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_or_sync_profile(
    profile_in: ProfileCreate,
    supabase_user: dict = Depends(get_supabase_user),
    db: Session = Depends(get_db)
):
    user_uuid = uuid.UUID(supabase_user["id"])
    email = supabase_user["email"]

    existing_user = db.query(User).filter(User.id == user_uuid).first()
    if existing_user:
        return UserResponse(
            id=existing_user.id,
            full_name=existing_user.full_name,
            email=existing_user.email,
            phone=existing_user.phone,
            role_name=existing_user.role.role_name if existing_user.role else "citizen",
            city_id=existing_user.city_id,
            status=existing_user.status,
            created_at=existing_user.created_at,
            updated_at=existing_user.updated_at
        )

    role = db.query(Role).filter(Role.role_name == profile_in.role_name).first()
    if not role:
        role = Role(id=uuid.uuid4(), role_name=profile_in.role_name)
        db.add(role)
        db.flush()

    new_user = User(
        id=user_uuid,
        full_name=profile_in.full_name,
        email=email,
        phone=profile_in.phone,
        role_id=role.id,
        city_id=profile_in.city_id,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone,
        role_name=role.role_name,
        city_id=new_user.city_id,
        status=new_user.status,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )

@router.get("/auth/me", response_model=UserResponse)
def get_auth_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role_name=current_user.role.role_name if current_user.role else "citizen",
        city_id=current_user.city_id,
        status=current_user.status,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
