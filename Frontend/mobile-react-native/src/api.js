import axios from "axios";
import { Buffer } from "buffer";
import RNFS from "react-native-fs";

// Auto-detect environment and configure API URL
const getBaseUrl = () => {
  // Try multiple URLs for flexibility
  const candidates = [
    globalThis.VOICE2PDF_API_URL,
    process.env.VOICE2PDF_API_URL,
    "http://10.0.2.2:7860", // Android emulator localhost
    "http://localhost:7860", // Fallback
  ];
  
  return candidates.find(url => url) || "http://10.0.2.2:7860";
};

export const BASE_URL = getBaseUrl();
export const WS_URL = BASE_URL.replace(/^http/, "ws");

export async function uploadAndSave(endpoint, pickedFile, fallbackName, fields = {}) {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: pickedFile.uri,
      name: pickedFile.name || fallbackName,
      type: pickedFile.type || "application/octet-stream"
    });
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "arraybuffer",
      timeout: 120000
    });

    const filename = filenameFromDisposition(response.headers?.["content-disposition"]) || fallbackName;
    return writeResponseFile(response.data, filename);
  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
      error.message ||
      "Upload failed. Check your connection."
    );
  }
}

export async function textToPdfAndSave(text) {
  try {
    const response = await axios.post(
      `${BASE_URL}/text-to-pdf`,
      { text: text || "No transcript captured yet.", title: "Live Voice2PDF Transcript" },
      { responseType: "arraybuffer", timeout: 120000 }
    );
    return writeResponseFile(response.data, filenameFromDisposition(response.headers?.["content-disposition"]) || "live-transcript.pdf");
  } catch (error) {
    throw new Error(error.message || "PDF generation failed.");
  }
}

function filenameFromDisposition(disposition) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1];
}

async function writeResponseFile(data, filename) {
  const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
  const base64 = Buffer.from(data).toString("base64");
  await RNFS.writeFile(path, base64, "base64");
  return path;
}
