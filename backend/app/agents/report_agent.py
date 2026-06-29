import os
from backend.app.agents.base_agent import BaseAgent
from backend.app.config import settings

class ReportAgent(BaseAgent):
    def __init__(self):
        super().__init__("ReportAgent", "Compiles comprehensive diagnostic and dietary reports for export.")

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - user_name (str)
            - age (int)
            - gender (str)
            - screening_result (dict)
            - symptom_result (dict)
            - diet_plan (dict)
            - output_pdf_filename (str)
        """
        user_name = task_input.get("user_name", "Anonymous Patient")
        age = task_input.get("age", 30)
        gender = task_input.get("gender", "Unspecified")
        screening = task_input.get("screening_result", {})
        symptoms = task_input.get("symptom_result", {})
        diet = task_input.get("diet_plan", {})
        
        output_pdf_filename = task_input.get("output_pdf_filename", f"report_latest.pdf")
        pdf_path = os.path.join(settings.UPLOAD_DIR, output_pdf_filename)
        
        # Structure the report payload
        report_data = {
            "patient_info": {
                "name": user_name,
                "age": age,
                "gender": gender
            },
            "diagnostics": {
                "final_risk_score": screening.get("fusion_score", 0.0),
                "final_risk_level": screening.get("final_risk_level", "Normal"),
                "symptom_score": symptoms.get("score", 0.0),
                "symptom_risk_level": symptoms.get("risk_level", "Normal"),
                "weights_used": screening.get("weights_used", {})
            },
            "dietary_recommendations": {
                "summary": diet.get("summary", ""),
                "frequency": diet.get("frequency", ""),
                "iron_sources": diet.get("iron_sources", []),
                "vitamin_c_sources": diet.get("vitamin_c_sources", []),
                "inhibitors_to_avoid": diet.get("inhibitors_to_avoid", [])
            },
            "pdf_path": pdf_path,
            "pdf_url": f"/uploads/{output_pdf_filename}"
        }
        
        # Return structured metadata
        return report_data
