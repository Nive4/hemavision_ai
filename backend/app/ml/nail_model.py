import os
import torch
from backend.app.config import settings
from backend.app.ml.vision_model import AnemiaVisionNet
from backend.app.ml.gradcam import generate_gradcam_heatmap

class NailModel:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = os.path.join(settings.MODEL_DIR, "nail_model.pth")
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = AnemiaVisionNet()
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
            except Exception as e:
                print(f"Error loading nail model weights: {e}")
                self.model = None

    def predict(self, image_path: str, output_gradcam_filename: str) -> float:
        """Runs prediction and returns confidence score (0.0 to 100.0)"""
        return generate_gradcam_heatmap(
            model=self.model,
            image_path=image_path,
            output_filename=output_gradcam_filename,
            modality="nail"
        )
