from fastapi import APIRouter, WebSocket

from backend.websocket.streaming import RealtimeTranscriber

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/audio")
async def stream_audio(websocket: WebSocket) -> None:
    transcriber = RealtimeTranscriber(websocket)
    await transcriber.run()
