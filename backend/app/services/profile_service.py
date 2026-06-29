from sqlalchemy.orm import Session
from backend.app.models.health_profile import HealthProfile
from backend.app.schemas.health_profile import HealthProfileCreate, HealthProfileUpdate

def get_profile_by_user_id(db: Session, user_id: int) -> HealthProfile | None:
    """Retrieve health profile by user ID"""
    return db.query(HealthProfile).filter(HealthProfile.user_id == user_id).first()

def create_health_profile(db: Session, user_id: int, profile_in: HealthProfileCreate) -> HealthProfile:
    """Create a new health profile for a user"""
    db_profile = HealthProfile(
        user_id=user_id,
        **profile_in.model_dump()
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_health_profile(db: Session, db_profile: HealthProfile, profile_in: HealthProfileUpdate) -> HealthProfile:
    """Update an existing health profile"""
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
