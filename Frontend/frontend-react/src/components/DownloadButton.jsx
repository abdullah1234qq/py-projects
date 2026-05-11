import { useState } from "react";
import { PdfIcon } from "./Icons.jsx";
import { downloadFromUrl } from "../api/client";

export function DownloadButton({ url, filename = "file.pdf", children = "Download", tone = "blue", className = "" }) {
  const [downloading, setDownloading] = useState(false);
  const disabled = !url || downloading;

  async function handleDownload(e) {
    e?.preventDefault();
    if (!url) return;
    setDownloading(true);
    try {
      await downloadFromUrl(url, filename);
    } catch (err) {
      console.error("Download failed", err);
      // let parent show the error through other means
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      className={`download-btn download-${tone} ${className}`}
      onClick={handleDownload}
      disabled={disabled}
      title={!url ? "No file available" : "Download"}
    >
      <span className="icon">
        <PdfIcon />
      </span>
      <span className="label">{downloading ? "Downloading..." : children}</span>
    </button>
  );
}
