from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
STORAGE_DIR = PROJECT_ROOT / "storage"
PDF_DIR = STORAGE_DIR / "pdf"
AUDIO_DIR = STORAGE_DIR / "audio"
TTS_DIR = STORAGE_DIR / "tts"
CHUNK_DIR = AUDIO_DIR / "chunks"
FONTS_DIR = PROJECT_ROOT / "fonts"

LANGUAGES = {
    "English": "en",
    "Urdu": "ur",
    "Hindi": "hi",
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Arabic": "ar",
}

VOICE_MAP = {
    "ur": "ur-PK-AsadNeural",
    "en": "en-US-AriaNeural",
    "hi": "hi-IN-SwaraNeural",
    "ar": "ar-SA-HamedNeural",
    "fr": "fr-FR-DeniseNeural",
    "es": "es-ES-ElviraNeural",
    "de": "de-DE-KatjaNeural",
}

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

MAX_UPLOAD_BYTES = 200 * 1024 * 1024
STREAM_FLUSH_SECONDS = 2.0
STREAM_MIN_CHUNK_BYTES = 64 * 1024
TRANSLATION_TIMEOUT_SECONDS = 8
TTS_TIMEOUT_SECONDS = 12


def ensure_storage_dirs() -> None:
    for directory in (AUDIO_DIR, PDF_DIR, TTS_DIR, CHUNK_DIR, FONTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def language_code(language: str | None, default: str = "en") -> str:
    if not language:
        return default
    return LANGUAGES.get(language, language).lower()
