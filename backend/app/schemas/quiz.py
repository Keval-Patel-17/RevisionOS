from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class QuizQuestion(BaseModel):
    id: str = Field(max_length=64)
    question_type: str = Field(description="MCQ or SHORT_ANSWER")
    topic_title: str = Field(max_length=200)
    question: str
    options: Optional[List[str]] = Field(default=None, description="Array of 4 randomized options if MCQ, None if short answer")
    correct_option_index: Optional[int] = Field(default=None, description="0, 1, 2, or 3 for MCQ; None for SHORT_ANSWER")
    correct_answer: str
    explanation: str
    source_reference: str
    difficulty: str = "Intermediate"

class QuizSubmissionItem(BaseModel):
    question_id: str = Field(max_length=64)
    user_answer: str = Field(max_length=2000)
    selected_option_index: Optional[int] = None

    @field_validator("user_answer")
    @classmethod
    def clean_answer(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

class QuizSubmissionRequest(BaseModel):
    submissions: List[QuizSubmissionItem]
    quiz_questions: List[QuizQuestion]

class EvaluatedQuestion(BaseModel):
    question_id: str
    question: str
    topic_title: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    status: str = Field(default="CORRECT", description="CORRECT | PARTIAL | INCORRECT")
    score_earned: float = Field(default=1.0, description="0.0 to 1.0 credit")
    feedback: str = ""
    missing_concepts: List[str] = Field(default_factory=list)
    explanation: str
    source_reference: str

class WeakTopic(BaseModel):
    topic_title: str
    reason: str
    recommended_revision_points: List[str]
    source_reference: str

class QuizEvaluationResult(BaseModel):
    score: float
    total_questions: int
    percentage: int
    evaluated_questions: List[EvaluatedQuestion]
    weak_topics: List[WeakTopic]
    revise_this_next_summary: str
    updated_readiness_estimate: int
