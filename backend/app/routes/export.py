import re
from fastapi import APIRouter, Response
from fastapi.responses import PlainTextResponse
from ..schemas.export import ExportRequest
from ..services.export_service import export_service
from ..utils.errors import DocumentProcessingError
from ..utils.logger import logger

router = APIRouter()

@router.post("/export")
async def export_revision_pack(req: ExportRequest):
    fmt = req.format.lower()
    clean_course = re.sub(r'[^a-zA-Z0-9_-]', '_', req.revision_pack.course_name)
    
    if fmt == "pdf":
        pdf_bytes = export_service.generate_pdf(req)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{clean_course}_RevisionOS_Pack.pdf"'
            }
        )
    elif fmt == "docx":
        docx_bytes = export_service.generate_docx(req)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{clean_course}_RevisionOS_Pack.docx"'
            }
        )
    elif fmt == "markdown" or fmt == "md":
        md_text = export_service.generate_markdown(req)
        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{clean_course}_RevisionOS_Pack.md"'
            }
        )
    else:
        raise DocumentProcessingError(detail=f"Unsupported export format '{fmt}'. Choose pdf, docx, or markdown.")
