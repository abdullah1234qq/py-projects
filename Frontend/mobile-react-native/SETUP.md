# Voice2PDF Mobile App - Setup Guide

## ✅ Project Structure

The React Native app is fully configured with:

- **Tab Navigation**: 4 main screens with emoji icons
  - 🏠 Home: Dashboard with action cards
  - 🎵 Audio→PDF: Convert audio files to PDF
  - 📄 PDF→Audio: Convert PDFs to speech
  - 🎤 Stream: Real-time audio transcription

- **Components**: Custom UI components with neon styling
  - GlowButton: Glowing action buttons
  - NeonCard: Bordered cards with shadow
  - NeonMark: Icon indicator
  - AudioBars: Visual audio indicator
  - ScreenHeader: Screen titles and descriptions
  - TranscriptCard: Text display card

- **Hooks**: Custom React hooks
  - `useRealtimeStream`: WebSocket audio streaming
  - `useStoredName`: Persisted user name
  - `useDeviceType`: Responsive layout detection

- **API Client**: Axios-based API integration
  - Auto-detects backend URL
  - FormData for file uploads
  - Error handling with user-friendly messages

## 🚀 Installation & Running

### Prerequisites
- Node.js 18+
- React Native CLI
- Android SDK (for Android)
- Xcode (for iOS)

### Install Dependencies
```bash
cd Frontend/mobile-react-native
npm install
```

### Run on Android
```bash
npm run android
# or
npx react-native run-android
```

### Run on iOS
```bash
npm run ios
# or
npx react-native run-ios
```

### Start Metro Bundler (if not auto-started)
```bash
npm start
```

## 🔌 Backend Configuration

The app automatically detects the backend API URL in this order:
1. `globalThis.VOICE2PDF_API_URL` (runtime override)
2. `process.env.VOICE2PDF_API_URL` (environment variable)
3. `http://10.0.2.2:7860` (Android emulator)
4. `http://localhost:7860` (Fallback)

### For Development

**Android Emulator:**
- Uses `http://10.0.2.2:7860` (maps to host localhost)
- Backend must be running on port 7860

**Physical Device:**
- Set `VOICE2PDF_API_URL` environment variable or modify `src/api.js`
- Use your machine's local IP instead of localhost
  ```javascript
  // Example: http://192.168.1.100:7860
  ```

**iOS Simulator:**
- Can use `http://localhost:7860` directly
- Ensure backend is running on same machine

## 📱 Screens Overview

### 1. Home (Dashboard)
- Welcome message with user's name
- Name input field
- Three action cards leading to main features
- Emoji icons for visual appeal

### 2. Audio to PDF
- File picker for audio files (mp3, wav, m4a, etc.)
- Language selector
- Output filename input
- Convert button with loading state
- Success/error message display

### 3. PDF to Audio
- File picker for PDF documents
- Language selector
- Generate Audio button
- All Languages button (generates ZIP with all languages)
- Audio player component
- Success/error message display

### 4. Stream Audio to PDF
- Start/Pause button for recording
- Real-time transcription display
- Recording time indicator
- Live indicator dot
- Audio visualization bars
- Save PDF button
- WebSocket connection to backend

## 🔌 API Endpoints

All endpoints are relative to `BASE_URL`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/audio-to-pdf` | POST | Convert audio file to PDF |
| `/pdf-to-audio` | POST | Convert PDF to audio (single language) |
| `/pdf-to-all-audio` | POST | Convert PDF to audio (all languages) |
| `/text-to-pdf` | POST | Convert text to PDF |
| `/ws/audio` | WebSocket | Real-time audio transcription |

### Request Fields

**Audio/PDF Conversions:**
- `file`: FormData file
- `language`: Language code (e.g., "en", "ur", "hi")
- `filename`: Optional output filename

**Text to PDF:**
- `text`: Text content
- `title`: PDF title

## 📦 Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^2.1.0",
  "@react-navigation/bottom-tabs": "^7.15.11",
  "@react-navigation/native": "^7.2.2",
  "axios": "^1.16.0",
  "react-native-audio-record": "^0.2.2",
  "react-native-document-picker": "^9.3.1",
  "react-native-fs": "^2.20.0",
  "react-native-gesture-handler": "^2.31.2"
}
```

## ✨ Features

✅ Tab-based navigation
✅ File upload with document picker
✅ Language selection support
✅ Real-time audio streaming via WebSocket
✅ Loading states for async operations
✅ Error handling with user-friendly messages
✅ Persistent user name storage
✅ Responsive design (mobile & desktop)
✅ Dark theme UI with neon accents
✅ Emoji icons for better UX

## 🐛 Troubleshooting

### App not connecting to backend
1. Ensure backend is running on port 7860
2. Check `BASE_URL` in `src/api.js`
3. For emulator: use `http://10.0.2.2:7860`
4. For device: use machine's local IP address

### WebSocket connection errors
1. Check that `/ws/audio` endpoint is available
2. Verify backend websocket is configured
3. Check audio permissions are granted

### File picker not working
1. Ensure storage permissions are granted
2. Check `react-native-document-picker` is properly linked
3. Test with different file types

### Audio recording not working
1. Check microphone permissions
2. Ensure `react-native-audio-record` is linked
3. Verify audio source in `useRealtimeStream` hook

## 📝 Development Notes

- All async operations show loading states (busy flags)
- Error messages are user-friendly with ✗ prefix
- Success messages display with ✓ prefix
- Files are saved to app's document directory
- Theme colors defined in `src/theme.js`
- All styles use local StyleSheet objects

## 🚀 Next Steps

1. Start the backend: `python -m uvicorn backend.main:app --reload --port 7860`
2. Start the app: `npm start`
3. Choose platform (Android/iOS)
4. Test file uploads and conversions
5. Test real-time streaming

