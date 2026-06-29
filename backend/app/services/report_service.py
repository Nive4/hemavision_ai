import os
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.screening import Screening
from backend.app.models.health_profile import HealthProfile
from backend.app.models.assessment import Assessment
from backend.app.utils.pdf_generator import compile_pdf_report
from backend.app.config import settings

class ReportService:
    def __init__(self):
        pass

    def build_latest_report(self, db: Session, user_id: int) -> dict:
        """
        Gathers database entries for the latest screening and symptom assessment,
        structures the report payload, compiles the PDF, and returns the path details.
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
            
        profile = db.query(HealthProfile).filter(HealthProfile.user_id == user_id).first()
        screening = db.query(Screening).filter(Screening.user_id == user_id).order_by(Screening.created_at.desc()).first()
        assessment = db.query(Assessment).filter(Assessment.user_id == user_id).order_by(Assessment.created_at.desc()).first()
        
        # Safe fallback values if profile/screening/assessment is empty
        age = profile.age if profile else 30
        gender = profile.gender if profile else "Unspecified"
        dietary_habit = profile.dietary_habit if profile else "omnivore"
        
        # 1. Structure diagnostic payload
        fusion_score = screening.fusion_score if screening else 0.0
        final_risk_level = screening.final_risk_level if screening else "Normal"
        weights_used = {}
        if screening and screening.explanation:
            weights_used = screening.explanation.get("weights_used", {})

        symptom_score = assessment.risk_score if assessment else 0.0
        symptom_risk_level = assessment.risk_level if assessment else "Normal"
        
        # 2. Extract diet recommendations
        from backend.app.services.fusion_service import generate_diet_plan
        diet_plan = generate_diet_plan(final_risk_level, dietary_habit)
        
        # 3. Assemble full dataset
        report_data = {
            "patient_info": {
                "name": user.email,
                "age": age,
                "gender": gender
            },
            "diagnostics": {
                "final_risk_score": fusion_score,
                "final_risk_level": final_risk_level,
                "symptom_score": symptom_score,
                "symptom_risk_level": symptom_risk_level,
                "weights_used": weights_used
            },
            "dietary_recommendations": diet_plan
        }
        
        # 4. Write PDF
        output_filename = f"report_user_{user_id}_latest.pdf"
        output_path = os.path.join(settings.UPLOAD_DIR, output_filename)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        compile_pdf_report(report_data, output_path)
        
        return {
            "filename": output_filename,
            "pdf_url": f"/uploads/{output_filename}",
            "data": report_data
        }
