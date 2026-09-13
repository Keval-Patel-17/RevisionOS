import os
import re
import uuid
import html
from typing import Tuple

UUID_REGEX = re.compile(r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', re.IGNORECASE)

def validate_uuid(val: str) -> bool:
    """Validates that a string is a well-formed UUID."""
    if not val or not isinstance(val, str):
        return False
    return bool(UUID_REGEX.match(val.strip()))

def sanitize_filename(filename: str, max_length: int = 120) -> str:
    """
    Sanitizes an untrusted user filename to prevent path traversal,
    null byte attacks, and illegal filesystem characters.
    """
    if not filename:
        return "uploaded_document.pdf"
    
    # Strip directory parts across both POSIX and Windows
    base = os.path.basename(filename.replace("\\", "/"))
    # Remove null bytes and control characters
    base = re.sub(r'[\x00-\x1f\x7f]', '', base)
    
    # Separate name and extension
    name, ext = os.path.splitext(base)
    ext = ext.lower()
    
    # Clean name: keep alphanumeric, underscores, hyphens, dots, and spaces
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', name)
    # Remove sequential dots (path traversal like '..')
    clean_name = re.sub(r'\.{2,}', '.', clean_name).strip(' .')
    
    if not clean_name:
        clean_name = "document"
        
    # Enforce length limit while preserving extension
    if len(clean_name) + len(ext) > max_length:
        clean_name = clean_name[:max_length - len(ext)]
        
    return f"{clean_name}{ext}"

def is_safe_path(base_dir: str, target_path: str) -> bool:
    """Ensures that target_path strictly resolves within base_dir (prevents traversal)."""
    abs_base = os.path.abspath(base_dir)
    abs_target = os.path.abspath(target_path)
    return os.path.commonpath([abs_base, abs_target]) == abs_base

def verify_magic_bytes(header: bytes, ext: str) -> bool:
    """
    Validates file signatures (magic bytes) to prevent executable/binary spoofing.
    """
    ext = ext.lower()
    if ext == ".pdf":
        return header.startswith(b"%PDF-")
    elif ext in [".docx", ".pptx"]:
        # ZIP file signature for Office Open XML files
        return header.startswith(b"PK\x03\x04")
    elif ext == ".txt":
        # Text file should not contain null bytes in the header
        if b"\x00" in header:
            return False
        try:
            header.decode("utf-8")
            return True
        except UnicodeDecodeError:
            try:
                header.decode("latin-1")
                return True
            except UnicodeDecodeError:
                return False
    return False

def xml_escape(text: str) -> str:
    """
    Escapes special XML/HTML characters (<, >, &, \", ') for ReportLab Paragraph flowables.
    Prevents XML parsing crashes when mathematical operators or code constructs appear in text.
    """
    if not text:
        return ""
    # Use standard html.escape which handles & < > " '
    escaped = html.escape(str(text), quote=True)
    return escaped
