from backend.app.schemas.quiz import QuizQuestion
from backend.app.services.gemini_service import gemini_service

def test_semantic_equivalence_sjf():
    q = QuizQuestion(
        id="q_test_sjf",
        question_type="SHORT_ANSWER",
        topic_title="Shortest-Job-First (SJF) Optimality",
        question="Why is Shortest-Job-First (SJF) scheduling considered theoretically optimal?",
        correct_answer="It produces the minimum average waiting time.",
        explanation="SJF places shorter jobs first, which reduces cumulative and average delay.",
        source_reference="Page 9",
        difficulty="Advanced"
    )

    # Conceptual equivalent with different words ("minimizes average wait time")
    student_ans = "SJF minimizes average wait time for processes."
    result = gemini_service.evaluate_short_answer(q, student_ans)
    assert result.is_correct is True, f"Expected conceptually equivalent answer to be accepted. Got {result}"
    assert result.score >= 0.70
    assert result.status == "CORRECT"

def test_semantic_equivalence_round_robin():
    q = QuizQuestion(
        id="q_test_rr",
        question_type="SHORT_ANSWER",
        topic_title="Round Robin Scheduling",
        question="What core mechanism does Round Robin use to share the CPU fairly?",
        correct_answer="Round Robin uses a fixed time quantum.",
        explanation="Each process receives a circular slice up to quantum q before preemption.",
        source_reference="Page 11",
        difficulty="Intermediate"
    )

    # Student uses "fixed time slice" instead of "time quantum"
    student_ans = "Each process is allocated a fixed time slice."
    result = gemini_service.evaluate_short_answer(q, student_ans)
    assert result.is_correct is True
    assert result.score >= 0.70
    assert result.status == "CORRECT"

def test_genuinely_wrong_short_answer():
    q = QuizQuestion(
        id="q_test_wrong",
        question_type="SHORT_ANSWER",
        topic_title="Priority Scheduling",
        question="How does aging prevent starvation?",
        correct_answer="Aging gradually increases the priority of waiting processes.",
        explanation="Dynamic priority elevation guarantees execution within finite delay.",
        source_reference="Page 14",
        difficulty="Intermediate"
    )

    # Completely wrong answer
    student_ans = "It recompiles the binary with higher optimization flags."
    result = gemini_service.evaluate_short_answer(q, student_ans)
    assert result.is_correct is False
    assert result.score < 0.40
    assert result.status == "INCORRECT"
    assert len(result.missing_concepts) > 0
