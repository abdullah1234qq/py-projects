import axios from "axios";
import { Buffer } from "buffer";
import RNFS from "react-native-fs";

export const BASE_URL = globalThis.VOICE2PDF_API_URL || "http://10.0.2.2:7860";
export const WS_URL = BASE_URL.replace(/^http/, "ws");

export async function uploadAndSave(endpoint, pickedFile, fallbackName, fields = {}) {
  const formData = new FormData();
  formData.append("file", {
    uri: pickedFile.uri,
    name: pickedFile.name || fallbackName,
    type: pickedFile.type || "application/octet-stream"
  });
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await axios.post(`${BASE_URL}/api${endpoint}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "arraybuffer",
    timeout: 120000
  });

  const filename = filenameFromDisposition(response.headers?.["content-disposition"]) || fallbackName;
  return writeResponseFile(response.data, filename);
}

export async function textToPdfAndSave(text) {
  const response = await axios.post(
    `${BASE_URL}/api/text-to-pdf`,
    { text: text || "No transcript captured yet.", title: "Live Voice2PDF Transcript" },
    { responseType: "arraybuffer", timeout: 120000 }
  );
  return writeResponseFile(response.data, filenameFromDisposition(response.headers?.["content-disposition"]) || "live-transcript.pdf");
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
