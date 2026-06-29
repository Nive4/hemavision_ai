from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)  # "male", "female", "other"
    height = Column(Float, nullable=False)  # in cm
    weight = Column(Float, nullable=False)  # in kg
    
    dietary_habit = Column(String, nullable=False)  # "veg", "non-veg", "vegan", "flexitarian"
    medical_conditions = Column(String, default="")  # comma-separated values (e.g., "hypertension,diabetes")
    lifestyle = Column(String, default="")  # e.g., "active", "sedentary", "moderate"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
