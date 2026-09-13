from backend.app.schemas.revision import RevisionPack, TopicNote
from backend.app.schemas.quiz import QuizQuestion
from backend.app.schemas.export import ExportRequest
from backend.app.services.export_service import export_service

def test_export_pdf_and_markdown():
    pack = RevisionPack(
        course_name="Operating Systems",
        source_document_name="cpu_scheduling.pdf",
        study_time_estimate="30 mins",
        revision_readiness_estimate=75,
        high_priority_count=1,
        topics_count=1,
        topics=[
            TopicNote(
                id="t1",
                topic_title="CPU Scheduling",
                priority="HIGH",
                priority_reason="Core topic",
                summary="Summary of CPU scheduling.",
                key_concepts=["Preemption", "FCFS"],
                definitions=["Turnaround Time"],
                formulas_or_rules=["WT = TAT - BT"],
                common_mistakes=["Confusing WT with TAT"],
                exam_focus_points=["Calculate WT"],
                source_reference="Page 1",
                reviewed=True
            )
        ]
    )
    
    questions = [
        QuizQuestion(
            id="q1",
            question_type="MCQ",
            topic_title="CPU Scheduling",
            question="What is TAT?",
            options=["Option A", "Option B"],
            correct_answer="Option A",
            explanation="Explanation A",
            source_reference="Page 1"
        )
    ]
    
    # Test Markdown export
    req_md = ExportRequest(format="markdown", revision_pack=pack, quiz_questions=questions)
    md_output = export_service.generate_markdown(req_md)
    assert "# RevisionOS Study Pack" in md_output
    assert "CPU Scheduling" in md_output
    assert "WT = TAT - BT" in md_output
    
    # Test PDF export
    req_pdf = ExportRequest(format="pdf", revision_pack=pack, quiz_questions=questions)
    pdf_bytes = export_service.generate_pdf(req_pdf)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")
    
    # Test DOCX export
    req_docx = ExportRequest(format="docx", revision_pack=pack, quiz_questions=questions)
    docx_bytes = export_service.generate_docx(req_docx)
    assert len(docx_bytes) > 500
    assert docx_bytes.startswith(b"PK") # Zip container of docx
