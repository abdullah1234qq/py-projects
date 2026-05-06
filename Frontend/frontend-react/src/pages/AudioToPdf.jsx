import { useMemo, useState } from "react";

import { downloadFromUrl } from "../api/client";
import { AudioPlayer } from "../components/AudioPlayer.jsx";
import { FileUploader } from "../components/FileUploader.jsx";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";

export function AudioToPdf() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [filename, setFilename] = useState("voice2pdf");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [originalText, setOriginalText] = useState("");
  const BASE_URL = "http://127.0.0.1:8000";
  const [translatedText, setTranslatedText] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const audioUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  async function convert() {
    if (!file) {
      setMessage("Choose an audio file first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      formData.append("filename", filename || "voice2pdf");

      const response = await fetch(`${BASE_URL}/audio-to-pdf`, {
        method: "POST",
        body: formData,
      });

      console.log("API response status:", response.status);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || "Backend returned an error");
      }

      const url = data.pdf_url?.startsWith("http") ? data.pdf_url : `${BASE_URL}${data.pdf_url}`;
      setPdfUrl(url);
      setOriginalText(data.original_text || "");
      setTranslatedText(data.translated_text || "");

      await downloadFromUrl(url, `${filename || "voice2pdf"}.pdf`);
      setMessage("PDF generated and downloaded.");
    } catch (error) {
      console.error("API Error:", error);
      setMessage(error.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader title="Audio to PDF" copy="Upload audio and receive a clean transcript PDF." />
      <NeonHeroMark />
      <FileUploader
        accept="audio/*"
        label="Tap to upload or drag and drop"
        helper="MP3, WAV, M4A, AAC up to 200MB"
        onFile={setFile}
      />
      <div className="form-grid">
        <label>
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option>English</option>
            <option>Urdu</option>
            <option>Hindi</option>
            <option>French</option>
            <option>Spanish</option>
            <option>German</option>
            <option>Arabic</option>
          </select>
        </label>
        <label>
          <span>Filename</span>
          <input value={filename} onChange={(event) => setFilename(event.target.value)} />
        </label>
      </div>
      {file ? <AudioPlayer file={file} sourceUrl={audioUrl} /> : null}
      <GlowButton onClick={convert} disabled={busy}>
        {busy ? "Converting..." : "Convert to PDF"}
      </GlowButton>
      {pdfUrl ? (
        <p className="status-line">
          PDF ready: <a href={pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
        </p>
      ) : null}
      {originalText ? (
        <div className="result-card">
          <strong>Original Transcript</strong>
          <pre>{originalText}</pre>
        </div>
      ) : null}
      {translatedText ? (
        <div className="result-card">
          <strong>Translated Transcript</strong>
          <pre>{translatedText}</pre>
        </div>
      ) : null}
      {message ? <p className="status-line">{message}</p> : null}
    </div>
  );
}
