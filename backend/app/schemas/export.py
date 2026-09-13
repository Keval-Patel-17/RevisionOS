from pydantic import BaseModel
from typing import List, Optional
from .revision import RevisionPack
from .quiz import QuizQuestion, QuizEvaluationResult

class ExportRequest(BaseModel):
    format: str  # "pdf", "docx", "markdown"
    revision_pack: RevisionPack
    quiz_questions: Optional[List[QuizQuestion]] = None
    quiz_evaluation: Optional[QuizEvaluationResult] = None
