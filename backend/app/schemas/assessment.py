from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Dict

class AssessmentCreate(BaseModel):
    # Dict mapping symptoms to yes/no/sometimes
    # Example: {"fatigue": "yes", "dizziness": "no", "headache": "sometimes"}
    symptoms: Dict[str, str] = Field(
        ..., 
        description="Dictionary containing symptom names and user responses (yes/no/sometimes)"
    )

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    symptoms: Dict[str, str]
    risk_score: float
    risk_level: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
