from __future__ import annotations

import asyncio
import os

from backend.config import TRANSLATION_TIMEOUT_SECONDS, language_code


async def translate_text(
    text: str,
    target_language: str = "en",
    source_language: str = "auto",
) -> str:
    target_language = language_code(target_language)
    if not text.strip() or target_language in {"", "auto"}:
        return text
    if os.getenv("VOICE2PDF_DISABLE_NETWORK_TRANSLATION") == "1":
        return text
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_translate_sync, text, target_language, source_language),
            timeout=TRANSLATION_TIMEOUT_SECONDS,
        )
    except Exception:
        return text


def translate(text: str, lang: str) -> str:
    if not text.strip():
        return text
    return _translate_sync(text, language_code(lang), "auto")


def _translate_sync(text: str, target_language: str, source_language: str) -> str:
    try:
        from deep_translator import GoogleTranslator

        return GoogleTranslator(source=source_language, target=target_language).translate(text)
    except Exception:
        return text
