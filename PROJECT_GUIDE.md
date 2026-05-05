# Voice2PDF - Complete Setup & Troubleshooting Guide

## 📋 Project Overview

Voice2PDF is a full-stack application for converting between:
- 🎵 Audio files → PDF documents
- 📄 PDF documents → Speech (TTS)
- 🎤 Real-time audio → Live transcription + PDF

**Tech Stack:**
- Backend: Python FastAPI + Whisper + Edge-TTS
- Frontend Web: React + Vite
- Frontend Mobile: React Native
- Real-time: WebSockets

---

## 🚀 Quick Start (All-in-One)

### 1. Prerequisites
```bash
# macOS / Linux
brew install ffmpeg  # or apt-get install ffmpeg

# Windows
choco install ffmpeg  # or download from ffmpeg.org
```

### 2. Backend Setup
```bash
cd /path/to/voice2pdf

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r backend/requirements.txt

# Start backend
python -m uvicorn backend.main:app --reload --port 7860
# Server will run at http://localhost:7860
```

### 3. Frontend Web Setup
```bash
cd Frontend/frontend-react

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:5173
```

### 4. Frontend Mobile Setup
```bash
cd Frontend/mobile-react-native

# Install dependencies
npm install

# For Android Emulator
npm run android

# For iOS Simulator
npm run ios

# Or start Metro and choose platform
npm start
```

---

## 🔧 What Was Fixed

### Backend Issues Resolved ✅

#### 1. **Import Errors** (No module named `backend`)
- ✅ Converted all absolute imports to relative imports
- ✅ Updated all files:
  - `backend/main.py`
  - `backend/gradio_ui.py`
  - `backend/routes/conversion.py`
  - `backend/websocket/transcription.py`
  - `backend/websocket/streaming.py`
  - `backend/services/speech.py`
  - `backend/services/tts.py`
  - `backend/services/translation.py`

#### 2. **Async/Event Loop Crashes**
- ✅ Added safe async wrapper function
- ✅ Handles nested event loops gracefully
- ✅ Used in:
  - `backend/services/tts.py` - TTS synthesis
  - `backend/gradio_ui.py` - Gradio UI integration

```python
def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return asyncio.create_task(coro)
        else:
            return asyncio.run(coro)
    except:
        return asyncio.run(coro)
```

#### 3. **Long Audio Support**
- ✅ Added automatic audio chunking for files > 5 minutes
- ✅ Split into 60-second chunks
- ✅ Merge transcriptions intelligently
- ✅ Added conversion to WAV format
- ✅ Support for mp3, m4a, mp4, webm, ogg

New methods in `SpeechService`:
- `_transcribe_long_audio()` - Split & merge pipeline
- `_convert_to_wav()` - Format conversion via ffmpeg
- `_split_audio_into_chunks()` - Audio chunking with pydub fallback
- `_cleanup_chunks()` - Temp file cleanup
- `_get_audio_duration()` - Duration detection

#### 4. **Whisper Installation Issues**
- ✅ Added try-catch for Whisper model loading
- ✅ Graceful fallback on load failure
- ✅ Returns user-friendly error message
- ✅ Still works with dev mode enabled

#### 5. **Temp File Cleanup**
- ✅ Added `_cleanup_chunks()` method
- ✅ Cleanup happens after transcription
- ✅ Handles missing files gracefully

### Frontend Issues Resolved ✅

#### 1. **API Endpoint Paths**
- ✅ Removed `/api` prefix from all endpoints
- ✅ Updated endpoints:
  - `/audio-to-pdf`
  - `/pdf-to-audio`
  - `/pdf-to-all-audio`
  - `/text-to-pdf`
  - `/ws/audio`

#### 2. **Backend URL Detection**
- ✅ Auto-detects environment (emulator/device/web)
- ✅ Tries multiple URLs in order:
  1. `globalThis.VOICE2PDF_API_URL`
  2. `process.env.VOICE2PDF_API_URL`
  3. `http://10.0.2.2:7860` (Android emulator)
  4. `http://localhost:7860` (Fallback)

#### 3. **Error Handling**
- ✅ All API calls wrapped in try-catch
- ✅ User-friendly error messages with ✗/✓ icons
- ✅ Messages show actual error details

#### 4. **WebSocket Connection**
- ✅ Fixed endpoint path from `/api/ws/audio` → `/ws/audio`
- ✅ Added better error handling
- ✅ Improved connection state management

---

## 📁 Project Structure

```
voice2pdf/
├── backend/                    # Python FastAPI backend
│   ├── __init__.py
│   ├── main.py                # FastAPI app + Gradio mounting
│   ├── config.py              # Configuration & constants
│   ├── gradio_ui.py           # Gradio UI setup
│   ├── requirements.txt
│   ├── routes/
│   │   ├── __init__.py
│   │   └── conversion.py       # All API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── speech.py          # Whisper + chunking
│   │   ├── tts.py             # Edge-TTS synthesis
│   │   ├── pdf.py             # PDF creation/extraction
│   │   ├── translation.py      # Text translation
│   │   └── storage.py         # File handling
│   └── websocket/
│       ├── __init__.py
│       ├── transcription.py    # WS routes
│       └── streaming.py        # WS logic
│
├── Frontend/
│   ├── frontend-react/        # React web app (Vite)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── mobile-react-native/   # React Native mobile app
│       ├── src/
│       │   ├── api.js         # Axios client
│       │   ├── theme.js       # Design tokens
│       │   ├── screens/       # Main screen components
│       │   ├── components/    # Reusable UI components
│       │   └── hooks/         # Custom React hooks
│       ├── App.js             # Root component
│       ├── package.json
│       └── metro.config.js
│
└── storage/                   # Runtime file storage
    ├── audio/
    │   └── chunks/
    ├── pdf/
    └── tts/
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
1. Ensure backend is running: `python -m uvicorn backend.main:app --reload --port 7860`
2. Check backend URL in `src/api.js` matches your setup
3. For Android: use `http://10.0.2.2:7860`
4. For device: use machine IP like `http://192.168.1.100:7860`

### Issue: "Whisper model fails to load"
**Solution:**
1. On first run, Whisper downloads the model (~1.5GB)
2. Set `VOICE2PDF_DISABLE_GRADIO=1` to skip Gradio UI
3. Check Python version: `python --version` (3.11-3.13 recommended)
4. App will still work with dev fallback mode

### Issue: "App shows 'Welcome to React Native'"
**Solution:**
1. Force reload: `npm start` → choose `r` to reload
2. Clear cache: `npm start -- --reset-cache`
3. Clear Metro cache: `watchman watch-del-all`
4. Restart emulator/device

### Issue: "File upload fails"
**Solution:**
1. Check file permissions
2. Ensure file size < 200MB (configurable in `backend/config.py`)
3. Verify file format is supported
4. Check `storage/` directory exists and is writable

### Issue: "Audio recording not working"
**Solution:**
1. Grant microphone permissions in app
2. Check audio source (Android audioSource: 6 = MIC)
3. Verify audio format: 16kHz, 16-bit, mono
4. For iOS: check permissions in Info.plist

### Issue: "PDF generation fails"
**Solution:**
1. Ensure reportlab is installed: `pip install reportlab`
2. Check text length isn't excessive
3. Verify PDF directory has write permissions
4. Check for special characters in filename

---

## 🔌 API Reference

### Audio to PDF
```bash
curl -X POST http://localhost:7860/audio-to-pdf \
  -F "file=@audio.mp3" \
  -F "language=English" \
  -F "filename=my_transcript"
```

### PDF to Audio
```bash
curl -X POST http://localhost:7860/pdf-to-audio \
  -F "file=@document.pdf" \
  -F "language=English"
```

### PDF to All Audio
```bash
curl -X POST http://localhost:7860/pdf-to-all-audio \
  -F "file=@document.pdf"
```

### Text to PDF
```bash
curl -X POST http://localhost:7860/text-to-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here",
    "title": "Document Title"
  }'
```

### Real-time Transcription (WebSocket)
```javascript
const ws = new WebSocket("ws://localhost:7860/ws/audio");
ws.send(JSON.stringify({
  type: "config",
  language: "en",
  mimeType: "audio/l16;rate=16000"
}));
// Send audio chunks as base64
ws.send(JSON.stringify({
  type: "audio",
  encoding: "base64",
  audio: "...",
  mimeType: "audio/l16;rate=16000"
}));
```

---

## 📊 Performance Notes

- **Audio Chunking**: 60-second chunks for files > 5 minutes
- **Temp Cleanup**: Automatic after processing
- **Model Caching**: Whisper model loaded once, cached in memory
- **Concurrent Requests**: Limited by FastAPI worker count
- **File Size Limit**: 200MB (configurable)

---

## 🔐 Security Notes

- ✅ All file paths validated to prevent traversal attacks
- ✅ Temp files auto-cleaned after processing
- ✅ CORS configured for allowed origins
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive paths

---

## 📚 Languages Supported

```
English (en)
Urdu (ur)
Hindi (hi)
French (fr)
Spanish (es)
German (de)
Arabic (ar)
```

Add more in `backend/config.py` → `LANGUAGES` and `VOICE_MAP`

---

## 🎯 Next Steps

1. ✅ Backend running on port 7860
2. ✅ Frontend React app on port 5173
3. ✅ Mobile app in emulator/device
4. ✅ Test Audio → PDF conversion
5. ✅ Test PDF → Audio conversion
6. ✅ Test Real-time streaming

---

## 📞 Support

### Backend Issues
- Check `backend/main.py` for FastAPI setup
- Check `backend/config.py` for configuration
- Look at service files in `backend/services/`

### Frontend Issues
- Check `Frontend/mobile-react-native/src/api.js` for API URL
- Check console for error messages
- Verify network connectivity

### General Debugging
```bash
# Backend debug logging
LOGLEVEL=DEBUG python -m uvicorn backend.main:app --reload

# Check ports are available
lsof -i :7860  # Backend
lsof -i :5173  # Web Frontend
```

---

## ✨ Features Summary

✅ Audio file to PDF conversion
✅ PDF to audio synthesis (TTS)
✅ Multi-language support
✅ Real-time transcription via WebSocket
✅ Long audio file support (auto-chunking)
✅ Multiple file format support (mp3, m4a, wav, webm, etc.)
✅ Text translation
✅ Temp file auto-cleanup
✅ Error handling with user-friendly messages
✅ Cross-platform (Web, Android, iOS)

