import axios from "axios";

export const API_URL = "https://py-projects--abdullah1234qq.replit.app";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 120000,
});

export function wsUrl(path) {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path;
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

export async function downloadFromUrl(url, fallbackName) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Download failed");
  }
  const blob = await response.blob();
  downloadBlob(blob, fallbackName);
}

export function filenameFromHeaders(headers, fallback) {
  const disposition = headers["content-disposition"];
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match?.[1] || fallback;
}
