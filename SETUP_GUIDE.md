# Voice2PDF - Modern Full-Stack Application

A complete voice-to-text and text-to-speech conversion system with FastAPI backend, React web frontend, and React Native mobile app.

## Features

- **Audio → PDF**: Convert audio/video files to PDF documents with translation
- **PDF → Audio**: Convert PDF documents to speech in multiple languages
- **PDF → Multi-language Audio**: Generate audio files in all supported languages
- **Realtime Speech Translation**: Live audio transcription and translation

## Supported Languages

English, Urdu, Hindi, French, Spanish, German, Arabic

## Architecture

- **Backend**: Python FastAPI (no Gradio)
- **Frontend Web**: React with functional components and hooks
- **Mobile App**: React Native with Expo-compatible structure

## Project Structure

```
voice2pdf/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app entry point
│   ├── config.py           # Configuration and constants
│   ├── routes/
│   │   └── conversion.py   # API endpoints
│   ├── services/           # Business logic
│   ├── websocket/          # Real-time features
│   └── requirements.txt    # Python dependencies
├── Frontend/
│   ├── frontend-react/     # React web app
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── pages/      # Page components
│   │   │   ├── components/ # Reusable components
│   │   │   └── api/        # API client
│   │   └── package.json
│   └── mobile-react-native/ # React Native app
│       ├── src/
│       │   ├── screens/    # Screen components
│       │   ├── components/ # Reusable components
│       │   └── api.js      # API client
│       └── package.json
└── storage/                # Generated files
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify setup
python ../verify_setup.py

# Start the server
python -m uvicorn main:app --reload --port 7860
```

The backend will be available at `http://localhost:7860`

### 2. React Web Frontend

```bash
cd Frontend/frontend-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at `http://localhost:5173`

### 3. React Native Mobile App

```bash
cd Frontend/mobile-react-native

# Install dependencies
npm install

# For Android emulator
npm run android

# For iOS simulator
npm run ios
```

## API Endpoints

### POST /api/audio-to-pdf
Convert audio/video to PDF with optional translation.

**Parameters:**
- `file`: Audio/video file
- `language`: Target language (optional)
- `filename`: Output PDF filename (optional)
- `source_language`: Source language for transcription (optional)
- `target_language`: Target language for translation (optional)

**Response:**
```json
{
  "original_text": "Transcribed text",
  "translated_text": "Translated text",
  "pdf_url": "/api/files/pdf/filename.pdf"
}
```

### POST /api/pdf-to-audio
Convert PDF to audio in specified language.

**Parameters:**
- `file`: PDF file
- `language`: Target language

**Response:**
```json
{
  "original_text": "Extracted text",
  "translated_text": "Translated text",
  "audio_url": "/api/files/audio/filename.mp3"
}
```

### POST /api/pdf-to-all-audio
Convert PDF to audio files in all supported languages.

**Parameters:**
- `file`: PDF file

**Response:**
```json
{
  "original_text": "Extracted text",
  "zip_url": "/api/files/audio/all-languages.zip"
}
```

### POST /api/realtime
Process audio for real-time transcription and translation.

**Parameters:**
- `file`: Audio file
- `language`: Target language
- `source_language`: Source language (optional)

**Response:**
```json
{
  "original_text": "Transcribed text",
  "translated_text": "Translated text",
  "audio_url": "/api/files/audio/filename.mp3"
}
```

## WebSocket for Real-time Features

### WS /api/ws/audio
Real-time audio streaming and transcription.

## Environment Variables

### Backend
- `VOICE2PDF_API_URL`: API base URL (default: auto-detect)
- `WHISPER_MODEL`: Whisper model size (default: "tiny")
- `VOICE2PDF_DISABLE_NETWORK_TRANSLATION`: Disable translation (default: false)
- `VOICE2PDF_DISABLE_NETWORK_TTS`: Disable TTS (default: false)

### Frontend
- `VITE_API_URL`: Backend API URL (default: "http://localhost:7860")

## Development Notes

- All processing logic is in the FastAPI backend
- Frontend apps only handle UI and API calls
- Files are stored in the `storage/` directory
- Audio chunks are temporarily stored in `storage/audio/chunks/`
- Generated PDFs in `storage/pdf/`
- Generated audio in `storage/tts/`

## Building for Production

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 7860
```

### React Web
```bash
cd Frontend/frontend-react
npm run build
# Serve dist/ with any static server
```

### React Native
```bash
cd Frontend/mobile-react-native
npx react-native build-android  # or build-ios
```

## Troubleshooting

1. **Backend not starting**: Check Python version (3.8+) and dependencies
2. **Whisper issues**: The app has fallbacks for missing Whisper
3. **Audio conversion**: Ensure ffmpeg is installed system-wide
4. **Mobile app**: Ensure Android/iOS development environment is set up
5. **CORS issues**: Backend allows localhost origins by default

## License

This project is provided as-is for educational and development purposes.