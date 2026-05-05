import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS, ensure_storage_dirs
from .routes.conversion import router as conversion_router
from .websocket.transcription import router as websocket_router


ensure_storage_dirs()

app = FastAPI(
    title="Voice2PDF API",
    version="1.0.0",
    description="Audio/PDF conversion and real-time transcription backend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Transcript-Preview"],
)

app.include_router(conversion_router)
app.include_router(conversion_router, prefix="/api")
app.include_router(websocket_router)
app.include_router(websocket_router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "Voice2PDF API", "status": "ready"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=7860, reload=True)
