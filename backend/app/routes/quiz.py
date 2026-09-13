import os
from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from ..schemas.quiz import QuizQuestion, QuizSubmissionRequest, QuizEvaluationResult
from ..schemas.document import PersonalizationPreferences
from ..services.document_service import document_service
from ..services.gemini_service import gemini_service
from ..services.quiz_service import quiz_service
from ..utils.rate_limiter import rate_limit

router = APIRouter()

class GenerateQuizRequest(BaseModel):
    file_id: str = Field(min_length=8, max_length=64)
    course_name: str = Field(default="Operating Systems", max_length=120)
    difficulty: str = Field(default="Intermediate", max_length=40)
    exam_style: str = Field(default="Mixed", max_length=40)

    @field_validator("file_id", "course_name", "difficulty", "exam_style")
    @classmethod
    def trim_text(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

@router.post(
    "/generate-quiz",
    response_model=List[QuizQuestion],
    dependencies=[Depends(rate_limit(max_requests=25, window_seconds=60, route_tag="generate_quiz"))]
)
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

@router.post(
    "/quiz/evaluate",
    response_model=QuizEvaluationResult,
    dependencies=[Depends(rate_limit(max_requests=35, window_seconds=60, route_tag="evaluate_quiz"))]
)
async def evaluate_quiz_submission(req: QuizSubmissionRequest):
    result = quiz_service.evaluate_quiz(req)
    return result
