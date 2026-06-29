from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Progress(Base):
    __tablename__ = "progress_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    screening_id = Column(Integer, ForeignKey("screenings.id", ondelete="SET NULL"), nullable=True)
    
    week_number = Column(Integer, nullable=False)
    risk_score = Column(Float, nullable=False)  # final_risk_score from screening (0.0 to 100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress_records")
    screening = relationship("Screening", back_populates="progress_records")
