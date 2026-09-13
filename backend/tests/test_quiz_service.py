from backend.app.schemas.quiz import (
    QuizQuestion,
    QuizSubmissionRequest,
    QuizSubmissionItem
)
from backend.app.services.quiz_service import quiz_service

def test_quiz_evaluation_perfect_score():
    questions = [
        QuizQuestion(
            id="q1",
            question_type="MCQ",
            topic_title="CPU Scheduling",
            question="What is TAT?",
            options=["Turnaround Time", "Total Access Time", "Thread Active Time", "Task Allotment Time"],
            correct_answer="Turnaround Time",
            explanation="TAT stands for Turnaround Time.",
            source_reference="Page 1",
            difficulty="Beginner"
        ),
        QuizQuestion(
            id="q2",
            question_type="SHORT_ANSWER",
            topic_title="Algorithms",
            question="What does SJF stand for?",
            options=None,
            correct_answer="Shortest Job First",
            explanation="SJF is Shortest Job First.",
            source_reference="Page 2",
            difficulty="Beginner"
        )
    ]
    
    req = QuizSubmissionRequest(
        submissions=[
            QuizSubmissionItem(question_id="q1", user_answer="Turnaround Time"),
            QuizSubmissionItem(question_id="q2", user_answer="Shortest Job First")
        ],
        quiz_questions=questions
    )
    
    result = quiz_service.evaluate_quiz(req)
    assert result.score == 2
    assert result.total_questions == 2
    assert result.percentage == 100
    assert len(result.weak_topics) == 0
    assert "100%" in result.revise_this_next_summary

def test_quiz_evaluation_with_weak_topics():
    questions = [
        QuizQuestion(
            id="q1",
            question_type="MCQ",
            topic_title="Round Robin",
            question="What happens if q is infinite?",
            options=["FCFS", "SJF", "Thrashing", "Deadlock"],
            correct_answer="FCFS",
            explanation="RR degenerates to FCFS.",
            source_reference="Page 2",
            difficulty="Intermediate"
        ),
        QuizQuestion(
            id="q2",
            question_type="MCQ",
            topic_title="Priority Scheduling",
            question="What fixes starvation?",
            options=["Aging", "FIFO", "Quantum", "Preemption"],
            correct_answer="Aging",
            explanation="Aging gradually increases priority.",
            source_reference="Page 2",
            difficulty="Intermediate"
        )
    ]
    
    req = QuizSubmissionRequest(
        submissions=[
            QuizSubmissionItem(question_id="q1", user_answer="FCFS"),
            QuizSubmissionItem(question_id="q2", user_answer="Wrong Answer")
        ],
        quiz_questions=questions
    )
    
    result = quiz_service.evaluate_quiz(req)
    assert result.score == 1
    assert result.total_questions == 2
    assert result.percentage == 50
    assert len(result.weak_topics) == 1
    assert result.weak_topics[0].topic_title == "Priority Scheduling"
    assert "Priority Scheduling" in result.revise_this_next_summary
