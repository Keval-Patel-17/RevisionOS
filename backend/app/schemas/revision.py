from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class StructuredPitfall(BaseModel):
    misconception: str = Field(description="The flawed student belief or common confusion")
    correct_understanding: str = Field(description="The grounded academic truth from the source")
    why_it_matters: str = Field(description="Why this distinction is critical for exams and understanding")

class ComparisonItem(BaseModel):
    aspect: str = Field(description="Dimension of comparison (e.g. Overhead, Preemption, Starvation)")
    concept_a: str = Field(description="Property under Concept A")
    concept_b: str = Field(description="Property under Concept B")
    details: Optional[str] = Field(default="", description="Additional contextual explanation")

class TopicNote(BaseModel):
    id: str
    topic_title: str
    priority: str = Field(description="HIGH | MEDIUM | LOW based on source evidence")
    priority_reason: str = Field(description="Evidence from source justifying priority")
    importance_score: float = Field(default=0.5, description="Evidence score: 0.0 to 1.0")
    evidence_signals: List[str] = Field(default_factory=list, description="List of detected signals (formulas, definitions, repetition, etc.)")
    summary: str = Field(description="2-4 line concise overview")
    core_explanation: Optional[str] = Field(default="", description="Teacher-style clear explanation grounded in the source")
    key_concepts: List[str] = Field(default_factory=list)
    definitions: List[str] = Field(default_factory=list)
    procedures: List[str] = Field(default_factory=list, description="Numbered step-by-step algorithms or procedures")
    formulas_or_rules: List[str] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)
    comparisons: List[ComparisonItem] = Field(default_factory=list)
    advantages: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    applications: List[str] = Field(default_factory=list)
    common_mistakes: List[str] = Field(default_factory=list, description="Plain text summaries of mistakes for backward compatibility")
    structured_pitfalls: List[StructuredPitfall] = Field(default_factory=list, description="Evidence-based 3-part pitfalls")
    exam_focus_points: List[str] = Field(default_factory=list)
    source_reference: str = Field(description="Primary citation (e.g. 'Pages 2-4' or 'Slide 7')")
    source_references: List[str] = Field(default_factory=list, description="All contributing slide/page references")
    reviewed: bool = False

class RevisionPack(BaseModel):
    course_name: str
    source_document_name: str
    study_time_estimate: str
    revision_readiness_estimate: int = Field(default=0, description="Readiness percentage")
    high_priority_count: int = 0
    topics_count: int = 0
    total_units: int = 0
    processed_units: int = 0
    coverage_percentage: int = 100
    topics: List[TopicNote] = Field(default_factory=list)
    grounding_statement: str = "All generated notes and questions are strictly grounded in your uploaded material."

class RevisionGenerateRequest(BaseModel):
    file_id: str
    course_name: str = "Operating Systems"
    study_goal: str = "Exam Preparation"
    difficulty: str = "Intermediate"
    exam_style: str = "Mixed"
    notes_length: str = "Balanced"
