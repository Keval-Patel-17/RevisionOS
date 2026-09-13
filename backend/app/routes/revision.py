import os
from fastapi import APIRouter
from ..schemas.revision import RevisionGenerateRequest, RevisionPack
from ..schemas.document import PersonalizationPreferences
from ..services.document_service import document_service
from ..services.gemini_service import gemini_service
from ..utils.logger import logger

router = APIRouter()

@router.post("/generate-revision", response_model=RevisionPack)
async def generate_revision(req: RevisionGenerateRequest):
    file_path = document_service.get_file_path_by_id(req.file_id)
    filename = os.path.basename(file_path).split("_", 1)[1] if "_" in os.path.basename(file_path) else os.path.basename(file_path)
    
    metadata, chunks = document_service.extract_chunks_and_metadata(file_path, filename)
    
    prefs = PersonalizationPreferences(
        course_name=req.course_name,
        study_goal=req.study_goal,
        difficulty=req.difficulty,
        exam_style=req.exam_style,
        notes_length=req.notes_length
    )
    
    revision_pack = gemini_service.generate_revision_pack(chunks, filename, prefs)
    return revision_pack
