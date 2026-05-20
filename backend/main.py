import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import AUDIO_DIR, PDF_DIR, TTS_DIR, ensure_storage_dirs
from backend.routes.conversion import router as conversion_router
from backend.websocket.transcription import router as websocket_router

# Ensure every storage directory exists before mounting them as static roots.
ensure_storage_dirs()

app = FastAPI(
    title="Voice2PDF API",
    version="1.0.0",
    description="Audio/PDF conversion and real-time transcription backend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Transcript-Preview"],
)

# -- API routers (with and without /api prefix for compatibility) ---------------
app.include_router(conversion_router)
app.include_router(conversion_router, prefix="/api")
app.include_router(websocket_router)
app.include_router(websocket_router, prefix="/api")

# -- Static file mounts --------------------------------------------------------
#
# /api/files/pdf     -> storage/pdf/   (generated PDF documents)
# /api/files/audio   -> storage/tts/   (TTS-generated MP3s and ZIP archives)
# /api/files/uploads -> storage/audio/ (uploaded raw audio: realtime webm etc.)
#
# IMPORTANT: _build_file_url("audio", path) returns /api/files/audio/<name>.
# TTS saves files to TTS_DIR (storage/tts/), so that is what we mount here.
#
app.mount("/api/files/pdf",     StaticFiles(directory=str(PDF_DIR)),   name="pdf")
app.mount("/api/files/audio",   StaticFiles(directory=str(TTS_DIR)),   name="audio")
app.mount("/api/files/uploads", StaticFiles(directory=str(AUDIO_DIR)), name="uploads")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Backend working"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
