from abc import ABC, abstractmethod

class BaseAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    def execute(self, task_input: dict) -> dict:
        """
        Executes the agent's logic on the input dictionary.
        Returns:
            dict containing execution results.
        """
        pass
