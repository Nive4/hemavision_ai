import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.screening import Screening
from backend.app.models.assessment import Assessment
from backend.app.models.progress import Progress
from backend.app.models.health_profile import HealthProfile
from backend.app.schemas.screening import ScreeningResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.fusion_service import fuse_results, generate_diet_plan
from backend.app.ml.vision_model import VisionInference
from backend.app.config import settings
import cv2
import numpy as np

router = APIRouter(prefix="/screening", tags=["Multimodal Screening"])

def save_upload_file(upload_file: UploadFile, modality: str) -> str:
    """Helper to save uploaded file and return the saved path"""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(upload_file.filename)[1] or ".jpg"
    filename = f"{modality}_{uuid.uuid4().hex}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path

def check_image_clarity(file_path: str):
    """
    Check image for blurriness and lighting using OpenCV.
    Raises HTTPException if the picture is not clear.
    """
    image = cv2.imread(file_path)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read the uploaded image. Please try again."
        )
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Check for blur using Variance of Laplacian
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 5.0:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Picture is not clear (too blurry). Please upload clearly. (Blur score: {blur_score:.1f})"
        )
    
    # Check for brightness (too dark or overexposed)
    mean_brightness = np.mean(gray)
    if mean_brightness < 10:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Picture is not clear (too dark). Please upload clearly with better lighting."
        )
    if mean_brightness > 250:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Picture is not clear (too bright/overexposed). Please upload clearly."
        )

@router.post("", response_model=ScreeningResponse, status_code=status.HTTP_201_CREATED)
async def create_screening(
    eye_image: UploadFile = File(None),
    nail_image: UploadFile = File(None),
    tongue_image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload clinical images of Eye, Nail, and/or Tongue.
    Perform ML vision screening, retrieve latest symptom assessment,
    fuse modalities, generate nutrition plan, and save screening + progress logs.
    """
    # Verify at least one modality image is uploaded
    if not (eye_image or nail_image or tongue_image):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image (eye, nail, or tongue) must be uploaded."
        )

    eye_path_web = None
    nail_path_web = None
    tongue_path_web = None
    
    local_eye_path = None
    local_nail_path = None
    local_tongue_path = None

    # Save uploads locally and check clarity
    if eye_image:
        local_eye_path = save_upload_file(eye_image, "eye")
        check_image_clarity(local_eye_path)
        eye_path_web = f"/uploads/{os.path.basename(local_eye_path)}"

    if nail_image:
        local_nail_path = save_upload_file(nail_image, "nail")
        check_image_clarity(local_nail_path)
        nail_path_web = f"/uploads/{os.path.basename(local_nail_path)}"

    if tongue_image:
        local_tongue_path = save_upload_file(tongue_image, "tongue")
        check_image_clarity(local_tongue_path)
        tongue_path_web = f"/uploads/{os.path.basename(local_tongue_path)}"

    # Retrieve health profile for meta info
    health_profile = db.query(HealthProfile).filter(
        HealthProfile.user_id == current_user.id
    ).first()
    dietary_habit = health_profile.dietary_habit if health_profile else "veg"
    age = health_profile.age if health_profile else 30
    gender = health_profile.gender if health_profile else "Unspecified"

    # Retrieve latest Symptom Assessment risk score
    latest_assessment = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.created_at.desc()).first()
    
    symptoms_dict = None
    if latest_assessment:
        import json
        try:
            symptoms_dict = json.loads(latest_assessment.symptoms) if isinstance(latest_assessment.symptoms, str) else latest_assessment.symptoms
        except:
            symptoms_dict = {}

    # Gather next screening ID for Grad-CAM naming
    next_id = db.query(Screening).count() + 1

    # RUN AGENTIC PIPELINE COORDINATOR
    from backend.app.agents.coordinator import CoordinatorAgent
    coordinator = CoordinatorAgent()
    
    analysis = coordinator.execute({
        "user_name": current_user.email,
        "age": age,
        "gender": gender,
        "dietary_habit": dietary_habit,
        "eye_image_path": local_eye_path,
        "nail_image_path": local_nail_path,
        "tongue_image_path": local_tongue_path,
        "symptoms": symptoms_dict,
        "screening_id": next_id
    })

    fusion_res = analysis["fusion_result"]
    mod_scores = analysis["modality_scores"]
    exp_res = analysis["explainability"]

    # Map Grad-CAM paths to web URLs
    gradcam_eye_web = exp_res["gradcam_insights"].get("eye", {}).get("gradcam_url")
    gradcam_nail_web = exp_res["gradcam_insights"].get("nail", {}).get("gradcam_url")
    gradcam_tongue_web = exp_res["gradcam_insights"].get("tongue", {}).get("gradcam_url")

    explanation = {
        "gradcam_eye": gradcam_eye_web,
        "gradcam_nail": gradcam_nail_web,
        "gradcam_tongue": gradcam_tongue_web,
        "weights_used": fusion_res["weights_used"],
        "shap": exp_res["shap"]
    }

    # Save to database
    db_screening = Screening(
        user_id=current_user.id,
        eye_image_path=eye_path_web,
        nail_image_path=nail_path_web,
        tongue_image_path=tongue_path_web,
        eye_score=mod_scores.get("eye"),
        nail_score=mod_scores.get("nail"),
        tongue_score=mod_scores.get("tongue"),
        symptom_score=mod_scores.get("symptom"),
        fusion_score=fusion_res["fusion_score"],
        final_risk_level=fusion_res["final_risk_level"],
        explanation=explanation,
        diet_recommendations=analysis["diet_plan"]
    )
    
    db.add(db_screening)
    db.commit()
    db.refresh(db_screening)

    # Log Progress Record for line chart visualization
    progress_count = db.query(Progress).filter(Progress.user_id == current_user.id).count()
    db_progress = Progress(
        user_id=current_user.id,
        screening_id=db_screening.id,
        week_number=progress_count + 1,
        risk_score=fusion_res["fusion_score"]
    )
    db.add(db_progress)
    db.commit()

    return db_screening

@router.get("", response_model=list[ScreeningResponse])
def get_screenings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all screening records for the current user"""
    return db.query(Screening).filter(
        Screening.user_id == current_user.id
    ).order_by(Screening.created_at.desc()).all()

@router.get("/latest", response_model=ScreeningResponse)
def get_latest_screening(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the latest screening record for the current user"""
    screening = db.query(Screening).filter(
        Screening.user_id == current_user.id
    ).order_by(Screening.created_at.desc()).first()
    
    if not screening:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No screening records found. Please start a screening."
        )
    return screening

@router.get("/{id}", response_model=ScreeningResponse)
def get_screening_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of a specific screening by ID"""
    screening = db.query(Screening).filter(
        Screening.id == id,
        Screening.user_id == current_user.id
    ).first()
    
    if not screening:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screening record not found."
        )
    return screening