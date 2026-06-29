from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List

class ScreeningResponse(BaseModel):
    id: int
    user_id: int
    
    eye_image_path: str | None = None
    nail_image_path: str | None = None
    tongue_image_path: str | None = None
    
    eye_score: float | None = None
    nail_score: float | None = None
    tongue_score: float | None = None
    symptom_score: float | None = None
    
    fusion_score: float
    final_risk_level: str
    
    explanation: Dict[str, Any] | None = None
    diet_recommendations: Dict[str, Any] | None = None
    
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
