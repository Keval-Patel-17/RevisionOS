import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .routes import health, upload, revision, quiz, export
from .utils.logger import logger
from .utils.errors import DocumentProcessingError, GeminiAPIError, FileSizeLimitError, UnsupportedFileTypeError

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RevisionOS Backend - From lecture material to exam-ready revision."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for seamless local dev & hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred while processing your request. Please try again."}
    )

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(upload.router, prefix=settings.API_V1_STR, tags=["Document"])
app.include_router(revision.router, prefix=settings.API_V1_STR, tags=["Revision"])
app.include_router(quiz.router, prefix=settings.API_V1_STR, tags=["Quiz"])
app.include_router(export.router, prefix=settings.API_V1_STR, tags=["Export"])

@app.get("/")
def root():
    return {
        "app": "RevisionOS API",
        "tagline": "From lecture material to exam-ready revision.",
        "docs": "/docs",
        "health": "/api/health"
    }
