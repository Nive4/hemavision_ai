import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_current_user
from backend.app.services.report_service import ReportService
from backend.app.config import settings

router = APIRouter(prefix="/api/report", tags=["Report"])
report_service = ReportService()

@router.get("/latest")
def get_latest_report_metadata(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Assembles diagnostics and generates the latest PDF report, returning URL and metadata.
    """
    try:
        result = report_service.build_latest_report(db, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download")
def download_latest_pdf_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates and returns the actual binary PDF file for direct browser download.
    """
    try:
        result = report_service.build_latest_report(db, current_user.id)
        file_path = os.path.join(settings.UPLOAD_DIR, result["filename"])
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Compiled PDF report file not found.")
            
        return FileResponse(
            path=file_path,
            filename=result["filename"],
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
