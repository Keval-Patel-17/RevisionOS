import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.utils.security import (
    sanitize_filename,
    verify_magic_bytes,
    is_safe_path,
    validate_uuid,
    xml_escape
)
from backend.app.schemas.revision import RevisionPack, TopicNote
from backend.app.schemas.export import ExportRequest
from backend.app.services.export_service import export_service

client = TestClient(app)

def test_sanitize_filename():
    assert sanitize_filename("../../etc/passwd.pdf") == "passwd.pdf"
    assert sanitize_filename("..\\..\\windows\\system32\\calc.exe.pdf") == "calc.exe.pdf"
    assert sanitize_filename("test\x00file.docx") == "testfile.docx"
    assert sanitize_filename("lecture...slide...pdf") == "lecture.slide.pdf"
    assert sanitize_filename("///evil/path/to/my_notes.pdf") == "my_notes.pdf"
    long_name = "a" * 200 + ".pdf"
    sanitized = sanitize_filename(long_name, max_length=50)
    assert len(sanitized) <= 50
    assert sanitized.endswith(".pdf")

def test_verify_magic_bytes():
    # Valid PDF header
    assert verify_magic_bytes(b"%PDF-1.7\n%\xe2\xe3\xcf\xd3", ".pdf") is True
    # Spoofed PDF (ELF binary)
    assert verify_magic_bytes(b"\x7fELF\x02\x01\x01\x00", ".pdf") is False
    # Spoofed PDF (PE executable)
    assert verify_magic_bytes(b"MZ\x90\x00\x03\x00\x00\x00", ".pdf") is False

    # Valid DOCX header (ZIP)
    assert verify_magic_bytes(b"PK\x03\x04\x14\x00\x06\x00", ".docx") is True
    # Spoofed DOCX (plain text)
    assert verify_magic_bytes(b"This is just plain text", ".docx") is False

    # Plain text
    assert verify_magic_bytes(b"Chapter 1: CPU Scheduling algorithms...", ".txt") is True
    # Binary disguised as txt
    assert verify_magic_bytes(b"\x00\x01\x02\x03", ".txt") is False

def test_is_safe_path():
    base = "c:/safe/temp"
    assert is_safe_path(base, "c:/safe/temp/file.pdf") is True
    assert is_safe_path(base, "c:/safe/temp/sub/file.pdf") is True
    assert is_safe_path(base, "c:/safe/temp/../../etc/passwd") is False

def test_validate_uuid():
    assert validate_uuid("123e4567-e89b-12d3-a456-426614174000") is True
    assert validate_uuid("invalid-uuid-string") is False
    assert validate_uuid("") is False
    assert validate_uuid("../") is False

def test_xml_escape():
    raw = "O(n) < O(n^2) & latency > 10ms with \"quotes\" and 'apostrophe'"
    escaped = xml_escape(raw)
    assert "<" not in escaped or "&lt;" in escaped
    assert ">" not in escaped or "&gt;" in escaped
    assert "& " not in escaped
    assert "&amp;" in escaped

def test_security_headers_present():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "strict-origin" in response.headers.get("Referrer-Policy", "")

def test_upload_rejects_spoofed_file():
    # Attempt to upload a fake PDF with shell script content
    fake_pdf = io.BytesIO(b"#!/bin/bash\necho 'hacked'")
    response = client.post(
        "/api/upload",
        files={"file": ("malicious.pdf", fake_pdf, "application/pdf")}
    )
    assert response.status_code == 415
    assert "signature" in response.json()["detail"].lower()

def test_upload_rejects_unsupported_extension():
    bad_file = io.BytesIO(b"binary payload")
    response = client.post(
        "/api/upload",
        files={"file": ("malicious.exe", bad_file, "application/octet-stream")}
    )
    assert response.status_code == 415

def test_export_pdf_with_xml_entities():
    # PDF generation should not crash when notes contain mathematical operators <, >, &
    topic = TopicNote(
        id="t1",
        topic_title="Scheduling Bound <Analysis> & Tradeoffs",
        priority="HIGH",
        priority_reason="Core theoretical bound O(n) < O(n^2)",
        summary="When Quantum < 10ms, Overhead > 50% & Thrashing occurs.",
        core_explanation="Formula: T_wait < T_turnaround && P_active == true",
        key_concepts=["Time < Quantum", "Overhead & Jitter"],
        definitions=["Quantum < Limit"],
        procedures=["1. Check if T < Q", "2. If yes & ready: dispatch"],
        formulas_or_rules=["Average < Burst / 2 & Q > 0"],
        common_mistakes=["Believing Q < 1ms has 0 overhead"],
        source_reference="Page 1 & Slide 2"
    )
    pack = RevisionPack(
        course_name="Operating Systems <Advanced> & Real-Time",
        source_document_name="OS_Lecture <Part 1>.pdf",
        study_time_estimate="20 mins",
        topics=[topic]
    )
    req = ExportRequest(format="pdf", revision_pack=pack)
    pdf_bytes = export_service.generate_pdf(req)
    assert pdf_bytes.startswith(b"%PDF")
