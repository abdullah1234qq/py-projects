import axios from "axios";

const BASE_URL = "http://YOUR_LOCAL_IP:8000";
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

const guessMimeType = (name) => {
  const lower = (name || "").toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/x-m4a";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
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
  return "Network Error";
};

export async function audioToPDF(file, filename, language = "English") {
  const data = makeFileData(file, "file");
  data.append("filename", filename || "voice2pdf");
  data.append("language", language);

  const response = await api.post("/audio-to-pdf", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function pdfToAudio(file, language = "English") {
  const data = makeFileData(file, "file");
  data.append("language", language);

  const response = await api.post("/pdf-to-audio", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function pdfToAllAudio(file) {
  const data = makeFileData(file, "file");

  const response = await api.post("/pdf-to-all-audio", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function realtimeAPI(file, language = "English") {
  const data = makeFileData(file, "file");
  data.append("language", language);

  const response = await api.post("/realtime", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export { BASE_URL, handleApiError };

