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

from ..config import CHUNK_DIR


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
    MAX_DURATION_SECONDS = 300  # 5 minutes, chunk longer files

    def __init__(self, model_name: str | None = None, allow_dev_fallback: bool = True) -> None:
        self.model_name = model_name or os.getenv("WHISPER_MODEL", "tiny")
        self.allow_dev_fallback = allow_dev_fallback

    async def transcribe_file(self, path: Path, language: str | None = None, progress_callback: callable = None) -> TranscriptResult:
        return await asyncio.to_thread(self._transcribe_file_sync, path, language, progress_callback)
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

    def _transcribe_file_sync(self, path: Path, language: str | None = None, progress_callback: callable = None) -> TranscriptResult:
        # Check duration, if long, convert to WAV and chunk
        duration = self._get_audio_duration(path)
        if duration > self.MAX_DURATION_SECONDS:
            return self._transcribe_long_audio(path, language, progress_callback)
        # Check duration, if long, convert to WAV and chunk
        duration = self._get_audio_duration(path)
        if duration > self.MAX_DURATION_SECONDS:
            return self._transcribe_long_audio(path, language)
        
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

    def _get_audio_duration(self, path: Path) -> float:
        try:
            import wave
            with wave.open(str(path), "rb") as wav_file:
                frames = wav_file.getnframes()
                frame_rate = wav_file.getframerate()
                if frame_rate <= 0:
                    return 0.0
                return frames / float(frame_rate)
        except:
            # For non-WAV files, use ffprobe
            try:
                result = subprocess.run(
                    ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
                    capture_output=True, text=True
                )
                import json
                data = json.loads(result.stdout)
                return float(data.get("format", {}).get("duration", 0))
            except:
                return 0.0

    def _transcribe_long_audio(self, path: Path, language: str | None, progress_callback: callable = None) -> TranscriptResult:
        # Convert to WAV if needed
        wav_path = self._convert_to_wav(path)
        if not wav_path:
            # Fallback to direct transcription
            return self._transcribe_file_sync(path, language)
        
        # Split into chunks
        chunks = self._split_audio_into_chunks(wav_path)
        if not chunks:
            return self._transcribe_file_sync(wav_path, language)
        
        # Transcribe chunks
        transcript_parts = []
        detected_language = None
        total_chunks = len(chunks)
        for i, chunk in enumerate(chunks):
            try:
                result = self._transcribe_file_sync(chunk, language)
                if result.text:
                    transcript_parts.append(result.text)
                if not detected_language and result.language:
                    detected_language = result.language
                if progress_callback:
                    progress = int(((i + 1) / total_chunks) * 40) + 5  # 5-45% for transcription
                    progress_callback(progress)
            except:
                continue
        
        # Cleanup
        self._cleanup_chunks(chunks)
        if wav_path != path:
            try:
                wav_path.unlink(missing_ok=True)
            except:
                pass
        
        merged_text = clean_text(" ".join(transcript_parts)).strip()
        return TranscriptResult(text=merged_text, language=detected_language)

    def _convert_to_wav(self, path: Path) -> Path | None:
        if path.suffix.lower() == ".wav":
            return path
        try:
            output_path = CHUNK_DIR / f"{uuid.uuid4().hex}.wav"
            CHUNK_DIR.mkdir(parents=True, exist_ok=True)
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", str(path), 
                    "-ac", "1", "-ar", "16000", "-f", "wav", str(output_path)
                ],
                check=True, capture_output=True
            )
            return output_path
        except:
            return None

    def _split_audio_into_chunks(self, wav_path: Path) -> list[Path]:
        chunks = []
        chunk_length_sec = 60  # 60 seconds chunks
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_wav(str(wav_path))
            duration_ms = len(audio)
            chunk_length_ms = chunk_length_sec * 1000
            
            for start_ms in range(0, duration_ms, chunk_length_ms):
                end_ms = min(start_ms + chunk_length_ms, duration_ms)
                chunk = audio[start_ms:end_ms]
                chunk_path = CHUNK_DIR / f"chunk-{uuid.uuid4().hex}.wav"
                chunk.export(str(chunk_path), format="wav")
                chunks.append(chunk_path)
        except ImportError:
            # Fallback to ffmpeg
            duration = self._get_audio_duration(wav_path)
            for start_sec in range(0, int(duration), chunk_length_sec):
                end_sec = min(start_sec + chunk_length_sec, duration)
                chunk_path = CHUNK_DIR / f"chunk-{uuid.uuid4().hex}.wav"
                subprocess.run(
                    [
                        "ffmpeg", "-y", "-i", str(wav_path),
                        "-ss", str(start_sec), "-t", str(end_sec - start_sec),
                        "-ac", "1", "-ar", "16000", str(chunk_path)
                    ],
                    check=True, capture_output=True
                )
                chunks.append(chunk_path)
        except:
            pass
        return chunks

    def _cleanup_chunks(self, chunks: list[Path]) -> None:
        for chunk in chunks:
            try:
                chunk.unlink(missing_ok=True)
            except:
                pass

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
