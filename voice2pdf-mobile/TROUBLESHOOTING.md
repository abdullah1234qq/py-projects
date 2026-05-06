# 🚨 Troubleshooting & Error Reference Guide

## Common Issues & Solutions

### 1. **Server Connection Error**

**Error Message:**
```
Failed to convert audio to PDF: Connection refused
```

**Solution:**
- ✅ Ensure FastAPI server is running: `python main.py`
- ✅ Update `BASE_URL` in `services/api.js`
- ✅ Check firewall settings
- ✅ Ensure device can reach server IP

**Check in Debug Screen:**
- Go to Debug Screen → View Logs
- Look for "Connection refused" errors
- Verify correct IP address

---

### 2. **Permission Errors**

**Error Message:**
```
Recording failed: Permission denied
```

**Solution:**
- ✅ Grant microphone permission when prompted
- ✅ Check app permissions in device settings
- ✅ For iOS: Enable microphone in Settings > Voice2PDF
- ✅ For Android: Grant permission in app settings

**Log Entry:**
```
[TIME] [Realtime - Start Recording] Permission denied
```

---

### 3. **File Selection Failed**

**Error Message:**
```
File selection failed: Unable to select file
```

**Solution:**
- ✅ Use correct file formats (MP3, WAV, PDF, etc.)
- ✅ Ensure file is not corrupted
- ✅ Check device storage permissions
- ✅ Try selecting from different location

**Supported Formats:**
- Audio: MP3, WAV, M4A, MP4, MOV
- Video: MP4, MOV, WebM
- Documents: PDF

---

### 4. **API Timeout**

**Error Message:**
```
Failed to process realtime request: Timeout
```

**Solution:**
- ✅ Check backend is responding: `curl http://IP:8000/health`
- ✅ Increase timeout in `services/api.js` if needed
- ✅ Reduce file size for faster processing
- ✅ Check network speed

**Log Pattern:**
```
[TIME] [Realtime API] Server returned 504: Timeout
```

---

### 5. **File Upload Error**

**Error Message:**
```
Failed to convert audio to PDF: Form data error
```

**Solution:**
- ✅ Check file URI is valid
- ✅ Ensure file is readable
- ✅ Verify MIME type is correct
- ✅ Try smaller file size

---

### 6. **Audio Playback Failed**

**Error Message:**
```
Playback error: Audio not found
```

**Solution:**
- ✅ Ensure audio URL is accessible
- ✅ Check network connection
- ✅ Verify file format is playable
- ✅ Check device volume

**Debug Check:**
- Go to Debug Screen
- Look for "Playback" errors
- Verify audio URL in result

---

## 🔧 Debug Screen Usage

### How to Access
1. Open any screen (AudioToPDF, PDFToAudio, etc.)
2. Scroll down to bottom
3. Tap "🐛 View Logs" button

### What You'll See
- **All errors** with timestamps
- **Context** of where error occurred
- **Error messages** and details

### Actions Available
- 🔄 **Refresh** - Get latest logs
- 🗑️ **Clear All Logs** - Delete all entries
- 📋 **Copy** - Select and copy log text (on most devices)

---

## 📊 Error Log Format

Each log entry contains:

```
[ISO Timestamp] [Context] Error Message
```

**Example:**
```
[2024-05-06T14:23:45.123Z] [AudioToPDF API] Failed to convert audio to PDF: Server returned 400: Invalid file format
[2024-05-06T14:25:12.456Z] [Realtime - Start Recording] Permission denied
[2024-05-06T14:26:33.789Z] [PDFToAudio - Playback] Playback error: Audio not found
```

---

## 🎯 Error Prevention Tips

### Before File Conversion
- ✅ Verify file format is supported
- ✅ Check file is not corrupted
- ✅ Ensure file is not too large
- ✅ Confirm backend server is running

### Before Recording
- ✅ Grant microphone permission
- ✅ Test microphone in device settings
- ✅ Ensure quiet environment for quality
- ✅ Check device storage space

### General Tips
- ✅ Use wired connection if possible
- ✅ Avoid background interference
- ✅ Keep app updated
- ✅ Restart app if persistent errors

---

## 📱 Device-Specific Issues

### Android
- **Storage permissions:** Settings > Apps > Voice2PDF > Permissions > Storage
- **Microphone permission:** Settings > Apps > Voice2PDF > Permissions > Microphone
- **Network access:** Ensure WiFi/mobile data is enabled

### iOS
- **Microphone permission:** Settings > Privacy > Microphone
- **File access:** Settings > Privacy > Files and Folders
- **Network permissions:** Settings > WiFi or Cellular

---

## 🌐 Network Troubleshooting

### Check Server is Running
```bash
curl http://YOUR_LOCAL_IP:8000/health
```

**Expected Response:**
```json
{"status": "ok"}
```

### Test Connectivity
```bash
ping YOUR_LOCAL_IP
```

### Verify Port is Open
```bash
netstat -an | grep 8000  # Linux/Mac
netstat -ano | find "8000"  # Windows
```

---

## 🔍 Advanced Debugging

### Enable Console Logging
- Open browser DevTools (if using web)
- Check console for `📝 LOG` entries
- All errors logged with emoji indicators

**Console Format:**
```
📝 LOG [Context]: Error object
```

### Monitor Network Requests
- Open browser Network tab
- Try conversion
- Check request/response
- Look for HTTP status codes

### Check File System Access
- Logs stored at: `DocumentDirectory/logs/logs.txt`
- Use file manager to verify file exists
- Check file size if logs growing

---

## 🚨 Critical Errors

### Server Not Responding
**What to do:**
1. Check backend is running
2. Verify IP address is correct
3. Check firewall settings
4. Restart backend server

**Log shows:**
```
[TIME] [Health Check] Server health check failed
```

### Permission Denied
**What to do:**
1. Grant all required permissions
2. Restart app
3. Go to Settings and check permissions
4. Reinstall app if needed

### Out of Memory
**What to do:**
1. Close other apps
2. Reduce file size
3. Restart device
4. Check available storage

---

## 📞 Getting Help

1. **Check Debug Screen** for error logs
2. **Note the exact error message**
3. **Check this guide** for solutions
4. **Verify network connectivity**
5. **Restart app and try again**

---

## 🔗 Log Locations

### Mobile App
- **Android:** `/data/data/com.app.voice2pdf/files/logs/`
- **iOS:** `Documents/logs/`

### Accessible via App
- **Debug Screen:** Open app → Tap "🐛 View Logs"

---

**Last Updated:** May 2024
**Version:** 1.0.0

