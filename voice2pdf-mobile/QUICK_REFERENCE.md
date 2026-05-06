# 🚀 Quick Reference Guide

## One-Page Cheat Sheet for Voice2PDF Mobile

### 📱 App Structure
```
App.js (Main Navigation)
├── AudioToPDFScreen (Audio to PDF conversion)
├── PDFToAudioScreen (PDF to audio conversion)
├── AllAudioScreen (Multi-language audio)
├── RealtimeScreen (Real-time transcription)
└── DebugScreen (Error logs viewer) ← NEW!

services/api.js (Fetch-based API)
utils/logger.js (Error logging) ← NEW!
config.js (Configuration) ← NEW!
```

---

## 🔧 Setup (2 minutes)

### Step 1: Install
```bash
npm install
```

### Step 2: Configure
Edit `config.js`:
```javascript
BASE_URL: 'http://192.168.1.100:8000'  // Your IP
```

### Step 3: Run
```bash
npm start
```

---

## 🐛 Error Logging (How It Works)

### Automatic Logging
```javascript
// Error happens → Logged to file → Shown in Debug Screen
try {
  await audioToPDF(file, filename, language);
} catch (error) {
  await logError(error, "AudioToPDF API");  // ← Logged!
}
```

### View Logs
1. Open any screen
2. Scroll down
3. Tap "🐛 View Logs"
4. See all errors with timestamps

### Clear Logs
1. Open Debug Screen
2. Tap "🗑️ Clear All Logs"
3. Confirm deletion

---

## 🔗 API Usage

### Fetch Instead of Axios
```javascript
// ✅ CORRECT (Using fetch)
const response = await fetch(`${BASE_URL}/audio-to-pdf`, {
  method: 'POST',
  body: formData,
});

// ❌ OLD (Don't use Axios)
const response = await api.post("/audio-to-pdf", formData);
```

### API Functions
```javascript
import { audioToPDF, pdfToAudio, pdfToAllAudio, realtimeAPI } from './services/api';

// Audio to PDF
const result = await audioToPDF(file, filename, language);

// PDF to Audio
const result = await pdfToAudio(file, language);

// PDF to All Audio
const result = await pdfToAllAudio(file);

// Realtime
const result = await realtimeAPI(file, language);
```

---

## 📝 Logger Usage

### Log Errors
```javascript
import { logError, getLogs, clearLogs } from '../utils/logger';

// Log error
await logError(error, "MyComponent - Action");

// Get all logs
const allLogs = await getLogs();

// Clear logs
await clearLogs();
```

### Log Format
```
[2024-05-06T14:23:45.123Z] [Context] Error message
```

### Storage Location
- **Mobile:** `DocumentDirectory/logs/logs.txt`
- **Accessible via:** Debug Screen → "🐛 View Logs"

---

## 🎨 UI Colors

```javascript
import { UIColors } from './config';

UIColors.primary      // #38bdf8 (cyan)
UIColors.secondary    // #6f42c1 (purple)
UIColors.background   // #020617 (dark)
UIColors.header       // #0f172a (blue)
```

---

## 📱 Navigation

```javascript
// Navigate to Debug Screen
navigation.navigate("Debug");

// Navigate to other screens
navigation.navigate("AudioToPDF");
navigation.navigate("PDFToAudio");
navigation.navigate("AllAudio");
navigation.navigate("Realtime");
```

---

## ⚠️ Error Handling

### Always Use Try/Catch
```javascript
try {
  const data = await audioToPDF(file, filename, language);
  // ✅ Success
} catch (error) {
  await logError(error, "AudioToPDF - Conversion");  // ✅ Logged
  Alert.alert("Error", error.message);
}
```

### Common Errors
| Error | Solution |
|-------|----------|
| Connection refused | Check backend URL |
| Permission denied | Grant permissions |
| File not found | Select valid file |
| Timeout | Check server |

---

## 🔄 Fetch Examples

### POST with FormData
```javascript
const formData = new FormData();
formData.append('file', {
  uri: file.uri,
  name: file.name,
  type: file.type,
});
formData.append('language', 'English');

const response = await fetch(`${BASE_URL}/endpoint`, {
  method: 'POST',
  body: formData,
});
```

### GET Request
```javascript
const response = await fetch(`${BASE_URL}/health`);
const data = await response.json();
```

### Error Handling
```javascript
if (!response.ok) {
  const error = new Error(`HTTP ${response.status}`);
  throw error;
}
const data = await response.json();
```

---

## 📊 Debug Screen Features

| Button | Action |
|--------|--------|
| 🔄 Refresh | Update logs |
| 🗑️ Clear All | Delete all logs |
| Pull down | Refresh logs |

---

## 🚨 Troubleshooting

### App won't start
```bash
npm install
npm start
```

### Logs not showing
1. Check Debug Screen
2. Perform an action that causes error
3. Wait 2 seconds
4. Refresh Debug Screen

### Server not responding
1. Check IP address in `config.js`
2. Verify backend is running
3. Check network connectivity

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `config.js` | Configuration & colors |
| `utils/logger.js` | Error logging |
| `services/api.js` | API calls |
| `screens/DebugScreen.js` | Logs viewer |
| All other screens | User interfaces |

---

## 🎯 Common Tasks

### Add New Screen
```javascript
// 1. Create: screens/NewScreen.js
export default function NewScreen({ navigation }) { ... }

// 2. Update: App.js
import NewScreen from './screens/NewScreen';
<Stack.Screen name="New" component={NewScreen} />
```

### Log Error
```javascript
import { logError } from '../utils/logger';

try {
  // ... code
} catch (error) {
  await logError(error, "ScreenName - Action");
}
```

### Call API
```javascript
import { audioToPDF } from '../services/api';

try {
  const result = await audioToPDF(file, filename, language);
} catch (error) {
  await logError(error, "AudioToPDF");
}
```

---

## 🔐 Security Tips

✅ Don't hardcode credentials  
✅ Use config.js for settings  
✅ Always validate input  
✅ Log errors safely (no sensitive data)  
✅ Clear logs in sensitive contexts  

---

## ⚡ Performance Tips

- Use memoization for expensive components
- Lazy load screens
- Optimize images
- Clear logs periodically
- Monitor bundle size

---

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Complete guide
- **TROUBLESHOOTING.md** - Error solutions
- **IMPLEMENTATION_SUMMARY.md** - Overview
- **config.js** - Configuration

---

## 🆘 Need Help?

1. Check **TROUBLESHOOTING.md** for solutions
2. Review **IMPLEMENTATION_GUIDE.md** for details
3. Check Debug Screen for error logs
4. Verify network and backend

---

## ✅ Checklist Before Deploy

- [ ] Updated `config.js` with correct IP
- [ ] Tested all 4 screens
- [ ] Verified error logging works
- [ ] Checked Debug Screen displays logs
- [ ] Tested file uploads
- [ ] Verified audio playback
- [ ] No console errors
- [ ] All buttons work

---

**That's all you need to know!** 🎉

Quick access: **Debug Screen → 🐛 View Logs**

