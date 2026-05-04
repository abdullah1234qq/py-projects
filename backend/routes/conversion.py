from __future__ import annotations

import uuid
import re
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from backend.config import AUDIO_DIR, MAX_UPLOAD_BYTES, PDF_DIR, language_code
from backend.services.pdf import create_pdf_from_text, extract_pdf_text
from backend.services.speech import SpeechService
from backend.services.storage import save_upload
from backend.services.translation import translate_text
from backend.services.tts import synthesize_all_languages, synthesize_speech

router = APIRouter(tags=["conversion"])
speech_service = SpeechService()
SAFE_STEM_RE = re.compile(r"[^a-zA-Z0-9._-]+")


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1)
    target_language: str = Field(default="en", min_length=2)
    source_language: str = Field(default="auto")


class TextToPdfRequest(BaseModel):
    text: str = Field(min_length=1)
    title: str = Field(default="Voice2PDF Transcript")


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "voice2pdf"}


@router.post("/audio-to-pdf")
async def audio_to_pdf(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str | None, Form()] = "English",
    filename: Annotated[str | None, Form()] = None,
    source_language: Annotated[str | None, Form()] = None,
    target_language: Annotated[str | None, Form()] = None,
) -> FileResponse:
    audio_path = await save_upload(file, AUDIO_DIR, MAX_UPLOAD_BYTES)
    transcript = await speech_service.transcribe_file(audio_path, language=source_language)
    original_text = transcript.text or "No speech was detected in the uploaded audio."
    target_code = language_code(target_language or language)
    translated_text = await translate_text(original_text, target_language=target_code)

    safe_stem = SAFE_STEM_RE.sub("-", filename or "audio-transcript").strip("-") or "audio-transcript"
    pdf_path = PDF_DIR / f"{safe_stem}-{uuid.uuid4().hex}.pdf"
    await create_pdf_from_text(translated_text, pdf_path, title="Voice2PDF Transcript")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_path.name,
        headers={
            "X-Transcript-Preview": translated_text[:240],
            "X-Original-Transcript": original_text[:240],
        },
    )


@router.post("/pdf-to-audio")
async def pdf_to_audio(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str, Form()] = "English",
) -> FileResponse:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    text = await extract_pdf_text(pdf_path)
    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    target_code = language_code(language)
    translated_text = await translate_text(text, target_language=target_code)
    audio_path = await synthesize_speech(translated_text, language=target_code)
    return FileResponse(
        audio_path,
        media_type="audio/mpeg" if audio_path.suffix == ".mp3" else "audio/wav",
        filename=audio_path.name,
    )


@router.post("/pdf-to-all-audio")
async def pdf_to_all_audio(file: Annotated[UploadFile, File(...)]) -> FileResponse:
    pdf_path = await save_upload(file, PDF_DIR, MAX_UPLOAD_BYTES, suffixes={".pdf"})
    text = await extract_pdf_text(pdf_path)
    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in PDF.")

    zip_path = await synthesize_all_languages(text)
    return FileResponse(zip_path, media_type="application/zip", filename=zip_path.name)


@router.post("/translate")
async def translate(payload: TranslationRequest) -> dict[str, str]:
    translated = await translate_text(
        payload.text,
        target_language=payload.target_language,
        source_language=payload.source_language,
    )
    return {"text": translated}


@router.post("/text-to-pdf")
async def text_to_pdf(payload: TextToPdfRequest) -> FileResponse:
    pdf_path = PDF_DIR / f"live-transcript-{uuid.uuid4().hex}.pdf"
    await create_pdf_from_text(payload.text, pdf_path, title=payload.title)
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.name)


@router.get("/files/{kind}/{filename}")
async def download_file(kind: str, filename: str) -> FileResponse:
    roots = {"audio": AUDIO_DIR, "pdf": PDF_DIR}
    root = roots.get(kind)
    if root is None:
        raise HTTPException(status_code=404, detail="Unknown file type.")

    path = (root / filename).resolve()
    if root.resolve() not in path.parents and path != root.resolve():
        raise HTTPException(status_code=400, detail="Invalid file path.")
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found.")

    media_type = "application/pdf" if kind == "pdf" else "audio/mpeg"
    return FileResponse(path, media_type=media_type, filename=path.name)
