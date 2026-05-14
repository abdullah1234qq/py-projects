from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.config import (
    AUDIO_DIR,
    LANGUAGES,
    MAX_UPLOAD_BYTES,
    PDF_DIR,
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

router = APIRouter(tags=["conversion"])
speech_service = SpeechService()
SAFE_STEM_RE = re.compile(r"[^a-zA-Z0-9._-]+")


def _build_file_url(kind: str, path: Path) -> str:
    return f"/api/files/{kind}/{path.name}"


def _safe_file_stem(name: str) -> str:
    stem = Path(name).stem
    return SAFE_STEM_RE.sub("-", stem)[:50] or "voice2pdf"


@router.post("/audio-to-pdf")
@router.post("/convert")
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

    # Build a human-friendly title from the provided filename or uploaded file name
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

    # Create a safe filename for storage and replace spaces with underscores
    safe_filename = (
        filename.strip().replace(" ", "_")
        if filename and filename.strip()
        else clean_name.replace(" ", "_")
    )

    # Ensure PDF directory exists and write the PDF with the clean title
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = PDF_DIR / f"{safe_filename}.pdf"

    # Generate the PDF and set its title to the cleaned name
    await create_pdf_from_text(
        translated_text, pdf_path, title=clean_name, language_code=target_code
    )

    pdf_filename = pdf_path.name
    pdf_url = f"/api/files/pdf/{pdf_filename}"

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


@router.post("/realtime-pdf")
async def realtime_pdf(
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
