from __future__ import annotations

import asyncio
import math
import os
import uuid
import wave
import zipfile
from pathlib import Path

from backend.config import TTS_DIR, TTS_TIMEOUT_SECONDS, VOICE_MAP, language_code


async def synthesize_speech(text: str, language: str = "en") -> Path:
    return await _synthesize_speech_async(text, language)


async def synthesize_all_languages(text: str) -> Path:
    return await _synthesize_all_languages_async(text)


def text_to_audio(text: str, lang: str) -> str | None:
    if not text.strip():
        return None
    return str(asyncio.run(synthesize_speech(text, lang)))


def text_to_all_audio(text: str) -> str | None:
    if not text.strip():
        return None
    return str(asyncio.run(synthesize_all_languages(text)))


async def _synthesize_speech_async(text: str, language: str) -> Path:
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    language = language_code(language)
    path = TTS_DIR / f"pdf-audio-{language}-{uuid.uuid4().hex}.mp3"
    voice = VOICE_MAP.get(language, VOICE_MAP["en"])
    if os.getenv("VOICE2PDF_DISABLE_NETWORK_TTS") == "1":
        return await asyncio.to_thread(_write_fallback_audio, text, language)
    try:
        import edge_tts

        tts = edge_tts.Communicate(text, voice)
        await asyncio.wait_for(tts.save(str(path)), timeout=TTS_TIMEOUT_SECONDS)
        return path
    except Exception:
        return await asyncio.to_thread(_synthesize_speech_sync, text, language)


async def _synthesize_all_languages_async(text: str) -> Path:
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    output_dir = TTS_DIR / f"all-audio-{uuid.uuid4().hex}"
    output_dir.mkdir(parents=True, exist_ok=True)
    if os.getenv("VOICE2PDF_DISABLE_NETWORK_TTS") == "1":
        for lang in VOICE_MAP:
            fallback = await asyncio.to_thread(_write_fallback_audio, text[:2000], lang)
            fallback.replace(output_dir / f"{lang}{fallback.suffix}")
        return _zip_audio_dir(output_dir)
    try:
        import edge_tts

        for lang, voice in VOICE_MAP.items():
            path = output_dir / f"{lang}.mp3"
            try:
                tts = edge_tts.Communicate(text[:2000], voice)
                await asyncio.wait_for(tts.save(str(path)), timeout=TTS_TIMEOUT_SECONDS)
                await asyncio.sleep(0.3)
            except Exception:
                fallback = await asyncio.to_thread(_synthesize_speech_sync, text[:2000], lang)
                fallback.replace(output_dir / f"{lang}{fallback.suffix}")
    except Exception:
        for lang in VOICE_MAP:
            fallback = await asyncio.to_thread(_synthesize_speech_sync, text[:2000], lang)
            fallback.replace(output_dir / f"{lang}{fallback.suffix}")

    return _zip_audio_dir(output_dir)


def _write_fallback_audio(text: str, language: str) -> Path:
    language = language_code(language)
    wav_path = TTS_DIR / f"pdf-audio-{language}-{uuid.uuid4().hex}.wav"
    _write_fallback_wav(wav_path, seconds=max(1.2, min(8.0, len(text) / 90)))
    return wav_path


def _zip_audio_dir(output_dir: Path) -> Path:
    zip_path = TTS_DIR / f"all-audio-{uuid.uuid4().hex}.zip"
    with zipfile.ZipFile(zip_path, "w") as zip_file:
        for audio_file in output_dir.iterdir():
            zip_file.write(audio_file, audio_file.name)
    return zip_path


def _synthesize_speech_sync(text: str, language: str) -> Path:
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    language = language_code(language)
    mp3_path = TTS_DIR / f"pdf-audio-{language}-{uuid.uuid4().hex}.mp3"
    try:
        from gtts import gTTS

        gTTS(text=text, lang=language or "en").save(str(mp3_path))
        return mp3_path
    except Exception:
        wav_path = TTS_DIR / f"pdf-audio-{uuid.uuid4().hex}.wav"
        _write_fallback_wav(wav_path, seconds=max(1.2, min(8.0, len(text) / 90)))
        return wav_path


def _write_fallback_wav(path: Path, seconds: float) -> None:
    sample_rate = 16_000
    frames = int(sample_rate * seconds)
    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(sample_rate)
        for index in range(frames):
            envelope = max(0.08, 1 - index / frames)
            sample = int(12000 * envelope * math.sin(2 * math.pi * 440 * index / sample_rate))
            audio.writeframesraw(sample.to_bytes(2, byteorder="little", signed=True))
