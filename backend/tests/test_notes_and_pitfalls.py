import pytest
import os
from backend.app.services.document_service import DocumentService
from backend.app.services.gemini_service import gemini_service
from backend.app.schemas.document import PersonalizationPreferences

def test_structured_pitfalls_and_procedures():
    demo_pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "demo_assets",
        "cpu_scheduling_lecture.pdf"
    )
    meta, chunks = DocumentService.extract_chunks_and_metadata(demo_pdf_path, "cpu_scheduling_lecture.pdf")

    prefs = PersonalizationPreferences(
        course_name="Operating Systems",
        study_goal="Exam Preparation",
        difficulty="Intermediate",
        exam_style="Mixed",
        notes_length="Balanced"
    )

    pack = gemini_service.generate_revision_pack(chunks, "cpu_scheduling_lecture.pdf", prefs)

    assert pack.topics_count >= 5
    
    # Check that topics have teacher-style explanations, numbered procedures, and 3-part structured pitfalls
    has_procedures = False
    has_comparisons = False
    has_structured_pitfalls = False

    for topic in pack.topics:
        # Check core explanation
        assert len(topic.core_explanation or topic.summary) > 30

        # Check procedures
        if topic.procedures:
            has_procedures = True
            for proc in topic.procedures:
                assert any(proc.startswith(str(i)) for i in range(1, 10)), f"Procedure should be numbered step: {proc}"

        # Check comparisons
        if topic.comparisons:
            has_comparisons = True
            for comp in topic.comparisons:
                assert comp.aspect
                assert comp.concept_a
                assert comp.concept_b

        # Check structured pitfalls
        if topic.structured_pitfalls:
            has_structured_pitfalls = True
            for pit in topic.structured_pitfalls:
                assert pit.misconception
                assert pit.correct_understanding
                assert pit.why_it_matters
                # Generic fallback check
                assert "verify distinction between" not in pit.misconception.lower()

    assert has_procedures, "Expected at least one topic to have algorithmic procedures"
    assert has_comparisons, "Expected at least one topic to have comparisons"
    assert has_structured_pitfalls, "Expected structured pitfalls across topics"
