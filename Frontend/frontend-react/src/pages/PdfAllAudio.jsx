import { useState } from "react";

import { API_URL, api, downloadFromUrl } from "../api/client";
import { FileUploader } from "../components/FileUploader.jsx";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";

export function PdfAllAudio() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [originalText, setOriginalText] = useState("");

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
        headers: { "Content-Type": "multipart/form-data" }
      });

      const url = `${API_URL}${response.data.zip_url}`;
      setOriginalText(response.data.original_text || "");
      await downloadFromUrl(url, "voice2pdf-all-audio.zip");
      setMessage("All-language audio ZIP downloaded.");
    } catch (error) {
      setMessage(error.response?.data?.detail || error.message || "ZIP generation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader title="PDF → All Audio" copy="Generate multi-language audio from a single PDF." />
      <NeonHeroMark tone="pink" />
      <FileUploader accept="application/pdf" label="Upload a PDF document" helper="Extract text and create a ZIP file" onFile={setFile} />
      <GlowButton tone="pink" onClick={generateAllAudio} disabled={busy}>
        {busy ? "Generating ZIP..." : "Generate Multi-Language Audio ZIP"}
      </GlowButton>
      {originalText ? (
        <div className="result-card">
          <strong>Extracted PDF text</strong>
          <pre>{originalText}</pre>
        </div>
      ) : null}
      {message ? <p className="status-line">{message}</p> : null}
    </div>
  );
}
