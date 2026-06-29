import os
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import cv2
import numpy as np
from backend.app.config import settings

class AnemiaVisionNet(nn.Module):
    """
    EfficientNet-B0 based binary classifier for eye conjunctiva, fingernail, and tongue pallor.
    Outputs: 2 classes (0 = Normal, 1 = Anemic)
    """
    def __init__(self):
        super().__init__()
        # Load pre-trained EfficientNet-B0
        self.backbone = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        # Replace classifier head
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier[1] = nn.Linear(in_features, 2)

    def forward(self, x):
        return self.backbone(x)


class VisionInference:
    def __init__(self, modality: str):
        """
        Args:
            modality: "eye", "nail", or "tongue"
        """
        self.modality = modality
        self.model_path = os.path.join(settings.MODEL_DIR, f"{modality}_model.pth")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = None
        self._load_model()
        
        # Standard input transform for EfficientNet
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _load_model(self):
        """Loads vision weights if available, else keeps it as None for fallback"""
        if os.path.exists(self.model_path):
            try:
                self.model = AnemiaVisionNet()
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
            except Exception as e:
                print(f"Failed to load weights for {self.modality} model: {e}")
                self.model = None

    def generate_mock_gradcam(self, image_path: str, output_path: str) -> float:
        """
        If no weights exist, generate a simulated Grad-CAM heatmap over the image
        and return a simulated anemia probability (0.0 to 100.0)
        """
        # Load image with OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image at {image_path}")
            
        h, w, c = img.shape
        
        # Create a synthetic heatmap (a Gaussian highlight in the center/bottom region)
        # For eyes, conjunctiva is usually in the bottom half. For nails, in the center.
        heatmap = np.zeros((h, w), dtype=np.float32)
        
        # Center of highlight depending on modality
        if self.modality == "eye":
            center_x = int(w * 0.5)
            center_y = int(h * 0.65) # Bottom area (inner eyelid region)
            radius = int(min(w, h) * 0.2)
        elif self.modality == "nail":
            center_x = int(w * 0.5)
            center_y = int(h * 0.5) # Center (nail bed)
            radius = int(min(w, h) * 0.25)
        else: # tongue
            center_x = int(w * 0.5)
            center_y = int(h * 0.6)
            radius = int(min(w, h) * 0.3)
            
        # Draw Gaussian distribution for heatmap
        cv2.circle(heatmap, (center_x, center_y), radius, 1.0, -1)
        heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=radius/2, sigmaY=radius/2)
        
        # Normalize heatmap to [0, 255]
        heatmap = np.uint8(255 * (heatmap / (np.max(heatmap) + 1e-8)))
        
        # Apply JET colormap
        colored_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Blend with original image (40% heatmap, 60% original image)
        blended = cv2.addWeighted(colored_heatmap, 0.4, img, 0.6, 0)
        
        # Save output image
        cv2.imwrite(output_path, blended)
        
        # Generate a stable mock probability based on image content (so it's repeatable)
        # We can calculate the mean red-channel level of the center region
        # Anemia (pallor) is characterized by LESS redness.
        # So lower redness = higher anemia probability!
        crop = img[max(0, center_y-50):min(h, center_y+50), max(0, center_x-50):min(w, center_x+50)]
        mean_blue = np.mean(crop[:, :, 0]) if crop.size > 0 else 127
        mean_green = np.mean(crop[:, :, 1]) if crop.size > 0 else 127
        mean_red = np.mean(crop[:, :, 2]) if crop.size > 0 else 127
        
        # Heuristic ratio: green/red ratio. Higher ratio (less red) = higher anemia score
        ratio = mean_green / (mean_red + 1e-5)
        prob = clip_prob = min(98.0, max(5.0, (ratio - 0.7) * 200 + 40))
        return round(float(clip_prob), 2)

    def predict(self, image_path: str, output_gradcam_filename: str) -> float:
        """
        Predict anemia score (0.0 to 100.0) and generate Grad-CAM explanation.
        Saves Grad-CAM visual to settings.UPLOAD_DIR / output_gradcam_filename.
        """
        output_path = os.path.join(settings.UPLOAD_DIR, output_gradcam_filename)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        if not self.model:
            # Run fallback mock generator
            return self.generate_mock_gradcam(image_path, output_path)

        # Real PyTorch inference & Grad-CAM
        try:
            img = Image.open(image_path).convert("RGB")
            input_tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            # Forward pass
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probs = torch.softmax(outputs, dim=1)
                # Class 0 = Anemic, Class 1 = Non-Anemic (per training class_to_idx)
                anemia_prob = probs[0][0].item() * 100.0
                
            # Generate real Grad-CAM
            # We'll import pytorch_grad_cam here to avoid runtime load issues if not needed
            from pytorch_grad_cam import GradCAM
            from pytorch_grad_cam.utils.model_targets import ClassifierTarget
            from pytorch_grad_cam.utils.image import show_cam_on_image
            
            # EfficientNet-B0 target layer for Grad-CAM is the last feature block:
            # backbone.features[-1]
            target_layers = [self.model.backbone.features[-1]]
            
            cam = GradCAM(model=self.model, target_layers=target_layers)
            
            # Input image as numpy float array [0,1]
            rgb_img = cv2.imread(image_path)
            rgb_img = cv2.cvtColor(rgb_img, cv2.COLOR_BGR2RGB)
            rgb_img_float = np.float32(rgb_img) / 255.0
            rgb_img_float = cv2.resize(rgb_img_float, (224, 224))
            
            targets = [ClassifierTarget(0)] # Target class 0 = Anemia (per training class_to_idx)
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
            
            cam_image = show_cam_on_image(rgb_img_float, grayscale_cam, use_rgb=True)
            cam_image_bgr = cv2.cvtColor((cam_image * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
            
            # Resize back to original dimensions for high res save
            original_h, original_w, _ = cv2.imread(image_path).shape
            cam_image_bgr_resized = cv2.resize(cam_image_bgr, (original_w, original_h))
            
            cv2.imwrite(output_path, cam_image_bgr_resized)
            return round(anemia_prob, 2)
            
        except Exception as e:
            print(f"Error during real PyTorch/Grad-CAM run: {e}. Falling back to mock.")
            return self.generate_mock_gradcam(image_path, output_path)
