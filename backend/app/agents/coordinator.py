from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.vision_agent import VisionAgent
from backend.app.agents.symptom_agent import SymptomAgent
from backend.app.agents.nutrition_agent import NutritionAgent
from backend.app.agents.explainability_agent import ExplainabilityAgent
from backend.app.agents.report_agent import ReportAgent
from backend.app.ml.fusion_model import FusionModel

class CoordinatorAgent(BaseAgent):
    def __init__(self):
        super().__init__("CoordinatorAgent", "Orchestrates multi-agent analysis pipelines for full patient diagnosis.")
        self.vision_agent = VisionAgent()
        self.symptom_agent = SymptomAgent()
        self.nutrition_agent = NutritionAgent()
        self.explainability_agent = ExplainabilityAgent()
        self.report_agent = ReportAgent()
        self.fusion_model = FusionModel()

    def execute(self, task_input: dict) -> dict:
        """
        Orchestrates full diagnostic flow.
        Input keys:
            - user_name (str)
            - age (int)
            - gender (str)
            - dietary_habit (str)
            - eye_image_path (str | None)
            - nail_image_path (str | None)
            - tongue_image_path (str | None)
            - symptoms (dict | None)
            - screening_id (int)
        """
        # 1. Run Symptom Analysis
        symptom_data = {}
        symptom_score = None
        symptom_risk = None
        if task_input.get("symptoms"):
            symptom_data = self.symptom_agent.execute({
                "symptoms": task_input["symptoms"]
            })
            symptom_score = symptom_data.get("score")
            symptom_risk = symptom_data.get("risk_level")

        # 2. Run Vision Analysis
        vision_data = self.vision_agent.execute({
            "eye_image_path": task_input.get("eye_image_path"),
            "nail_image_path": task_input.get("nail_image_path"),
            "tongue_image_path": task_input.get("tongue_image_path"),
            "screening_id": task_input.get("screening_id", 0)
        })

        eye_score = vision_data.get("eye", {}).get("score")
        nail_score = vision_data.get("nail", {}).get("score")
        tongue_score = vision_data.get("tongue", {}).get("score")

        # 3. Fuse Modalities
        fusion_result = self.fusion_model.fuse(
            eye_score=eye_score,
            nail_score=nail_score,
            tongue_score=tongue_score,
            symptom_score=symptom_score
        )

        # 4. Generate Explainability Insights
        explainability_data = self.explainability_agent.execute({
            "symptoms": task_input.get("symptoms"),
            "modalities": vision_data
        })

        # 5. Generate Nutrition Guide
        nutrition_data = self.nutrition_agent.execute({
            "risk_level": fusion_result["final_risk_level"],
            "dietary_habit": task_input.get("dietary_habit", "omnivore")
        })

        # 6. Compile Report
        report_data = self.report_agent.execute({
            "user_name": task_input.get("user_name", "Anonymous Patient"),
            "age": task_input.get("age", 30),
            "gender": task_input.get("gender", "Unspecified"),
            "screening_result": fusion_result,
            "symptom_result": symptom_data,
            "diet_plan": nutrition_data,
            "output_pdf_filename": f"report_{task_input.get('screening_id', 'latest')}.pdf"
        })

        # Aggregate and return full clinical diagnostics package
        return {
            "fusion_result": fusion_result,
            "modality_scores": {
                "eye": eye_score,
                "nail": nail_score,
                "tongue": tongue_score,
                "symptom": symptom_score
            },
            "explainability": explainability_data,
            "diet_plan": nutrition_data,
            "report": report_data
        }
