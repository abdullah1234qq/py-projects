import {
  logError,
  logApiRequest,
  logApiResponse,
  logApiError,
  logNetworkError,
  logInfo
} from '../utils/logger';

const BASE_URL = 'https://py-projects--abdullah1234qq.replit.app';

const guessMimeType = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.m4a')) return 'audio/x-m4a';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  return 'application/octet-stream';
};

const makeFileData = (file, fieldName) => {
  const formData = new FormData();
  const name = file.name || `upload-${Date.now()}`;
  const type = file.mimeType || file.type || guessMimeType(name);

  formData.append(fieldName, {
    uri: file.uri,
    name,
    type,
  });

  return formData;
};

const handleApiError = (error) => {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message) return error.message;
  return 'Network Error';
};

// Enhanced fetch wrapper with detailed logging
async function fetchWithLogging(url, options = {}) {
  const method = options.method || 'GET';
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  try {
    // Log the request
    await logApiRequest(method, fullUrl, options.body);

    console.log(`🔄 ${method} ${fullUrl}`);

    const startTime = Date.now();
    const response = await fetch(fullUrl, options);
    const duration = Date.now() - startTime;

    // Log response headers and status
    await logInfo(`RESPONSE: ${method} ${fullUrl} | Status: ${response.status} | Duration: ${duration}ms | Headers: ${Object.keys(response.headers).length}`, 'API');

    if (!response.ok) {
      // Log error response
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }

      const error = new Error(`HTTP ${response.status}: ${errorText}`);
      error.status = response.status;
      error.response = errorText;

      await logApiError(method, fullUrl, response.status, errorText);
      console.error(`❌ ${method} ${fullUrl} failed: ${response.status} - ${errorText}`);
      throw error;
    }

    // Try to parse response as JSON
    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
        await logApiResponse(method, fullUrl, response.status, responseData);
      } catch (parseError) {
        // If JSON parsing fails, get as text
        responseData = await response.text();
        await logApiResponse(method, fullUrl, response.status, responseData);
      }
    } else {
      // Non-JSON response (like file downloads)
      responseData = await response.text();
      await logApiResponse(method, fullUrl, response.status, `Non-JSON response (${responseData.length} chars)`);
    }

    console.log(`✅ ${method} ${fullUrl} successful (${duration}ms)`);
    return responseData;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network error
      await logNetworkError(method, fullUrl, error);
      console.error(`🌐 Network error for ${method} ${fullUrl}:`, error.message);
    } else if (!error.status) {
      // Other errors (not HTTP errors)
      await logError(error, `API ${method}`);
      console.error(`❌ ${method} ${fullUrl} error:`, error.message);
    }

    throw error;
  }
}

/**
 * Audio to PDF Conversion
 */
export async function audioToPDF(file, filename, language = 'English') {
  const context = 'audioToPDF API';

  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object');
    }

    const data = makeFileData(file, 'file');
    data.append('filename', filename || 'voice2pdf');
    data.append('language', language);

    await logInfo(`Starting audio to PDF conversion | File: ${file.name} | Language: ${language}`, context);

    const result = await fetchWithLogging('/api/convert', {
      method: 'POST',
      body: data,
    });

    await logInfo(`Audio to PDF conversion completed successfully`, context);
    return result;

  } catch (error) {
    const errorMsg = `Failed to convert audio to PDF: ${error.message}`;
    await logError(error, context);
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * PDF to Audio Conversion
 */
export async function pdfToAudio(file, language = 'English') {
  const context = 'pdfToAudio API';

  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object');
    }

    const data = makeFileData(file, 'file');
    data.append('language', language);

    await logInfo(`Starting PDF to audio conversion | File: ${file.name} | Language: ${language}`, context);

    const result = await fetchWithLogging('/api/pdf-to-audio', {
      method: 'POST',
      body: data,
    });

    await logInfo(`PDF to audio conversion completed successfully`, context);
    return result;

  } catch (error) {
    const errorMsg = `Failed to convert PDF to audio: ${error.message}`;
    await logError(error, context);
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * PDF to All Audio Languages
 */
export async function pdfToAllAudio(file) {
  const context = 'pdfToAllAudio API';

  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object');
    }

    const data = makeFileData(file, 'file');

    await logInfo(`Starting PDF to all audio conversion | File: ${file.name}`, context);

    const result = await fetchWithLogging('/api/pdf-to-all-audio', {
      method: 'POST',
      body: data,
    });

    await logInfo(`PDF to all audio conversion completed successfully`, context);
    return result;

  } catch (error) {
    const errorMsg = `Failed to convert PDF to all audio: ${error.message}`;
    await logError(error, context);
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Realtime Transcription and Translation
 */
export async function realtimeAPI(file, language = 'English') {
  const context = 'Realtime API';

  try {
    if (!file || !file.uri) {
      throw new Error('Invalid file object');
    }

    const data = makeFileData(file, 'file');
    data.append('language', language);

    await logInfo(`Starting realtime processing | File: ${file.name} | Language: ${language}`, context);

    const result = await fetchWithLogging('/api/transcribe', {
      method: 'POST',
      body: data,
    });

    await logInfo(`Realtime processing completed successfully`, context);
    return result;

  } catch (error) {
    const errorMsg = `Failed to process realtime request: ${error.message}`;
    await logError(error, context);
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Health Check
 */
export async function healthCheck() {
  const context = 'Health Check';

  try {
    await logInfo('Performing server health check', context);

    const result = await fetchWithLogging('/health', {
      method: 'GET',
    });

    await logInfo('Server health check passed', context);
    console.log('✅ Server is healthy');
    return true;

  } catch (error) {
    await logError(error, context);
    console.error('❌ Server health check failed');
    return false;
  }
}

export { BASE_URL, handleApiError };

