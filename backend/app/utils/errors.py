from fastapi import HTTPException, status

class DocumentProcessingError(HTTPException):
    def __init__(self, detail: str = "We couldn't process this document. Please check the file and try again."):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class GeminiAPIError(HTTPException):
    def __init__(self, detail: str = "AI revision generation failed. Please verify your Gemini API key or try again."):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

class FileSizeLimitError(HTTPException):
    def __init__(self, detail: str = "File size exceeds the 25MB limit. Please upload a smaller lecture document."):
        super().__init__(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=detail)

class UnsupportedFileTypeError(HTTPException):
    def __init__(self, detail: str = "Unsupported format. RevisionOS supports PDF, DOCX, PPTX, and TXT files."):
        super().__init__(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=detail)
