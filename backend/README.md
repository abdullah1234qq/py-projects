# Voice2PDF Backend

## Run the server

From the project root (`/home/afz/Desktop/code/voice2pdf`):

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

This ensures Python treats `backend` as a package and resolves absolute imports correctly.

## Notes

- Do not run `python backend/main.py` from the `backend` folder, because that may break package imports.
- The FastAPI app entrypoint is `backend.main:app`.
