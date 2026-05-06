/**
 * App Configuration
 * Update these values according to your environment
 */

export const APP_CONFIG = {
  // 🔧 Backend Configuration
  BACKEND: {
    // Update this to your FastAPI server's IP address
    // Examples:
    // - Local machine: http://192.168.1.100:8000
    // - Localhost: http://localhost:8000
    // - Production: https://api.yourdomain.com
    BASE_URL: 'http://YOUR_LOCAL_IP:8000',

    // API timeout in milliseconds
    TIMEOUT: 120000,

    // Enable request logging
    LOG_REQUESTS: true,

    // Enable response logging
    LOG_RESPONSES: true,
  },

  // 🎨 UI Configuration
  UI: {
    // Primary color (hex format)
    PRIMARY_COLOR: '#38bdf8',

    // Secondary color
    SECONDARY_COLOR: '#6f42c1',

    // Background color
    BACKGROUND_COLOR: '#020617',

    // Header background
    HEADER_BG: '#0f172a',

    // Enable animations
    ANIMATIONS_ENABLED: true,
  },

  // 📝 Logging Configuration
  LOGGING: {
    // Enable error logging
    ENABLED: true,

    // Log to file system
    PERSIST_TO_FILE: true,

    // Log to console
    LOG_TO_CONSOLE: true,

    // Maximum log file size (in MB)
    MAX_LOG_SIZE: 10,

    // Auto-clear logs after days
    AUTO_CLEAR_DAYS: 7,
  },

  // 📱 App Information
  APP: {
    NAME: 'Voice2PDF',
    VERSION: '1.0.0',
    BUILD: 1,

    // Language options
    LANGUAGES: [
      'English',
      'Urdu',
      'Hindi',
      'French',
      'Spanish',
      'German',
      'Arabic'
    ],

    // Maximum file size (in MB)
    MAX_FILE_SIZE: 100,

    // Supported audio formats
    AUDIO_FORMATS: ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.webm'],

    // Supported document formats
    DOC_FORMATS: ['.pdf'],
  },

  // 🔒 Security
  SECURITY: {
    // Enable request validation
    VALIDATE_REQUESTS: true,

    // Enable response validation
    VALIDATE_RESPONSES: true,

    // Clear logs on logout (if implemented)
    CLEAR_LOGS_ON_LOGOUT: false,

    // Encrypt logs (if implemented)
    ENCRYPT_LOGS: false,
  },

  // 📊 Debug Mode
  DEBUG: {
    // Enable debug mode
    ENABLED: true,

    // Show debug info on screen
    SHOW_DEBUG_INFO: false,

    // Enable network inspector
    NETWORK_INSPECTOR: true,

    // Log all API calls
    LOG_API_CALLS: true,
  },
};

/**
 * Helper Functions
 */

// Get backend URL
export const getBackendURL = () => APP_CONFIG.BACKEND.BASE_URL;

// Get language options
export const getLanguages = () => APP_CONFIG.APP.LANGUAGES;

// Check if debug mode
export const isDebugMode = () => APP_CONFIG.DEBUG.ENABLED;

// Get app version
export const getAppVersion = () => `${APP_CONFIG.APP.NAME} v${APP_CONFIG.APP.VERSION}`;

// Get max file size in bytes
export const getMaxFileSize = () => APP_CONFIG.APP.MAX_FILE_SIZE * 1024 * 1024;

// Validate file format
export const isValidFileFormat = (filename, type) => {
  const ext = filename.toLowerCase().split('.').pop();
  const fullExt = `.${ext}`;

  if (type === 'audio') {
    return APP_CONFIG.APP.AUDIO_FORMATS.includes(fullExt);
  } else if (type === 'document') {
    return APP_CONFIG.APP.DOC_FORMATS.includes(fullExt);
  }

  return false;
};

// Get UI colors
export const UIColors = {
  primary: APP_CONFIG.UI.PRIMARY_COLOR,
  secondary: APP_CONFIG.UI.SECONDARY_COLOR,
  background: APP_CONFIG.UI.BACKGROUND_COLOR,
  header: APP_CONFIG.UI.HEADER_BG,
};

export default APP_CONFIG;
