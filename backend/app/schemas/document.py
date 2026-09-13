from pydantic import BaseModel, Field
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
    course_name: str = Field(default="Operating Systems", description="Subject/Course name")
    study_goal: str = Field(default="Exam Preparation", description="Quick Revision | Exam Preparation | Deep Understanding")
    difficulty: str = Field(default="Intermediate", description="Beginner | Intermediate | Advanced")
    exam_style: str = Field(default="Mixed", description="MCQ | Short Answer | Mixed")
    notes_length: str = Field(default="Balanced", description="Ultra Concise | Balanced | Detailed")
