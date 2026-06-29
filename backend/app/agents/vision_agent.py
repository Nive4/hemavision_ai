import os
from backend.app.agents.base_agent import BaseAgent
from backend.app.ml.eye_model import EyeModel
from backend.app.ml.nail_model import NailModel
from backend.app.ml.tongue_model import TongueModel

class VisionAgent(BaseAgent):
    def __init__(self):
        super().__init__("VisionAgent", "Analyzes conjunctiva, nails, and tongue clinical images for pallor indications.")
        self.eye_model = EyeModel()
        self.nail_model = NailModel()
        self.tongue_model = TongueModel()

    def execute(self, task_input: dict) -> dict:
        """
        Input keys:
            - eye_image_path (str | None)
            - nail_image_path (str | None)
            - tongue_image_path (str | None)
            - screening_id (int)
        """
        results = {}
        
        screening_id = task_input.get("screening_id", 0)
        
        # Analyze eye image
        eye_path = task_input.get("eye_image_path")
        if eye_path and os.path.exists(eye_path):
            cam_name = f"gradcam_eye_{screening_id}.png"
            score = self.eye_model.predict(eye_path, cam_name)
            results["eye"] = {"score": score, "gradcam": cam_name}
            
        # Analyze nail image
        nail_path = task_input.get("nail_image_path")
        if nail_path and os.path.exists(nail_path):
            cam_name = f"gradcam_nail_{screening_id}.png"
            score = self.nail_model.predict(nail_path, cam_name)
            results["nail"] = {"score": score, "gradcam": cam_name}
            
        # Analyze tongue image
        tongue_path = task_input.get("tongue_image_path")
        if tongue_path and os.path.exists(tongue_path):
            cam_name = f"gradcam_tongue_{screening_id}.png"
            score = self.tongue_model.predict(tongue_path, cam_name)
            results["tongue"] = {"score": score, "gradcam": cam_name}
            
        return results
