from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Screening(Base):
    __tablename__ = "screenings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Image file paths (relative to upload root)
    eye_image_path = Column(String, nullable=True)
    nail_image_path = Column(String, nullable=True)
    tongue_image_path = Column(String, nullable=True)
    
    # Modality scores (0.0 to 100.0)
    eye_score = Column(Float, nullable=True)
    nail_score = Column(Float, nullable=True)
    tongue_score = Column(Float, nullable=True)
    symptom_score = Column(Float, nullable=True)
    
    # Combined prediction
    fusion_score = Column(Float, nullable=False)  # Final aggregated probability percentage
    final_risk_level = Column(String, nullable=False)  # "Normal", "Mild", "Moderate", "Severe"
    
    # JSON results
    # Explanation format: {"gradcam_eye": "/static/...", "gradcam_nail": "...", "shap_symptoms": [...]}
    explanation = Column(JSON, nullable=True)
    
    # Diet plan format: {"foods": ["spinach", "dates"], "suggestions": ["increase iron"]}
    diet_recommendations = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="screenings")
    progress_records = relationship("Progress", back_populates="screening", cascade="all, delete-orphan")
