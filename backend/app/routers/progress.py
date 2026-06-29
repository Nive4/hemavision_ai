from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.progress import Progress
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    screening_id: int | None
    week_number: int
    risk_score: float
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=list[ProgressResponse])
def get_progress_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve progress tracking history for the current user, ordered by week"""
    return db.query(Progress).filter(
        Progress.user_id == current_user.id
    ).order_by(Progress.week_number.asc()).all()
