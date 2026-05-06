from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.config import AUDIO_DIR, LANGUAGES, MAX_UPLOAD_BYTES, PDF_DIR, language_code
from backend.services import (
    create_pdf_from_text,
    extract_pdf_text,
    generate_pdf,
    save_upload,
    synthesize_all_languages,
    synthesize_speech,
    translate_text,
)
from backend.services.speech import SpeechService

router = APIRouter(tags=["conversion"])
speech_service = SpeechService()
SAFE_STEM_RE = re.compile(r"[^a-zA-Z0-9._-]+")


def _build_file_url(kind: str, path: Path) -> str:
    return f"/api/files/{kind}/{path.name}"


def _safe_file_stem(name: str) -> str:
    stem = Path(name).stem
    return SAFE_STEM_RE.sub("-", stem)[:50] or "voice2pdf"


@router.post("/audio-to-pdf")
async def audio_to_pdf(
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

    safe_name = _safe_file_stem(filename or file.filename or "audio-transcript")
    pdf_full_path = generate_pdf(translated_text, target_code, safe_name)
    pdf_filename = Path(pdf_full_path).name

    pdf_url = f"http://localhost:8000/api/files/pdf/{pdf_filename}"
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
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str | None, Form()] = "English",
) -> dict[str, str]:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    original_text = await extract_pdf_text(pdf_path)
    if not original_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    target_code = language_code(language)
    translated_text = await translate_text(original_text, target_language=target_code)
    audio_path = await synthesize_speech(translated_text, language=target_code)

    return {
        "original_text": original_text,
        "translated_text": translated_text,
        "audio_url": _build_file_url("audio", audio_path),
    }


@router.post("/pdf-to-all-audio")
async def pdf_to_all_audio(file: Annotated[UploadFile, File(...)]) -> dict[str, str]:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    original_text = await extract_pdf_text(pdf_path)
    if not original_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    zip_path = await synthesize_all_languages(original_text)
    return {
        "original_text": original_text,
        "zip_url": _build_file_url("audio", zip_path),
    }


@router.post("/realtime")
async def realtime(
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
    audio_path = await synthesize_speech(translated_text, language=target_code)

    return {
        "original_text": original_text,
        "translated_text": translated_text,
        "audio_url": _build_file_url("audio", audio_path),
    }
