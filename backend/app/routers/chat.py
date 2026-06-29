from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.screening import Screening
from backend.app.models.health_profile import HealthProfile
from backend.app.services.auth_service import get_current_user
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["AI Health Assistant"])

# Instantiate ChatService as a singleton module-level instance
chat_service = ChatService()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
def post_chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to the AI health assistant and get a personalized response.
    Includes user's screening status and dietary profile for context.
    """
    # 1. Fetch user's latest screening risk level
    latest_screening = db.query(Screening).filter(
        Screening.user_id == current_user.id
    ).order_by(Screening.created_at.desc()).first()
    
    user_risk_level = latest_screening.final_risk_level if latest_screening else None

    # 2. Fetch user's dietary habit
    profile = db.query(HealthProfile).filter(
        HealthProfile.user_id == current_user.id
    ).first()
    
    user_dietary_habit = profile.dietary_habit if profile else None

    # 3. Generate response
    ai_response = chat_service.generate_response(
        query=request.message,
        user_risk_level=user_risk_level,
        user_dietary_habit=user_dietary_habit
    )
    
    return {"response": ai_response}
