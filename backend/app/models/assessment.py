from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Store answers to 14 symptoms as JSON
    # e.g., {"fatigue": "yes", "dizziness": "no", "headache": "sometimes"}
    symptoms = Column(JSON, nullable=False)
    
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    risk_level = Column(String, nullable=False)  # "Normal", "Mild", "Moderate", "Severe"
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
