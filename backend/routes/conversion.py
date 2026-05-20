from __future__ import annotations

import logging
import os
import re
import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse

from backend.config import (
    AUDIO_DIR,
    LANGUAGES,
    MAX_UPLOAD_BYTES,
    PDF_DIR,
    TTS_DIR,
    language_code,
)
from backend.services import (
    create_pdf_from_text,
    extract_pdf_text,
    save_upload,
    synthesize_all_languages,
    synthesize_speech,
    translate_text,
)
from backend.services.speech import SpeechService

log = logging.getLogger(__name__)

router = APIRouter(tags=["conversion"])
speech_service = SpeechService()
SAFE_STEM_RE = re.compile(r"[^a-zA-Z0-9._-]+")

# Production base URL - used to build absolute audio URLs.
# Override with the VOICE2PDF_BASE_URL environment variable when deploying.
_FALLBACK_BASE = "https://py-projects--abdullah1234qq.replit.app"
PRODUCTION_BASE_URL: str = os.environ.get("VOICE2PDF_BASE_URL", _FALLBACK_BASE).rstrip("/")


def _base_url(request: Request | None) -> str:
    """
    Return the absolute base URL to use for file links.

    Priority:
      1. VOICE2PDF_BASE_URL environment variable (set in Replit Secrets)
      2. The incoming request origin (scheme + host), which works locally
         and in any other deployment automatically.
      3. Hard-coded production fallback.
    """
    env_url = os.environ.get("VOICE2PDF_BASE_URL", "").strip().rstrip("/")
    if env_url:
        return env_url
    if request is not None:
        try:
            return str(request.base_url).rstrip("/")
        except Exception:
            pass
    return PRODUCTION_BASE_URL


def _build_audio_url(request: Request | None, audio_path: Path) -> str:
    """
    Build a fully-qualified absolute URL for a TTS audio file.

    Files are saved to TTS_DIR and served at /api/files/audio/<name>.
    Always returns an absolute https:// URL so the frontend never has to
    guess the host.
    """
    base = _base_url(request)
    url = f"{base}/api/files/audio/{audio_path.name}"
    log.info("[AUDIO URL] path=%s  url=%s", audio_path, url)
    print(f"[AUDIO URL] path={audio_path}  url={url}")
    return url


def _build_pdf_url(request: Request | None, pdf_path: Path) -> str:
    """Build a fully-qualified absolute URL for a PDF file."""
    base = _base_url(request)
    url = f"{base}/api/files/pdf/{pdf_path.name}"
    log.info("[PDF URL] path=%s  url=%s", pdf_path, url)
    return url


def _validate_audio_file(path: Path) -> None:
    """
    Raise HTTP 500 if the audio file was not actually created on disk.
    This prevents the frontend from receiving a URL that will 404.
    """
    if not path.exists():
        log.error("[AUDIO] File not found after synthesis: %s", path)
        raise HTTPException(
            status_code=500,
            detail=f"Audio file was not generated. Expected: {path.name}",
        )
    size = path.stat().st_size
    if size == 0:
        log.error("[AUDIO] File is empty after synthesis: %s", path)
        raise HTTPException(
            status_code=500,
            detail=f"Audio file is empty (0 bytes): {path.name}",
        )
    log.info("[AUDIO] File validated: %s (%d bytes)", path.name, size)
    print(f"[AUDIO] File validated: {path.name} ({size} bytes)")


def _safe_file_stem(name: str) -> str:
    stem = Path(name).stem
    return SAFE_STEM_RE.sub("-", stem)[:50] or "voice2pdf"


# =============================================================================
# ROUTES
# =============================================================================

@router.post("/audio-to-pdf")
@router.post("/convert")
async def audio_to_pdf(
    request: Request,
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str | None, Form()] = "English",
    filename: Annotated[str | None, Form()] = None,
    source_language: Annotated[str | None, Form()] = None,
    target_language: Annotated[str | None, Form()] = None,
) -> dict[str, str]:
    audio_path = await save_upload(file, AUDIO_DIR, MAX_UPLOAD_BYTES)
    source_code = language_code(source_language) if source_language else None

    transcript = await speech_service.transcribe_file(audio_path, language=source_code)
    original_text = transcript.text or ""

    final_language = target_language or language or "English"
    target_code = language_code(final_language)
    translated_text = await translate_text(original_text, target_language=target_code)

    uploaded_name = (
        filename
        or (file.filename if hasattr(file, "filename") else None)
        or "audio-transcript"
    )
    clean_name = (
        Path(str(uploaded_name))
        .stem.replace("_", " ")
        .replace("-", " ")
        .strip()
        .title()
    )
    safe_filename = (
        filename.strip().replace(" ", "_")
        if filename and filename.strip()
        else clean_name.replace(" ", "_")
    )

    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = PDF_DIR / f"{safe_filename}.pdf"
    await create_pdf_from_text(
        translated_text, pdf_path, title=clean_name, language_code=target_code
    )

    pdf_url = _build_pdf_url(request, pdf_path)

    return {
        "text": original_text,
        "translated": translated_text,
        "pdf_file": pdf_url,
        "original_text": original_text,
        "translated_text": translated_text,
        "pdf_url": pdf_url,
    }


@router.post("/pdf-to-audio")
async def pdf_to_audio(
    request: Request,
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str | None, Form()] = "English",
) -> dict[str, str]:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    original_text = await extract_pdf_text(pdf_path)
    if not original_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    target_code = language_code(language)
    translated_text = await translate_text(original_text, target_language=target_code)

    print(f"[PDF-TO-AUDIO] Synthesising speech  lang={target_code}")
    audio_path = await synthesize_speech(translated_text, language=target_code)

    # Validate the file actually exists and is non-empty before returning URL.
    _validate_audio_file(audio_path)

    audio_url = _build_audio_url(request, audio_path)
    print(f"[PDF-TO-AUDIO] Done  audio_url={audio_url}")

    return {
        "original_text": original_text,
        "translated_text": translated_text,
        "audio_url": audio_url,
    }


@router.post("/pdf-to-all-audio")
async def pdf_to_all_audio(
    request: Request,
    file: Annotated[UploadFile, File(...)],
) -> dict[str, str]:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    original_text = await extract_pdf_text(pdf_path)
    if not original_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    print("[PDF-TO-ALL-AUDIO] Synthesising all languages…")
    zip_path = await synthesize_all_languages(original_text)

    _validate_audio_file(zip_path)

    zip_url = _build_audio_url(request, zip_path)
    print(f"[PDF-TO-ALL-AUDIO] Done  zip_url={zip_url}")

    return {
        "original_text": original_text,
        "zip_url": zip_url,
    }


@router.post("/realtime-pdf")
async def realtime_pdf(
    request: Request,
    text: Annotated[str, Form()],
    title: Annotated[str | None, Form()] = "Live Voice2PDF Transcript",
) -> FileResponse:
    pdf_filename = f"{uuid.uuid4().hex}.pdf"
    pdf_path = PDF_DIR / pdf_filename
    await create_pdf_from_text(text, pdf_path, title=title or "Live Voice2PDF Transcript")
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_filename)


@router.post("/realtime")
@router.post("/transcribe")
async def realtime(
    request: Request,
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str | None, Form()] = "English",
    source_language: Annotated[str | None, Form()] = None,
) -> dict[str, str]:
    audio_path = await save_upload(file, AUDIO_DIR, MAX_UPLOAD_BYTES)
    source_code = language_code(source_language) if source_language else None
    transcript = await speech_service.transcribe_file(audio_path, language=source_code)
    original_text = transcript.text or ""

    target_code = language_code(language)
    translated_text = await translate_text(original_text, target_language=target_code)

    print(f"[REALTIME] Synthesising speech  lang={target_code}")
    audio_path = await synthesize_speech(translated_text, language=target_code)

    _validate_audio_file(audio_path)

    audio_url = _build_audio_url(request, audio_path)
    print(f"[REALTIME] Done  audio_url={audio_url}")

    return {
        "original_text": original_text,
        "translated_text": translated_text,
        "audio_url": audio_url,
    }
