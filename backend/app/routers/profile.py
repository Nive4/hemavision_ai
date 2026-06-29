from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.health_profile import HealthProfileCreate, HealthProfileUpdate, HealthProfileResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.profile_service import get_profile_by_user_id, create_health_profile, update_health_profile

router = APIRouter(prefix="/profile", tags=["Health Profile"])

@router.post("", response_model=HealthProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_in: HealthProfileCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Create a health profile for the current logged-in user"""
    existing_profile = get_profile_by_user_id(db, current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user. Use PUT to update."
        )
    return create_health_profile(db, current_user.id, profile_in)

@router.get("", response_model=HealthProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Retrieve the current user's health profile"""
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found. Please create one."
        )
    return profile

@router.put("", response_model=HealthProfileResponse)
def update_profile(
    profile_in: HealthProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Update the current user's health profile"""
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found. Please create one first."
        )
    return update_health_profile(db, profile, profile_in)
