from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class HealthProfileBase(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(male|female|other)$")
    height: float = Field(..., gt=0)  # in cm
    weight: float = Field(..., gt=0)  # in kg
    dietary_habit: str = Field(..., pattern="^(veg|non-veg|vegan|flexitarian)$")
    medical_conditions: str = ""
    lifestyle: str = Field(..., pattern="^(active|sedentary|moderate)$")

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfileUpdate(BaseModel):
    age: int | None = Field(None, ge=0, le=120)
    gender: str | None = Field(None, pattern="^(male|female|other)$")
    height: float | None = Field(None, gt=0)
    weight: float | None = Field(None, gt=0)
    dietary_habit: str | None = Field(None, pattern="^(veg|non-veg|vegan|flexitarian)$")
    medical_conditions: str | None = None
    lifestyle: str | None = Field(None, pattern="^(active|sedentary|moderate)$")

class HealthProfileResponse(HealthProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    # Computed BMI
    @property
    def bmi(self) -> float:
        height_in_meters = self.height / 100.0
        return round(self.weight / (height_in_meters ** 2), 2)
        
    model_config = ConfigDict(
        from_attributes=True,
        # Allow reading property during serialization
        extra="allow"
    )
