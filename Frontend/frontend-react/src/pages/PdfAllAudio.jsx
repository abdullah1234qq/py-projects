import { useState } from "react";

import { API_URL, api } from "../api/client";
import { FileUploader } from "../components/FileUploader.jsx";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { DownloadButton } from "../components/DownloadButton.jsx";
import { TranscriptCard } from "../components/TranscriptCard.jsx";
import { StatusAlert } from "../components/StatusAlert.jsx";

export function PdfAllAudio() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [zipUrl, setZipUrl] = useState("");

  async function generateAllAudio() {
    if (!file) {
      setMessage("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/pdf-to-all-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = `${API_URL}${response.data.zip_url}`;
      setOriginalText(response.data.original_text || "");
      setZipUrl(url);
      setMessage("ZIP ready.");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          error.message ||
          "ZIP generation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader
        title="PDF → All Audio"
        copy="Generate multi-language audio from a single PDF."
      />
      <NeonHeroMark tone="pink" />
      <FileUploader
        accept="application/pdf"
        label="Upload a PDF document"
        helper="Extract text and create a ZIP file"
        onFile={setFile}
      />
      <GlowButton tone="pink" onClick={generateAllAudio} disabled={busy}>
        {busy ? "Generating ZIP..." : "Generate Multi-Language Audio ZIP"}
      </GlowButton>

      <div className="action-row">
        <DownloadButton
          url={zipUrl}
          filename="voice2pdf-all-audio.zip"
          tone="pink"
        >
          Download ZIP
        </DownloadButton>
      </div>

      {originalText ? (
        <TranscriptCard title="Extracted PDF text" content={originalText} />
      ) : null}
      {message ? (
        <StatusAlert
          message={message}
          type={message.toLowerCase().includes("failed") ? "error" : "success"}
        />
      ) : null}
    </div>
  );
}
