import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form
from ..services.document_service import document_service, TEMP_STORAGE_DIR
from ..schemas.document import DocumentMetadata
from ..utils.errors import FileSizeLimitError, UnsupportedFileTypeError, DocumentProcessingError
from ..config import settings
from ..utils.logger import logger

router = APIRouter()

DEMO_ASSET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "demo_assets",
    "cpu_scheduling_lecture.pdf"
)

@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_document.pdf"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise UnsupportedFileTypeError()
        
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise FileSizeLimitError()
        
    file_id, saved_path = document_service.save_temp_file(contents, filename)
    metadata, chunks = document_service.extract_chunks_and_metadata(saved_path, filename)
    return metadata

@router.post("/demo", response_model=DocumentMetadata)
async def load_demo_document():
    if not os.path.exists(DEMO_ASSET_PATH):
        raise DocumentProcessingError(detail="Demo asset not found on server.")
        
    with open(DEMO_ASSET_PATH, "rb") as f:
        demo_bytes = f.read()
        
    filename = "Operating_Systems_Lecture4_CPU_Scheduling.pdf"
    file_id, saved_path = document_service.save_temp_file(demo_bytes, filename)
    metadata, _ = document_service.extract_chunks_and_metadata(saved_path, filename)
    return metadata
