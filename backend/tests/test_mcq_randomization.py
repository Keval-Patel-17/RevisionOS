import os
from backend.app.services.document_service import document_service
from backend.app.services.gemini_service import gemini_service
from backend.app.schemas.document import PersonalizationPreferences

def test_mcq_randomization_and_options_integrity():
    demo_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo_assets", "cpu_scheduling_lecture.pdf")
    _, chunks = document_service.extract_chunks_and_metadata(demo_pdf, "cpu_scheduling_lecture.pdf")
    prefs = PersonalizationPreferences(course_name="Operating Systems", exam_style="MCQ")
    pack = gemini_service.generate_revision_pack(chunks, "cpu_scheduling_lecture.pdf", prefs)

    # Collect indices over multiple generations
    seen_indices = set()
    total_mcqs = 0

    for _ in range(15):
        quiz = gemini_service.generate_quiz(chunks, pack.topics, prefs)
        for q in quiz:
            if q.question_type == "MCQ":
                total_mcqs += 1
                # 1. Must have 4 options
                assert q.options is not None, "MCQ options must not be None"
                assert len(q.options) == 4, f"MCQ must have exactly 4 options. Got {len(q.options)}"
                
                # 2. Options must be distinct (no duplicates)
                unique_opts = set(opt.strip().lower() for opt in q.options)
                assert len(unique_opts) == 4, f"Duplicate options detected: {q.options}"
                
                # 3. Correct answer must be in options
                assert q.correct_answer.strip() in q.options, f"Correct answer '{q.correct_answer}' not found in options {q.options}"
                
                # 4. Correct option index must match the position of correct_answer
                assert q.correct_option_index is not None
                assert 0 <= q.correct_option_index <= 3
                assert q.options[q.correct_option_index] == q.correct_answer.strip()
                
                seen_indices.add(q.correct_option_index)

    # 5. Confirm that correct answers are distributed across multiple indices and NOT always index 0 (Option A)!
    assert len(seen_indices) >= 3, f"Expected correct option indices to be distributed across positions A/B/C/D. Got {seen_indices} over {total_mcqs} questions."
    assert 0 in seen_indices or 1 in seen_indices or 2 in seen_indices or 3 in seen_indices
    # Prove that not all are 0
    assert seen_indices != {0}, "CRITICAL FAILURE: Correct answer was deterministically Option A (index 0)!"
