import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120000
});

export function wsUrl(path) {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `/api${path}`;
  return url.toString();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function filenameFromHeaders(headers, fallback) {
  const disposition = headers["content-disposition"];
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match?.[1] || fallback;
}
