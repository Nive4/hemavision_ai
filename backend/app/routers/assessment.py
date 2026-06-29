from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.assessment import Assessment
from backend.app.schemas.assessment import AssessmentCreate, AssessmentResponse
from backend.app.services.auth_service import get_current_user
from backend.app.ml.symptom_model import SymptomModel

router = APIRouter(prefix="/assessment", tags=["Symptom Assessment"])

# Instantiate symptom model as a module-level singleton
symptom_model = SymptomModel()

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def submit_assessment(
    assessment_in: AssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit symptom questionnaire answers, compute risk score and level,
    and save the assessment record.
    """
    # 1. Run inference using XGBoost / Heuristic model
    prediction = symptom_model.predict(assessment_in.symptoms)
    
    # 2. Save assessment to database
    db_assessment = Assessment(
        user_id=current_user.id,
        symptoms=assessment_in.symptoms,
        risk_score=prediction["risk_score"],
        risk_level=prediction["risk_level"]
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    return db_assessment
