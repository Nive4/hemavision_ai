from backend.app.agents.base_agent import BaseAgent
from backend.app.services.fusion_service import generate_diet_plan

class NutritionAgent(BaseAgent):
    def __init__(self):
        super().__init__("NutritionAgent", "Generates personalized, absorption-optimized diet guidelines.")

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - risk_level (str)
            - dietary_habit (str)
        """
        risk_level = task_input.get("risk_level", "Normal")
        dietary_habit = task_input.get("dietary_habit", "omnivore")
        
        diet_plan = generate_diet_plan(risk_level, dietary_habit)
        return diet_plan
