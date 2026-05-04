from __future__ import annotations

import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile


SAFE_NAME_RE = re.compile(r"[^a-zA-Z0-9._-]+")


async def save_upload(
    file: UploadFile,
    directory: Path,
    max_bytes: int,
    suffixes: set[str] | None = None,
) -> Path:
    original = Path(file.filename or "upload").name
    suffix = Path(original).suffix.lower()
    if suffixes and suffix not in suffixes:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {suffix or 'unknown'}")

    safe_name = SAFE_NAME_RE.sub("-", Path(original).stem).strip("-") or "upload"
    destination = directory / f"{safe_name}-{uuid.uuid4().hex}{suffix}"
    destination.parent.mkdir(parents=True, exist_ok=True)

    written = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            written += len(chunk)
            if written > max_bytes:
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File is too large.")
            output.write(chunk)

    await file.close()
    return destination
