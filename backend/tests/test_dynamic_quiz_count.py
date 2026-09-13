import pytest
import os
from backend.app.services.document_service import DocumentService
from backend.app.services.gemini_service import gemini_service
from backend.app.schemas.document import DocumentChunk, PersonalizationPreferences

def test_dynamic_quiz_count_scaling():
    prefs = PersonalizationPreferences(
        course_name="Operating Systems",
        study_goal="Exam Preparation",
        difficulty="Intermediate",
        exam_style="Mixed",
        notes_length="Balanced"
    )

    # 1. Minimal 1-page document -> Exactly 5 questions (minimum constraint)
    short_chunks = [
        DocumentChunk(
            chunk_id="c1",
            source_reference="Page 1",
            page_or_slide_num=1,
            title="Introduction to Schedulers",
            text="Operating systems use schedulers to allocate CPU time to active processes."
        )
    ]
    short_pack = gemini_service.generate_revision_pack(short_chunks, "short.txt", prefs)
    short_quiz = gemini_service.generate_quiz(short_chunks, short_pack.topics, prefs)
    
    assert len(short_quiz) == 5, f"Expected 5 questions for minimal doc, got {len(short_quiz)}"

    # 2. Comprehensive 16-page lecture -> Dynamic count between 10 and 20
    demo_pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "demo_assets",
        "cpu_scheduling_lecture.pdf"
    )
    meta, full_chunks = DocumentService.extract_chunks_and_metadata(demo_pdf_path, "cpu_scheduling_lecture.pdf")
    full_pack = gemini_service.generate_revision_pack(full_chunks, "cpu_scheduling_lecture.pdf", prefs)
    full_quiz = gemini_service.generate_quiz(full_chunks, full_pack.topics, prefs)

    assert 10 <= len(full_quiz) <= 20, f"Expected between 10 and 20 questions for 16-page lecture, got {len(full_quiz)}"

    # 3. Verify topic distribution (multiple topics represented)
    topics_covered = {q.topic_title for q in full_quiz}
    assert len(topics_covered) >= 4, f"Expected at least 4 distinct topics tested in quiz, got {len(topics_covered)}"

    # 4. Verify MCQ option randomization and distinctness
    for q in full_quiz:
        if q.question_type == "MCQ":
            assert len(q.options) == 4
            assert len(set(q.options)) == 4, "Options must be pairwise distinct"
            assert 0 <= q.correct_option_index <= 3
            assert q.options[q.correct_option_index] == q.correct_answer
