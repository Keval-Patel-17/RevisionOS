from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

class DocumentChunk(BaseModel):
    chunk_id: str
    source_reference: str  # e.g., "Page 2", "Slide 5", "Section: Scheduling"
    text: str
    page_or_slide_num: Optional[int] = None
    title: Optional[str] = None

class DocumentMetadata(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: int
    char_count: int
    extracted_preview: str
    total_units: int = 0
    processed_units: int = 0
    coverage_percentage: int = 100

class PersonalizationPreferences(BaseModel):
    course_name: str = Field(default="Operating Systems", max_length=120, description="Subject/Course name")
    study_goal: str = Field(default="Exam Preparation", max_length=60, description="Quick Revision | Exam Preparation | Deep Understanding")
    difficulty: str = Field(default="Intermediate", max_length=40, description="Beginner | Intermediate | Advanced")
    exam_style: str = Field(default="Mixed", max_length=40, description="MCQ | Short Answer | Mixed")
    notes_length: str = Field(default="Balanced", max_length=40, description="Ultra Concise | Balanced | Detailed")

    @field_validator("course_name", "study_goal", "difficulty", "exam_style", "notes_length")
    @classmethod
    def clean_text_fields(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            return cleaned or "Default"
        return v
