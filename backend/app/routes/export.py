import re
from fastapi import APIRouter, Response, Depends
from fastapi.responses import PlainTextResponse
from ..schemas.export import ExportRequest
from ..services.export_service import export_service
from ..utils.errors import DocumentProcessingError
from ..utils.rate_limiter import rate_limit
from ..utils.security import sanitize_filename
from ..utils.logger import logger

router = APIRouter()

@router.post(
    "/export",
    dependencies=[Depends(rate_limit(max_requests=30, window_seconds=60, route_tag="export"))]
)
async def export_revision_pack(req: ExportRequest):
    fmt = req.format.lower().strip()
    safe_course = re.sub(r'[^a-zA-Z0-9_\-]', '_', req.revision_pack.course_name).strip('_') or "Course"
    if len(safe_course) > 50:
        safe_course = safe_course[:50]
    
    if fmt == "pdf":
        pdf_bytes = export_service.generate_pdf(req)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_course}_RevisionOS_Pack.pdf"'
            }
        )
    elif fmt == "docx":
        docx_bytes = export_service.generate_docx(req)
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_course}_RevisionOS_Pack.docx"'
            }
        )
    elif fmt in ["markdown", "md"]:
        md_text = export_service.generate_markdown(req)
        return PlainTextResponse(
            content=md_text,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_course}_RevisionOS_Pack.md"'
            }
        )
    else:
        raise DocumentProcessingError(detail=f"Unsupported export format '{fmt}'. Choose pdf, docx, or markdown.")
