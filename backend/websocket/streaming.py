from __future__ import annotations

import asyncio
import base64
import json
import time
import uuid

from fastapi import WebSocket

from backend.config import STREAM_FLUSH_SECONDS, STREAM_MIN_CHUNK_BYTES
from backend.services.speech import SpeechService


class RealtimeTranscriber:
    def __init__(self, websocket: WebSocket, speech_service: SpeechService | None = None) -> None:
        self.websocket = websocket
        self.speech_service = speech_service or SpeechService()
        self.session_id = uuid.uuid4().hex
        self.queue: asyncio.Queue[bytes | None] = asyncio.Queue()
        self.language: str | None = None
        self.mime_type = "audio/webm"
        self.sequence = 0
        self.closed = False

    async def run(self) -> None:
        await self.websocket.accept()
        await self._send({"type": "ready", "sessionId": self.session_id})

        worker = asyncio.create_task(self._process_queue())
        try:
            while True:
                message = await self.websocket.receive()
                if message.get("bytes") is not None:
                    await self.queue.put(message["bytes"])
                elif message.get("text") is not None:
                    should_continue = await self._handle_text_message(message["text"])
                    if not should_continue:
                        break
                elif message.get("type") == "websocket.disconnect":
                    break
        finally:
            await self.queue.put(None)
            await worker
            self.closed = True

    async def _handle_text_message(self, text: str) -> bool:
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            return True

        message_type = payload.get("type")
        if message_type == "config":
            self.language = payload.get("language") or self.language
            self.mime_type = payload.get("mimeType") or self.mime_type
            await self._send({"type": "configured", "language": self.language, "mimeType": self.mime_type})
            return True

        if message_type == "audio":
            self.language = payload.get("language") or self.language
            self.mime_type = payload.get("mimeType") or self.mime_type
            audio = payload.get("audio", "")
            if payload.get("encoding") == "base64":
                await self.queue.put(base64.b64decode(audio))
            return True

        if message_type == "stop":
            return False

        return True

    async def _process_queue(self) -> None:
        buffer = bytearray()
        last_flush = time.monotonic()

        while True:
            try:
                item = await asyncio.wait_for(self.queue.get(), timeout=STREAM_FLUSH_SECONDS)
            except asyncio.TimeoutError:
                item = b""

            if item is None:
                if buffer:
                    await self._flush(buffer, final=True)
                await self._send({"type": "complete", "sessionId": self.session_id})
                return

            if item:
                buffer.extend(item)

            should_flush = len(buffer) >= STREAM_MIN_CHUNK_BYTES
            should_flush = should_flush or (buffer and time.monotonic() - last_flush >= STREAM_FLUSH_SECONDS)
            if should_flush:
                await self._flush(buffer, final=False)
                buffer.clear()
                last_flush = time.monotonic()

    async def _flush(self, buffer: bytearray, final: bool) -> None:
        self.sequence += 1
        transcript = await self.speech_service.transcribe_bytes(
            bytes(buffer),
            mime_type=self.mime_type,
            language=self.language,
        )
        await self._send(
            {
                "type": "transcript",
                "sessionId": self.session_id,
                "sequence": self.sequence,
                "text": transcript.text,
                "language": transcript.language or self.language,
                "partial": not final,
                "final": final,
                "fallback": transcript.is_fallback,
            }
        )

    async def _send(self, payload: dict) -> None:
        if not self.closed:
            try:
                await self.websocket.send_json(payload)
            except RuntimeError:
                self.closed = True
