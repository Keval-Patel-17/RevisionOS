from fastapi import APIRouter
from ..config import settings
from ..services.gemini_service import gemini_service

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_live": gemini_service.is_live,
        "gemini_model": settings.GEMINI_MODEL
    }
