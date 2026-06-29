from backend.app.agents.base_agent import BaseAgent
from backend.app.ml.symptom_model import SymptomModel

class SymptomAgent(BaseAgent):
    def __init__(self):
        super().__init__("SymptomAgent", "Evaluates patient symptom checklists for clinical risk scores.")
        self.model = SymptomModel()

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - symptoms (dict)
        """
        symptoms = task_input.get("symptoms", {})
        if not symptoms:
            return {"risk_score": 0.0, "risk_level": "Normal", "probabilities": [1.0, 0.0, 0.0, 0.0]}
            
        prediction = self.model.predict(symptoms)
        return {
            "score": prediction["risk_score"],
            "risk_level": prediction["risk_level"],
            "probabilities": prediction["probabilities"]
        }
