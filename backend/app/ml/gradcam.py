import os
import cv2
import numpy as np
import torch
from backend.app.config import settings

def generate_gradcam_heatmap(
    model: torch.nn.Module | None,
    image_path: str,
    output_filename: str,
    modality: str,
    target_layer_name: str = "features"
) -> float:
    """
    Generates a Grad-CAM heatmap overlays on the target image.
    If no model weights are present, generates a simulated clinical fallback heatmap.
    
    Returns:
        float: Calculated or simulated confidence score (0.0 to 100.0)
    """
    output_path = os.path.join(settings.UPLOAD_DIR, output_filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Load original image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at path: {image_path}")
        
    h, w, c = img.shape

    # Generate a stable mock probability based on color ratio (repeatable output)
    # Center region check depending on modality
    if modality == "eye":
        center_x, center_y = int(w * 0.5), int(h * 0.65)
        radius = int(min(w, h) * 0.2)
    elif modality == "nail":
        center_x, center_y = int(w * 0.5), int(h * 0.5)
        radius = int(min(w, h) * 0.25)
    else: # tongue
        center_x, center_y = int(w * 0.5), int(h * 0.6)
        radius = int(min(w, h) * 0.3)

    crop = img[max(0, center_y-50):min(h, center_y+50), max(0, center_x-50):min(w, center_x+50)]
    mean_green = np.mean(crop[:, :, 1]) if crop.size > 0 else 127
    mean_red = np.mean(crop[:, :, 2]) if crop.size > 0 else 127
    ratio = mean_green / (mean_red + 1e-5)
    mock_score = round(float(min(98.0, max(5.0, (ratio - 0.7) * 200 + 40))), 2)

    # If PyTorch model is not present, generate mock heatmap overlay
    if model is None:
        heatmap = np.zeros((h, w), dtype=np.float32)
        cv2.circle(heatmap, (center_x, center_y), radius, 1.0, -1)
        heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=radius/2, sigmaY=radius/2)
        heatmap = np.uint8(255 * (heatmap / (np.max(heatmap) + 1e-8)))
        colored_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        blended = cv2.addWeighted(colored_heatmap, 0.4, img, 0.6, 0)
        cv2.imwrite(output_path, blended)
        return mock_score

    # Real PyTorch/Grad-CAM calculation
    try:
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.model_targets import ClassifierTarget
        from pytorch_grad_cam.utils.image import show_cam_on_image
        import torchvision.transforms as transforms
        from PIL import Image
        
        # Preprocess input tensor
        pil_img = Image.open(image_path).convert("RGB")
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        input_tensor = transform(pil_img).unsqueeze(0).to(next(model.parameters()).device)

        # Forward pass
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.softmax(outputs, dim=1)
            # Class 0 = Anemic, Class 1 = Non-Anemic (per training class_to_idx)
            anemia_prob = probs[0][0].item() * 100.0

        # target layer for EfficientNet-B0
        target_layers = [model.backbone.features[-1]]
        
        cam = GradCAM(model=model, target_layers=target_layers)
        rgb_img_float = np.float32(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)) / 255.0
        rgb_img_float = cv2.resize(rgb_img_float, (224, 224))
        
        # Target class 0 = Anemic (per training class_to_idx)
        grayscale_cam = cam(input_tensor=input_tensor, targets=[ClassifierTarget(0)])[0, :]
        cam_image = show_cam_on_image(rgb_img_float, grayscale_cam, use_rgb=True)
        cam_image_bgr = cv2.cvtColor((cam_image * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
        cam_image_bgr_resized = cv2.resize(cam_image_bgr, (w, h))
        
        cv2.imwrite(output_path, cam_image_bgr_resized)
        return round(anemia_prob, 2)
        
    except Exception as e:
        print(f"Failed to run real Grad-CAM: {e}. Falling back to mock generator.")
        # Re-generate mock heatmap
        heatmap = np.zeros((h, w), dtype=np.float32)
        cv2.circle(heatmap, (center_x, center_y), radius, 1.0, -1)
        heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=radius/2, sigmaY=radius/2)
        heatmap = np.uint8(255 * (heatmap / (np.max(heatmap) + 1e-8)))
        colored_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        blended = cv2.addWeighted(colored_heatmap, 0.4, img, 0.6, 0)
        cv2.imwrite(output_path, blended)
        return mock_score
