import os
from backend.app.services.document_service import document_service
from backend.app.services.gemini_service import gemini_service
from backend.app.schemas.document import PersonalizationPreferences

def test_full_document_extraction_and_late_topics():
    demo_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo_assets", "cpu_scheduling_lecture.pdf")
    assert os.path.exists(demo_pdf)
    
    metadata, chunks = document_service.extract_chunks_and_metadata(demo_pdf, "cpu_scheduling_lecture.pdf")
    
    # 1. Confirm all 16 pages are extracted without artificial truncation
    assert metadata.page_count == 16
    assert len(chunks) == 16
    assert metadata.total_units == 16
    assert metadata.processed_units == 16
    assert metadata.coverage_percentage == 100

    # 2. Generate revision pack
    prefs = PersonalizationPreferences(course_name="Operating Systems", notes_length="Balanced")
    pack = gemini_service.generate_revision_pack(chunks, "cpu_scheduling_lecture.pdf", prefs)

    # 3. Confirm coverage is accurate
    assert pack.total_units == 16
    assert pack.processed_units == 16
    assert pack.coverage_percentage == 100

    # 4. Confirm topics from later slides/pages (Pages 13-16) appear in the notes!
    topic_titles = [t.topic_title for t in pack.topics]
    late_topics = [t for t in pack.topics if any(int(p) >= 13 for ref in t.source_references for p in ref.replace("Page ", "").split("–") if p.isdigit()) or "Pages 13" in t.source_reference or "Pages 15" in t.source_reference or "mlfq" in t.topic_title.lower() or "aging" in t.topic_title.lower()]
    assert len(late_topics) >= 1, f"Expected late-document topics to be present. Found: {topic_titles}"

    # 5. Confirm high-priority topics are NOT limited to only two
    high_priority_topics = [t for t in pack.topics if t.priority == "HIGH"]
    assert len(high_priority_topics) >= 3, f"Expected evidence-based priority to detect >=3 HIGH priority topics. Found {len(high_priority_topics)}"
    
    # 6. Verify evidence signals exist on topics
    for t in pack.topics:
        assert t.importance_score >= 0.0
        assert len(t.evidence_signals) > 0
        assert t.source_reference != ""
