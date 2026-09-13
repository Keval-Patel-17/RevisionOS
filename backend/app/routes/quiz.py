import os
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
from ..schemas.quiz import QuizQuestion, QuizSubmissionRequest, QuizEvaluationResult
from ..schemas.document import PersonalizationPreferences
from ..services.document_service import document_service
from ..services.gemini_service import gemini_service
from ..services.quiz_service import quiz_service

router = APIRouter()

class GenerateQuizRequest(BaseModel):
    file_id: str
    course_name: str = "Operating Systems"
    difficulty: str = "Intermediate"
    exam_style: str = "Mixed"

@router.post("/generate-quiz", response_model=List[QuizQuestion])
async def generate_quiz(req: GenerateQuizRequest):
    file_path = document_service.get_file_path_by_id(req.file_id)
    filename = os.path.basename(file_path).split("_", 1)[1] if "_" in os.path.basename(file_path) else os.path.basename(file_path)
    
    metadata, chunks = document_service.extract_chunks_and_metadata(file_path, filename)
    
    prefs = PersonalizationPreferences(
        course_name=req.course_name,
        difficulty=req.difficulty,
        exam_style=req.exam_style
    )
    
    # Get topics first to ground the quiz questions
    revision_pack = gemini_service.generate_revision_pack(chunks, filename, prefs)
    questions = gemini_service.generate_quiz(chunks, revision_pack.topics, prefs)
    return questions

@router.post("/quiz/evaluate", response_model=QuizEvaluationResult)
async def evaluate_quiz_submission(req: QuizSubmissionRequest):
    result = quiz_service.evaluate_quiz(req)
    return result
