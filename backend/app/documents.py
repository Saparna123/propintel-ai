from pathlib import Path

from pypdf import PdfReader

from .config import ALLOWED_EXTENSIONS, ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES


class DocumentError(Exception):
    def __init__(self, message: str, code: str = "document_processing_error"):
        super().__init__(message)
        self.code = code
        self.message = message


def validate_upload(filename: str, content_type: str | None, size: int) -> None:
    if size <= 0:
        raise DocumentError("The document could not be processed. Empty files are not accepted.")
    if size > MAX_UPLOAD_BYTES:
        raise DocumentError(
            f"The document could not be processed. File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit."
        )
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise DocumentError(
            "The document could not be processed. Please upload a supported or clearer document."
        )
    if content_type and content_type not in ALLOWED_UPLOAD_TYPES and not content_type.startswith("text/"):
        # browsers may send empty/octet-stream; extension remains the authority
        if content_type not in {"application/octet-stream", ""}:
            raise DocumentError(
                "The document could not be processed. Please upload a supported or clearer document."
            )


def extract_text(filename: str, raw: bytes, content_type: str | None) -> dict:
    ext = Path(filename).suffix.lower()
    errors: list[str] = []
    text = ""
    method = "none"

    try:
        if ext == ".txt":
            text = raw.decode("utf-8", errors="replace")[:20000]
            method = "utf8_text"
        elif ext == ".pdf":
            from io import BytesIO

            reader = PdfReader(BytesIO(raw))
            chunks = []
            for page in reader.pages[:15]:
                chunks.append(page.extract_text() or "")
            text = "\n".join(chunks).strip()[:20000]
            method = "pypdf_text"
            if not text:
                errors.append("No extractable text layer found in the PDF. OCR is not implemented.")
        elif ext in {".png", ".jpg", ".jpeg"}:
            method = "image_no_ocr"
            errors.append("Image OCR is not implemented. Only file metadata is recorded.")
        elif ext == ".docx":
            try:
                from io import BytesIO

                import docx

                document = docx.Document(BytesIO(raw))
                text = "\n".join(p.text for p in document.paragraphs)[:20000]
                method = "python_docx"
                if not text.strip():
                    errors.append("DOCX contained no readable paragraph text.")
            except Exception:
                errors.append("DOCX parser unavailable or file unreadable.")
        else:
            errors.append("Unsupported extraction path.")
    except Exception:
        errors.append("The document could not be processed. Please upload a supported or clearer document.")

    fields = {
        "filename": filename,
        "declared_content_type": content_type or "unknown",
        "size_bytes": len(raw),
        "extraction_method": method,
        "character_count": len(text or ""),
    }
    if text.strip():
        fields["text_preview"] = text.strip()[:800]
        fields["text_preview_status"] = "verified"
        fields["text_preview_note"] = "Extracted from the uploaded file contents. Not an official verification."
    else:
        fields["text_preview"] = None
        fields["text_preview_status"] = "unavailable"
        fields["text_preview_note"] = "Data Not Available — no readable text extracted."

    return {
        "extracted_fields": fields,
        "extracted_text": text,
        "extraction_errors": errors,
        "readable": bool(text.strip()),
        "ocr_used": False,
        "label": "Document text extraction from uploaded file"
        if text.strip()
        else "No extractable text — Data Not Available",
    }
