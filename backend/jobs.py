"""
Background job system for long-running audio processing tasks.
"""

import threading
import uuid
from pathlib import Path
from typing import Dict, Any, Optional

from backend.config import AUDIO_DIR, PDF_DIR, language_code
from backend.services.pdf import create_pdf_from_text
from backend.services.speech import SpeechService
from backend.services.storage import save_upload
from backend.services.translation import translate_text

# In-memory job storage (for production, use Redis/database)
jobs: Dict[str, Dict[str, Any]] = {}
jobs_lock = threading.Lock()

speech_service = SpeechService()


def create_job() -> str:
    """Create a new background job."""
    job_id = str(uuid.uuid4())
    with jobs_lock:
        jobs[job_id] = {
            "status": "processing",
            "progress": 0,
            "result": None,
            "error": None,
            "created_at": None,
            "updated_at": None
        }
    return job_id


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Get job status by ID."""
    with jobs_lock:
        return jobs.get(job_id)


def update_job(job_id: str, updates: Dict[str, Any]) -> None:
    """Update job with new data."""
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id].update(updates)


def process_audio_job(job_id: str, file_path: Path, language: str, filename: str) -> None:
    """Background processing for audio to PDF conversion."""
    try:
        update_job(job_id, {"status": "processing", "progress": 5})

        # Transcribe audio (this handles chunking automatically)
        def progress_callback(progress):
            update_job(job_id, {"progress": progress})

        transcript = speech_service.transcribe_file(file_path, language=language, progress_callback=progress_callback)
        original_text = transcript.text or "No speech was detected in the uploaded audio."

        update_job(job_id, {"progress": 60})

        # Translate if needed
        target_code = language_code(language)
        if target_code != "en":
            translated_text = translate_text(original_text, target_language=target_code)
        else:
            translated_text = original_text

        update_job(job_id, {"progress": 80})

        # Create PDF
        safe_stem = filename.replace("/", "_").replace("\\", "_")[:50] if filename else "audio-transcript"
        pdf_path = PDF_DIR / f"{safe_stem}-{job_id[:8]}.pdf"
        create_pdf_from_text(translated_text, pdf_path, title="Voice2PDF Transcript")

        update_job(job_id, {
            "status": "completed",
            "progress": 100,
            "result": str(pdf_path)
        })

    except Exception as e:
        update_job(job_id, {
            "status": "failed",
            "error": str(e),
            "progress": 0
        })


def start_audio_to_pdf_job(file_path: Path, language: str, filename: str) -> str:
    """Start a background audio to PDF conversion job."""
    job_id = create_job()

    # Start background thread
    thread = threading.Thread(
        target=process_audio_job,
        args=(job_id, file_path, language, filename),
        daemon=True
    )
    thread.start()

    return job_id