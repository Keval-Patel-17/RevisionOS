import os
import pytest
from backend.app.services.document_service import document_service
from backend.app.utils.errors import UnsupportedFileTypeError

def test_document_service_save_and_extract_txt():
    content = b"Heading 1\nThis is a test lecture content on CPU scheduling and burst cycles.\n\nSection 2\nPreemptive scheduling details."
    file_id, saved_path = document_service.save_temp_file(content, "sample.txt")
    assert os.path.exists(saved_path)
    
    metadata, chunks = document_service.extract_chunks_and_metadata(saved_path, "sample.txt")
    assert metadata.filename == "sample.txt"
    assert metadata.file_type == "TXT"
    assert len(chunks) > 0
    assert "CPU scheduling" in chunks[0].text

def test_document_service_unsupported_type():
    with pytest.raises(UnsupportedFileTypeError):
        document_service.save_temp_file(b"bad content", "image.png")

def test_document_service_demo_asset():
    demo_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo_assets", "cpu_scheduling_lecture.pdf")
    assert os.path.exists(demo_pdf)
    metadata, chunks = document_service.extract_chunks_and_metadata(demo_pdf, "cpu_scheduling_lecture.pdf")
    assert metadata.file_type == "PDF"
    assert len(chunks) >= 2
    assert any("Burst Cycle" in c.text for c in chunks)
