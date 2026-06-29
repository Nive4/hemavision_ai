import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms

# Standard ImageNet statistics for normalization
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def load_and_preprocess_image(image_path: str, size: tuple = (224, 224)) -> tuple:
    """
    Loads an image from a path, resizes it, converts to a PyTorch tensor,
    and normalizes it using standard ImageNet mean and standard deviation.
    
    Returns:
        tuple: (torch.Tensor processed image, np.ndarray original RGB image)
    """
    # Load original image for visualization/rendering
    orig_img = cv2.imread(image_path)
    if orig_img is None:
        raise ValueError(f"Could not load image at path: {image_path}")
    
    orig_rgb = cv2.cvtColor(orig_img, cv2.COLOR_BGR2RGB)
    
    # PIL processing for PyTorch transforms
    pil_img = Image.open(image_path).convert("RGB")
    
    transform = transforms.Compose([
        transforms.Resize(size),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])
    
    tensor_img = transform(pil_img).unsqueeze(0) # Add batch dimension
    
    return tensor_img, orig_rgb
