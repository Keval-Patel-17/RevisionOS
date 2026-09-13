from typing import List, Dict
from ..schemas.quiz import (
    QuizQuestion,
    QuizSubmissionRequest,
    QuizEvaluationResult,
    EvaluatedQuestion,
    WeakTopic
)
from ..services.gemini_service import gemini_service
from ..utils.logger import logger

class QuizService:
    @staticmethod
    def evaluate_quiz(
        submission_req: QuizSubmissionRequest
    ) -> QuizEvaluationResult:
        # Build maps for user submissions by question_id
        submissions_map = {item.question_id: item for item in submission_req.submissions}
        evaluated: List[EvaluatedQuestion] = []
        topic_performance: Dict[str, Dict] = {}
        
        total_score_earned = 0.0
        total_questions = len(submission_req.quiz_questions)

        for q in submission_req.quiz_questions:
            sub = submissions_map.get(q.id)
            u_ans = sub.user_answer.strip() if sub else ""
            selected_idx = sub.selected_option_index if sub else None

            is_correct = False
            status = "INCORRECT"
            score_earned = 0.0
            feedback = ""
            missing_concepts: List[str] = []

            if q.question_type.upper() == "MCQ":
                # Evaluate MCQ by option index or by text match
                correct_idx = q.correct_option_index
                
                if selected_idx is not None and correct_idx is not None:
                    is_correct = (selected_idx == correct_idx)
                elif q.options and selected_idx is not None and selected_idx < len(q.options):
                    is_correct = (q.options[selected_idx].strip().lower() == q.correct_answer.strip().lower())
                else:
                    is_correct = (u_ans.lower() == q.correct_answer.lower())

                if is_correct:
                    status = "CORRECT"
                    score_earned = 1.0
                    feedback = f"Correct! Grounded in {q.source_reference}."
                else:
                    status = "INCORRECT"
                    score_earned = 0.0
                    feedback = f"Incorrect. Correct answer: '{q.correct_answer}' ({q.source_reference})."
                    missing_concepts = [q.correct_answer]

            else:
                # Semantic Short Answer Evaluation
                sem_res = gemini_service.evaluate_short_answer(q, u_ans)
                is_correct = sem_res.is_correct
                score_earned = sem_res.score
                status = sem_res.status
                feedback = sem_res.feedback
                missing_concepts = sem_res.missing_concepts

            total_score_earned += score_earned

            evaluated.append(EvaluatedQuestion(
                question_id=q.id,
                question=q.question,
                topic_title=q.topic_title,
                user_answer=u_ans if u_ans else "(No answer provided)",
                correct_answer=q.correct_answer,
                is_correct=is_correct,
                status=status,
                score_earned=score_earned,
                feedback=feedback,
                missing_concepts=missing_concepts,
                explanation=q.explanation,
                source_reference=q.source_reference
            ))

            # Track topic accuracy
            if q.topic_title not in topic_performance:
                topic_performance[q.topic_title] = {
                    "score_earned": 0.0,
                    "max_score": 0.0,
                    "source_reference": q.source_reference,
                    "sample_q": q.question
                }
            topic_performance[q.topic_title]["score_earned"] += score_earned
            topic_performance[q.topic_title]["max_score"] += 1.0

        # Identify weak topics where score < max_score
        weak_topics: List[WeakTopic] = []
        for topic_title, stats in topic_performance.items():
            if stats["score_earned"] < stats["max_score"]:
                shortfall = stats["max_score"] - stats["score_earned"]
                weak_topics.append(WeakTopic(
                    topic_title=topic_title,
                    reason=f"Missed {shortfall:.1f} point(s) out of {stats['max_score']:.0f} on this topic.",
                    recommended_revision_points=[
                        f"Review definitions and formulas under '{topic_title}' in {stats['source_reference']}",
                        f"Targeted recall: Re-check core concepts tested in: '{stats['sample_q']}'"
                    ],
                    source_reference=stats["source_reference"]
                ))

        pct = int(round((total_score_earned / max(1, total_questions)) * 100))

        if weak_topics:
            topics_list = ", ".join([f"'{w.topic_title}' ({w.source_reference})" for w in weak_topics])
            revise_summary = f"Focus your next 5-minute study sprint on: {topics_list}. Pay special attention to exact formulas and distinction rules."
        else:
            revise_summary = "Outstanding work! You achieved 100% active recall across all tested topics. You are ready for exam review."

        readiness = int(round(pct * 0.7 + 25))
        readiness = min(100, max(0, readiness))

        return QuizEvaluationResult(
            score=round(total_score_earned, 1),
            total_questions=total_questions,
            percentage=pct,
            evaluated_questions=evaluated,
            weak_topics=weak_topics,
            revise_this_next_summary=revise_summary,
            updated_readiness_estimate=readiness
        )

quiz_service = QuizService()
