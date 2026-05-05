# 🚀 Voice2PDF - Quick Start (5 Minutes)

## Step 1: Backend Setup (2 min)

```bash
cd /path/to/voice2pdf

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Verify setup
python verify_setup.py

# Start backend (will run on http://localhost:7860)
python -m uvicorn backend.main:app --reload --port 7860
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:7860
INFO:     Application startup complete
```

Open http://localhost:7860 in browser to see Gradio UI.

---

## Step 2: Frontend Web (1 min)

**In a new terminal:**

```bash
cd Frontend/frontend-react

npm install
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in browser.

---

## Step 3: Mobile App (1 min)

**In another new terminal:**

```bash
cd Frontend/mobile-react-native

npm install
npm run android  # or: npm run ios
```

---

## Step 4: Test the App! (1 min)

### Web App:
1. Upload an audio file
2. Select language
3. Click "Convert"
4. Download PDF with transcript

### Mobile App:
1. Open in emulator/device
2. Tap 🎵 Audio→PDF tab
3. Pick audio file
4. Select language
5. Tap "Convert to PDF"

---

## 🎯 What's Included

✅ **All 8 critical issues fixed:**
- Import errors resolved
- Whisper compatibility handled
- Long audio auto-chunking
- MP4 format support
- Async crash prevention
- Temp file cleanup
- Gradio stability
- React Native properly connected

✅ **Full-Featured:**
- Audio → PDF
- PDF → Audio (TTS)
- Real-time transcription
- Multi-language (7 languages)
- Multiple file formats
- Error handling
- Loading states

---

## 📱 First Time Setup Checklist

```bash
# Prerequisites
[ ] Python 3.11+ installed
[ ] Node.js 18+ installed
[ ] ffmpeg installed (brew install ffmpeg)

# Backend
[ ] Virtual environment created
[ ] Dependencies installed
[ ] Verification script passed (python verify_setup.py)
[ ] Backend running on :7860

# Frontend Web
[ ] npm install completed
[ ] Vite dev server running on :5173

# Frontend Mobile
[ ] npm install completed
[ ] Android emulator OR iOS simulator ready
[ ] Metro running

# Test
[ ] Backend health check: http://localhost:7860/health
[ ] Web app loads: http://localhost:5173
[ ] Mobile app appears in emulator
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r backend/requirements.txt

# Run verification
python verify_setup.py

# Start with debug logging
LOGLEVEL=DEBUG python -m uvicorn backend.main:app --reload
```

### Can't upload files
```bash
# Check storage directory
ls -la storage/

# Ensure directory is writable
mkdir -p storage/{audio,pdf,tts}
chmod 755 storage/

# Restart backend
```

### Mobile app can't connect
```bash
# For Android emulator
# Use: http://10.0.2.2:7860

# For physical device
# Use your machine IP: http://192.168.x.x:7860

# For iOS simulator
# Use: http://localhost:7860
```

### Whisper model downloading
First run will download ~1.5GB model (~2 min).
Watch the console for progress.

---

## 📊 File Structure Quick Reference

```
voice2pdf/
├── backend/                  # Python FastAPI
│   ├── main.py              # Start here
│   ├── config.py            # Configuration
│   └── services/            # Core logic
├── Frontend/
│   ├── frontend-react/      # Web app (Vite)
│   └── mobile-react-native/ # Mobile app
├── storage/                 # Runtime files
├── verify_setup.py          # Run this to verify
├── PROJECT_GUIDE.md         # Full documentation
└── FIXES_SUMMARY.md         # What was fixed
```

---

## 🎨 Features to Try

### Web App
- **Audio Upload**: Upload mp3, wav, m4a, webm
- **Language Selection**: English, Urdu, Hindi, French, Spanish, German, Arabic
- **PDF Download**: Get transcript as PDF
- **PDF Upload**: Convert PDF to audio in any language
- **All Languages ZIP**: Generate audio in all languages at once

### Mobile App
- **Real-time Recording**: Click record button, speak, get live transcription
- **Save PDF**: Transcription auto-saves as PDF
- **Same features as web**: Audio→PDF, PDF→Audio
- **Offline-ready**: Uses local storage

### Backend API (http://localhost:7860/docs)
- Interactive API documentation
- Try endpoints directly
- See request/response examples

---

## ⚡ Performance Tips

- **First run**: Whisper model downloads ~1.5GB (~2-5 min on first load)
- **After first run**: Model cached in memory, future runs are instant
- **Long files**: Files > 5 minutes auto-chunk (no manual action needed)
- **Memory usage**: Depends on audio length, typically < 500MB

---

## 🔐 Security Notes

✅ All file paths validated (no traversal attacks)
✅ Temp files auto-deleted
✅ CORS configured for allowed origins
✅ Input validation on all endpoints
✅ Safe error messages (no sensitive info)

---

## 📚 Next Steps

1. ✅ Get backend running
2. ✅ Get frontend running
3. ✅ Test audio → PDF conversion
4. ✅ Test PDF → audio conversion
5. ✅ Try real-time transcription
6. ✅ Read `PROJECT_GUIDE.md` for advanced options

---

## 💡 Pro Tips

```bash
# Watch backend logs in detail
LOGLEVEL=DEBUG python -m uvicorn backend.main:app --reload

# Disable Gradio UI (faster startup)
VOICE2PDF_DISABLE_GRADIO=1 python -m uvicorn backend.main:app --port 7860

# Use production server (gunicorn)
pip install gunicorn
gunicorn -w 4 backend.main:app --bind 0.0.0.0:7860

# Set custom backend URL for mobile
export VOICE2PDF_API_URL=http://192.168.1.100:7860

# Run verification script
python verify_setup.py
```

---

## 🎓 Project Structure Explained

**Backend (Python):**
- `main.py` - FastAPI app, routes setup
- `config.py` - Configuration constants
- `services/` - Business logic
  - `speech.py` - Whisper integration + chunking
  - `tts.py` - Edge-TTS synthesis
  - `pdf.py` - PDF creation
  - `translation.py` - Text translation
  - `storage.py` - File handling

**Frontend Web (React):**
- Main component-based architecture
- Vite build tooling
- Responsive design

**Frontend Mobile (React Native):**
- Tab-based navigation
- Same functionality as web
- Native file picker
- Native audio recording

---

## ✅ Verification Checklist

After following this guide:

- [ ] Backend starts without errors
- [ ] Web frontend loads on :5173
- [ ] Mobile app opens in emulator
- [ ] Can upload audio file
- [ ] Can get PDF transcript
- [ ] Can upload PDF
- [ ] Can generate audio
- [ ] Real-time recording works

---

## 🚀 Ready to Deploy?

See `PROJECT_GUIDE.md` for:
- Production setup
- Environment configuration
- Advanced deployment options
- Performance optimization

---

## ❓ Questions?

Check these files in order:
1. `PROJECT_GUIDE.md` - Complete documentation
2. `FIXES_SUMMARY.md` - All fixes explained
3. `verify_setup.py` - Run verification script
4. Backend logs - Check for specific errors

---

**Let's go! Start the backend now:** 🚀

```bash
python -m uvicorn backend.main:app --reload --port 7860
```

