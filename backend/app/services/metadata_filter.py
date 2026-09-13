import re
from typing import List, Set, Dict, Any, Optional

class MetadataFilter:
    """
    Deterministic metadata detection, filtering, and semantic relevance classification.
    Strips presentation chrome, author headers, slide numbers, dates, and administrative noise
    while strictly preserving academic content, formulas, metrics, and genuine conceptual numbers.
    """

    # Patterns that represent pure administrative metadata
    SLIDE_PAGE_PATTERNS = [
        re.compile(r'^\s*(?:slide|page)?\s*\d+\s*(?:of\s*\d+)?\s*$', re.IGNORECASE),
        re.compile(r'^\s*\d+\s*/\s*\d+\s*$'),
        re.compile(r'^\s*[-—–]\s*\d+\s*[-—–]\s*$'),
        re.compile(r'^\s*\[\s*\d+\s*\]\s*$'),
        re.compile(r'^\s*page\s*\d+\s*$', re.IGNORECASE),
        re.compile(r'^\s*slide\s*\d+\s*$', re.IGNORECASE),
        re.compile(r'^\s*\d+\s*$'),  # Single standalone number (e.g. "1", "19")
    ]

    AUTHOR_INSTRUCTOR_PATTERNS = [
        re.compile(r'^\s*(?:prof\.|professor|dr\.|instructor|author|lecturer|presented by|by)\s+[a-z\s\.\,\-]+$', re.IGNORECASE),
        re.compile(r'\b(?:prof\.|professor|dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'),
    ]

    INSTITUTION_DEPT_PATTERNS = [
        re.compile(r'\b(?:department of|dept\. of|faculty of|school of|division of)\s+[\w\s]+', re.IGNORECASE),
        re.compile(r'\b(?:indian institute of technology|iit|national institute of technology|nit|university|college)\b[\w\s]*', re.IGNORECASE),
        re.compile(r'\b(?:kharagpur|delhi|bombay|madras|kanpur|roorkee|guwahati|hyderabad|stanford|mit|berkeley|harvard|cmu)\b', re.IGNORECASE),
    ]

    ADMIN_NOISE_PATTERNS = [
        re.compile(r'\b[\w\.-]+@[\w\.-]+\.\w+\b'),  # Email addresses
        re.compile(r'https?://\S+|www\.\S+'),        # URLs
        re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'), # Phone numbers
        re.compile(r'\b(?:all rights reserved|copyright|©|\(c\)|creative commons)\b.*$', re.IGNORECASE),
        re.compile(r'^\s*(?:course code|course no|course id)\s*[:\-]?\s*[\w\d\-]+\s*$', re.IGNORECASE),
        re.compile(r'^\s*(?:lecture|module|chapter|unit)\s*\d+\s*[:\-]?\s*$', re.IGNORECASE),
        re.compile(r'^\s*(?:spring|fall|autumn|summer|winter|semester)\s*\d{4}\s*$', re.IGNORECASE),
        re.compile(r'^\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{1,4}(?:,\s*\d{4})?\s*$', re.IGNORECASE),
        re.compile(r'^\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s*$'), # Plain dates
    ]

    # Academic tokens that look like numbers or short strings but MUST be preserved
    ACADEMIC_NUMBER_PATTERNS = [
        re.compile(r'\bO\([n\d\^log\s\+\*]+\)', re.IGNORECASE),  # Big O: O(n^2), O(1)
        re.compile(r'\b(?:tau|alpha|beta|lambda|gamma|delta|epsilon|sigma|omega|pi)\b', re.IGNORECASE),
        re.compile(r'\b\d+(?:\.\d+)?\s*(?:ms|sec|s|us|ns|kb|mb|gb|tb|hz|khz|mhz|ghz|%|quanta|quantum)\b', re.IGNORECASE),
        re.compile(r'\b(?:1st|2nd|3rd|\d+th)\s+(?:century|generation|order|degree|level|layer|queue|iteration)\b', re.IGNORECASE),
        re.compile(r'\bq\s*=\s*\d+', re.IGNORECASE),
        re.compile(r'\b(?:80/20|80%)\b'),
    ]

    @classmethod
    def is_academic_number_or_metric(cls, text: str) -> bool:
        """Checks if a string contains legitimate academic formulas, metrics, or notations."""
        for pattern in cls.ACADEMIC_NUMBER_PATTERNS:
            if pattern.search(text):
                return True
        return False

    @classmethod
    def is_metadata_line(cls, line: str) -> bool:
        """
        Determines whether a line is purely administrative metadata
        (e.g., slide numbers, professor names, emails, dates, department titles).
        """
        clean = line.strip()
        if not clean:
            return True

        # If it has legitimate academic formulas, keep it
        if cls.is_academic_number_or_metric(clean):
            return False

        # Check pure slide/page numbers
        for p in cls.SLIDE_PAGE_PATTERNS:
            if p.match(clean):
                return True

        # Check author/professor lines
        for p in cls.AUTHOR_INSTRUCTOR_PATTERNS:
            if p.match(clean):
                return True

        # Check department/institution headers
        for p in cls.INSTITUTION_DEPT_PATTERNS:
            if p.match(clean) and len(clean.split()) <= 10:
                return True

        # Check general noise patterns
        for p in cls.ADMIN_NOISE_PATTERNS:
            if p.search(clean) and len(clean) < 80:
                return True

        return False

    @classmethod
    def filter_metadata_lines(cls, lines: List[str]) -> List[str]:
        """Filters out administrative metadata lines from a list of text lines."""
        cleaned = []
        for line in lines:
            if not cls.is_metadata_line(line):
                cleaned.append(line)
        return cleaned

    @classmethod
    def extract_repeated_chrome(cls, all_chunk_texts: List[str], threshold: float = 0.3) -> Set[str]:
        """
        Identifies repeated headers/footers appearing across multiple chunks (> threshold ratio).
        Such repeated phrases are presentation chrome (e.g. university name on every slide).
        """
        if len(all_chunk_texts) < 3:
            return set()

        line_counts: Dict[str, int] = {}
        for chunk in all_chunk_texts:
            seen_in_chunk = set()
            for line in chunk.split("\n"):
                l = line.strip()
                if 4 < len(l) < 80 and not cls.is_academic_number_or_metric(l):
                    if l.lower() not in seen_in_chunk:
                        seen_in_chunk.add(l.lower())
                        line_counts[l.lower()] = line_counts.get(l.lower(), 0) + 1

        min_occurrences = max(2, int(len(all_chunk_texts) * threshold))
        chrome = {line for line, count in line_counts.items() if count >= min_occurrences}
        return chrome

    @classmethod
    def clean_academic_title(cls, candidate: str, fallback_content: str = "") -> str:
        """
        Normalizes and validates a candidate topic title.
        Ensures the title is a meaningful academic concept, not a slide number,
        author name, course prefix, or fragmented noise.
        """
        raw = candidate.strip()
        
        # Remove common slide prefixes like "Lecture 4: ", "Chapter 2 - ", "Slide 12: "
        cleaned = re.sub(r'^(?:lecture|chapter|module|unit|slide|section)\s*\d+[\s:\-—–]*', '', raw, flags=re.IGNORECASE).strip()
        
        # Remove trailing lecture markers like " - I", " Part 1", " (Contd.)", " (Continued)"
        cleaned = re.sub(r'[\s\-—–]+(?:\(?\s*(?:part\s*\d+|contd\.?|continued)\s*\)?|\bI{1,3}\b|\bIV\b|\bV\b|\bVI\b)\s*$', '', cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r'\s*\(\s*(?:contd\.?|continued|part\s*\d+)\s*\)\s*$', '', cleaned, flags=re.IGNORECASE).strip()

        # Check if the title is invalid metadata
        if (
            not cleaned 
            or cleaned.isdigit() 
            or len(cleaned) < 3
            or cls.is_metadata_line(cleaned)
            or re.match(r'^[a-z0-9\s]{1,2}$', cleaned, re.IGNORECASE)
        ):
            # Derive academic title from fallback content if available
            if fallback_content:
                for line in fallback_content.split("\n"):
                    l = line.strip()
                    if len(l) > 5 and not cls.is_metadata_line(l):
                        sub_clean = re.sub(r'^(?:lecture|chapter|module|unit|slide|section)\s*\d+[\s:\-—–]*', '', l, flags=re.IGNORECASE).strip()
                        if len(sub_clean) >= 4 and not cls.is_metadata_line(sub_clean):
                            return sub_clean[:60]
            return "Academic Concepts"

        return cleaned[:80]

    @classmethod
    def classify_semantic_relevance(cls, text: str) -> str:
        """
        Classifies candidate text into academic categories:
        ACADEMIC_TOPIC, ACADEMIC_CONCEPT, SUPPORTING_DETAIL, EXAMPLE, FORMULA, METADATA, NOISE.
        """
        clean = text.strip()
        if not clean or len(clean) < 2:
            return "NOISE"

        if cls.is_metadata_line(clean):
            return "METADATA"

        if cls.is_academic_number_or_metric(clean) or any(op in clean for op in ["=", "->", "=>", "tau_{", "alpha *"]):
            return "FORMULA"

        lower = clean.lower()
        if lower.startswith(("e.g.", "for example", "for instance", "case study", "consider")):
            return "EXAMPLE"

        if len(clean.split()) <= 6 and not any(p in clean for p in [".", ";", "?", "!"]):
            return "ACADEMIC_CONCEPT"

        if any(term in lower for term in ["architecture", "algorithm", "scheduling", "protocol", "model", "theory", "mechanism"]):
            return "ACADEMIC_TOPIC"

        return "SUPPORTING_DETAIL"

metadata_filter = MetadataFilter()
