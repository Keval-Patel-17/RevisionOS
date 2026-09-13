import os
import io
from fastapi import APIRouter, UploadFile, File, Depends
from ..services.document_service import document_service
from ..schemas.document import DocumentMetadata
from ..utils.errors import FileSizeLimitError, UnsupportedFileTypeError, DocumentProcessingError
from ..utils.security import sanitize_filename, verify_magic_bytes
from ..utils.rate_limiter import rate_limit
from ..config import settings
from ..utils.logger import logger

router = APIRouter()

DEMO_ASSET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "demo_assets",
    "cpu_scheduling_lecture.pdf"
)

CHUNK_SIZE = 64 * 1024  # 64 KB read buffer

@router.post("/upload", response_model=DocumentMetadata, dependencies=[Depends(rate_limit(max_requests=15, window_seconds=60, route_tag="upload"))])
async def upload_document(file: UploadFile = File(...)):
    raw_filename = file.filename or "uploaded_document.pdf"
    clean_filename = sanitize_filename(raw_filename)
    ext = os.path.splitext(clean_filename)[1].lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise UnsupportedFileTypeError(detail=f"Unsupported format '{ext}'. RevisionOS supports PDF, DOCX, PPTX, and TXT files.")
        
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    byte_buffer = io.BytesIO()
    total_bytes = 0
    
    # Stream in chunks to prevent unbounded memory allocation (DoS protection)
    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > max_bytes:
            raise FileSizeLimitError(detail=f"File size exceeds the {settings.MAX_FILE_SIZE_MB}MB limit.")
        byte_buffer.write(chunk)
        
    contents = byte_buffer.getvalue()
    if len(contents) == 0:
        raise DocumentProcessingError(detail="The uploaded file is empty.")
        
    # Verify file magic bytes / signature
    if not verify_magic_bytes(contents[:1024], ext):
        logger.warning(f"Spoofed or invalid file signature detected for {clean_filename}")
        raise UnsupportedFileTypeError(detail="File content does not match its expected format signature.")
        
    file_id, saved_path = document_service.save_temp_file(contents, clean_filename)
    metadata, chunks = document_service.extract_chunks_and_metadata(saved_path, clean_filename)
    return metadata

@router.post("/demo", response_model=DocumentMetadata, dependencies=[Depends(rate_limit(max_requests=25, window_seconds=60, route_tag="demo"))])
async def load_demo_document():
    if not os.path.exists(DEMO_ASSET_PATH):
        raise DocumentProcessingError(detail="Demo asset not found on server.")
        
    with open(DEMO_ASSET_PATH, "rb") as f:
        demo_bytes = f.read()
        
    filename = "Operating_Systems_Lecture4_CPU_Scheduling.pdf"
    file_id, saved_path = document_service.save_temp_file(demo_bytes, filename)
    metadata, _ = document_service.extract_chunks_and_metadata(saved_path, filename)
    return metadata
