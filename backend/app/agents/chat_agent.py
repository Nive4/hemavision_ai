from backend.app.agents.base_agent import BaseAgent
from backend.app.services.chat_service import ChatService

class ChatAgent(BaseAgent):
    def __init__(self):
        super().__init__("ChatAgent", "Assists users with personalized, evidence-based health responses.")
        self.chat_service = ChatService()

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - prompt (str)
            - risk_level (str)
            - dietary_habit (str)
        """
        prompt = task_input.get("prompt", "")
        risk_level = task_input.get("risk_level", "Normal")
        dietary_habit = task_input.get("dietary_habit", "omnivore")
        
        response = self.chat_service.answer_question(prompt, risk_level, dietary_habit)
        return {
            "answer": response["answer"],
            "source": response["source"],
            "context_injected": response["context_injected"]
        }
