from __future__ import annotations

import asyncio
import os
import subprocess
import threading
import unicodedata
import uuid
import wave
from dataclasses import dataclass
from pathlib import Path

from backend.config import CHUNK_DIR


@dataclass(slots=True)
class TranscriptResult:
    text: str
    language: str | None = None
    is_fallback: bool = False


class SpeechService:
    """Whisper-backed speech recognition with a lightweight dev fallback."""

    _model = None
    _model_error: Exception | None = None
    _lock = threading.Lock()

    def __init__(self, model_name: str | None = None, allow_dev_fallback: bool = True) -> None:
        self.model_name = model_name or os.getenv("WHISPER_MODEL", "tiny")
        self.allow_dev_fallback = allow_dev_fallback

    async def transcribe_file(self, path: Path, language: str | None = None) -> TranscriptResult:
        return await asyncio.to_thread(self._transcribe_file_sync, path, language)

    async def transcribe_bytes(
        self,
        audio: bytes,
        mime_type: str = "audio/webm",
        language: str | None = None,
        session_dir: Path | None = None,
    ) -> TranscriptResult:
        return await asyncio.to_thread(self._transcribe_bytes_sync, audio, mime_type, language, session_dir)

    def _transcribe_bytes_sync(
        self,
        audio: bytes,
        mime_type: str,
        language: str | None,
        session_dir: Path | None,
    ) -> TranscriptResult:
        try:
            model = self._get_model()
            pcm = self._decode_audio_bytes(audio, mime_type)
            kwargs = {"fp16": False}
            if language:
                kwargs["language"] = language
            result = model.transcribe(pcm, **kwargs)
            return TranscriptResult(
                text=clean_text(result.get("text") or "").strip(),
                language=result.get("language"),
            )
        except Exception:
            return self._transcribe_unique_chunk_file(audio, mime_type, language, session_dir)

    def _transcribe_unique_chunk_file(
        self,
        audio: bytes,
        mime_type: str,
        language: str | None,
        session_dir: Path | None,
    ) -> TranscriptResult:
        directory = session_dir or CHUNK_DIR
        directory.mkdir(parents=True, exist_ok=True)
        suffix = self._suffix_for_mime(mime_type)
        chunk_path = directory / f"chunk-{uuid.uuid4().hex}{suffix}"
        if suffix == ".wav" and not audio.startswith(b"RIFF"):
            self._write_pcm_as_wav(chunk_path, audio)
        else:
            chunk_path.write_bytes(audio)
        return self._transcribe_file_sync(chunk_path, language=language)

    def _transcribe_file_sync(self, path: Path, language: str | None = None) -> TranscriptResult:
        try:
            model = self._get_model()
            kwargs = {"fp16": False}
            if language:
                kwargs["language"] = language
            result = model.transcribe(str(path), **kwargs)
            return TranscriptResult(
                text=clean_text(result.get("text") or "").strip(),
                language=result.get("language"),
            )
        except Exception as exc:
            if not self.allow_dev_fallback:
                raise
            size = path.stat().st_size if path.exists() else 0
            return TranscriptResult(
                text=f"Audio received ({size} bytes). Whisper runtime is not installed.",
                is_fallback=True,
            )

    def _decode_audio_bytes(self, audio: bytes, mime_type: str):
        import numpy as np

        if "l16" in mime_type.lower() or "pcm" in mime_type.lower():
            return np.frombuffer(audio, np.int16).astype(np.float32) / 32768.0

        process = subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-i",
                "pipe:0",
                "-f",
                "f32le",
                "-ac",
                "1",
                "-ar",
                "16000",
                "pipe:1",
            ],
            input=audio,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
        return np.frombuffer(process.stdout, np.float32)

    def _write_pcm_as_wav(self, path: Path, audio: bytes) -> None:
        with wave.open(str(path), "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(16_000)
            wav_file.writeframes(audio)

    def _get_model(self):
        with self._lock:
            if self.__class__._model is not None:
                return self.__class__._model
            if self.__class__._model_error is not None:
                raise self.__class__._model_error
            try:
                import whisper

                self.__class__._model = whisper.load_model(self.model_name)
                return self.__class__._model
            except Exception as exc:
                self.__class__._model_error = exc
                raise

    def _suffix_for_mime(self, mime_type: str) -> str:
        normalized = mime_type.lower()
        suffixes = {
            "audio/wav": ".wav",
            "audio/x-wav": ".wav",
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/mp4": ".m4a",
            "audio/aac": ".aac",
            "audio/webm": ".webm",
            "audio/ogg": ".ogg",
        }
        for key, suffix in suffixes.items():
            if key in normalized:
                return suffix
        if "l16" in normalized or "pcm" in normalized:
            return ".wav"
        return ".webm"


def clean_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text)
    return "".join(ch for ch in normalized if unicodedata.category(ch)[0] != "C")
