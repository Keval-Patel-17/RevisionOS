import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .routes import health, upload, revision, quiz, export
from .services.document_service import document_service
from .utils.logger import logger
from .utils.errors import DocumentProcessingError, GeminiAPIError, FileSizeLimitError, UnsupportedFileTypeError

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: run expired temp files purge
    logger.info("RevisionOS backend starting up. Running cleanup of expired temp files...")
    document_service.cleanup_expired_temp_files()
    yield
    # Shutdown
    logger.info("RevisionOS backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RevisionOS Backend - From lecture material to exam-ready revision.",
    lifespan=lifespan
)

# HTTP Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# CORS Configuration
# Note: W3C spec forbids allow_credentials=True with allow_origins=["*"]
cors_origins = [o for o in settings.BACKEND_CORS_ORIGINS if o != "*"]
if not cors_origins:
    cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Explicit HTTPException Handler to preserve status codes & custom headers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    headers = getattr(exc, "headers", None) or {}
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

# Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
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
