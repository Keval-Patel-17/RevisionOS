import pytest
from backend.app.schemas.document import DocumentChunk, PersonalizationPreferences
from backend.app.services.gemini_service import gemini_service

def test_logical_naming_and_metadata_exclusion():
    # Simulate a messy slide deck where headers include professor name, slide numbers, and department
    chunks = [
        DocumentChunk(
            chunk_id="c1",
            source_reference="Slide 1",
            page_or_slide_num=1,
            title="1",
            text="1\nProf. Soumya K Ghosh\nDepartment of Computer Science and Engineering\nIIT Kharagpur\nMobile Cloud Computing - I\nIntroduction to mobile cloud architectures and offloading."
        ),
        DocumentChunk(
            chunk_id="c2",
            source_reference="Slide 2",
            page_or_slide_num=2,
            title="Prof. Soumya K Ghosh",
            text="Slide 2\nProf. Soumya K Ghosh\nComputation Offloading\nOffloading is the transfer of resource-intensive computation to cloud servers to save mobile energy."
        ),
        DocumentChunk(
            chunk_id="c3",
            source_reference="Slide 3",
            page_or_slide_num=3,
            title="19",
            text="19\nCloud Offloading in Mobile Computing\nEvaluating network latency and communication overhead when transferring tasks from mobile to cloud."
        )
    ]

    prefs = PersonalizationPreferences(
        course_name="Mobile Cloud Computing",
        study_goal="Exam Preparation",
        difficulty="Intermediate",
        exam_style="Mixed",
        notes_length="Balanced"
    )

    pack = gemini_service.generate_revision_pack(chunks, "lecture_slides.pdf", prefs)

    # 1. Assert NO topic title is a number or professor name
    for topic in pack.topics:
        assert topic.topic_title not in ["1", "19", "Slide 1", "Slide 2", "Prof. Soumya K Ghosh", "Department of Computer Science and Engineering"]
        assert not topic.topic_title.isdigit()
        assert len(topic.topic_title) >= 3

        # 2. Assert NO key concept contains metadata
        for concept in topic.key_concepts:
            assert "prof." not in concept.lower()
            assert "soumya" not in concept.lower()
            assert "department" not in concept.lower()
            assert concept not in ["1", "19", "Slide 1", "Slide 2"]

        # 3. Assert pitfalls are meaningful, not generic templates
        for pit in topic.structured_pitfalls:
            assert "verify distinction between 1" not in pit.misconception.lower()
            assert len(pit.correct_understanding) > 10
            assert len(pit.why_it_matters) > 10
