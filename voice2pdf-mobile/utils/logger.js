import * as FileSystem from 'expo-file-system';

const LOGS_DIR = FileSystem.documentDirectory + 'logs/';
const LOGS_FILE = LOGS_DIR + 'logs.txt';

// Log levels
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

// Initialize logs directory
async function ensureLogsDirectory() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOGS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOGS_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Format timestamp
function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

// Format log message with level
function formatLogMessage(level, message, context = 'Unknown') {
  const timestamp = getTimestamp();
  const emoji = getLogEmoji(level);
  return `[${timestamp}] [${level}] [${context}] ${emoji} ${message}\n`;
}

// Get emoji for log level
function getLogEmoji(level) {
  switch (level) {
    case LOG_LEVELS.DEBUG: return '🔍';
    case LOG_LEVELS.INFO: return 'ℹ️';
    case LOG_LEVELS.WARN: return '⚠️';
    case LOG_LEVELS.ERROR: return '❌';
    default: return '📝';
  }
}

// Format error message (backward compatibility)
function formatErrorMessage(error, context) {
  let errorMessage = '';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }
  } else {
    errorMessage = String(error);
  }

  return formatLogMessage(LOG_LEVELS.ERROR, errorMessage, context);
}

// Core logging function
async function writeLog(message) {
  try {
    await ensureLogsDirectory();

    // Also log to console for development
    console.log(message.trim());

    // Append to file
    try {
      const existingContent = await FileSystem.readAsStringAsync(LOGS_FILE);
      await FileSystem.writeAsStringAsync(LOGS_FILE, existingContent + message);
    } catch {
      // File doesn't exist yet, create it
      await FileSystem.writeAsStringAsync(LOGS_FILE, message);
    }
  } catch (logError) {
    console.error('Failed to write to logs:', logError);
  }
}

// Main logging functions
export async function logError(error, context = 'Unknown') {
  const formattedMessage = formatErrorMessage(error, context);
  await writeLog(formattedMessage);
}

export async function logInfo(message, context = 'Unknown') {
  const formattedMessage = formatLogMessage(LOG_LEVELS.INFO, message, context);
  await writeLog(formattedMessage);
}

export async function logDebug(message, context = 'Unknown') {
  const formattedMessage = formatLogMessage(LOG_LEVELS.DEBUG, message, context);
  await writeLog(formattedMessage);
}

export async function logWarn(message, context = 'Unknown') {
  const formattedMessage = formatLogMessage(LOG_LEVELS.WARN, message, context);
  await writeLog(formattedMessage);
}

// Specialized logging functions for API calls
export async function logApiRequest(method, url, data = null, context = 'API') {
  let message = `${method} ${url}`;
  if (data) {
    if (data instanceof FormData) {
      message += ` | FormData: ${data._parts?.length || 0} fields`;
    } else if (typeof data === 'object') {
      message += ` | Data: ${JSON.stringify(data).substring(0, 100)}...`;
    } else {
      message += ` | Data: ${String(data).substring(0, 100)}...`;
    }
  }
  await logInfo(`REQUEST: ${message}`, context);
}

export async function logApiResponse(method, url, status, responseData = null, context = 'API') {
  let message = `${method} ${url} | Status: ${status}`;
  if (responseData) {
    if (typeof responseData === 'object') {
      const dataStr = JSON.stringify(responseData);
      message += ` | Response: ${dataStr.substring(0, 200)}${dataStr.length > 200 ? '...' : ''}`;
    } else {
      message += ` | Response: ${String(responseData).substring(0, 200)}...`;
    }
  }
  await logInfo(`RESPONSE: ${message}`, context);
}

export async function logApiError(method, url, status, error, context = 'API') {
  let message = `${method} ${url} | Status: ${status || 'UNKNOWN'}`;
  if (error) {
    if (typeof error === 'object') {
      message += ` | Error: ${JSON.stringify(error).substring(0, 200)}...`;
    } else {
      message += ` | Error: ${String(error).substring(0, 200)}...`;
    }
  }
  await logError(message, context);
}

export async function logNetworkError(method, url, error, context = 'Network') {
  let message = `${method || 'UNKNOWN'} ${url || 'UNKNOWN_URL'}`;
  if (error) {
    message += ` | Network Error: ${error.message || String(error)}`;
  }
  await logError(message, context);
}

export async function logFileOperation(operation, filePath, success = true, details = '', context = 'File') {
  const status = success ? 'SUCCESS' : 'FAILED';
  let message = `${operation} | ${status} | ${filePath}`;
  if (details) {
    message += ` | ${details}`;
  }

  if (success) {
    await logInfo(message, context);
  } else {
    await logError(message, context);
  }
}

export async function logAudioOperation(operation, details = '', context = 'Audio') {
  await logInfo(`${operation}${details ? ` | ${details}` : ''}`, context);
}

export async function logAudioError(operation, error, context = 'Audio') {
  await logError(`${operation} | ${error.message || String(error)}`, context);
}

// Get all logs
export async function getLogs() {
  try {
    await ensureLogsDirectory();
    try {
      const content = await FileSystem.readAsStringAsync(LOGS_FILE);
      return content || 'No logs yet';
    } catch {
      return 'No logs yet';
    }
  } catch (error) {
    console.error('Failed to read logs:', error);
    return 'Error reading logs';
  }
}

// Clear logs
export async function clearLogs() {
  try {
    await ensureLogsDirectory();
    await FileSystem.writeAsStringAsync(LOGS_FILE, '');
    console.log('✅ Logs cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return false;
  }
}

// Get logs file size
export async function getLogsSize() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(LOGS_FILE);
    if (fileInfo.exists) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get logs size:', error);
    return 0;
  }
}

// Export logs as text
export async function exportLogs() {
  try {
    return await getLogs();
  } catch (error) {
    console.error('Failed to export logs:', error);
    return null;
  }
}
