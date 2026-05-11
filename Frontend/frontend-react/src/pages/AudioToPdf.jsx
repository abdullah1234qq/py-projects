import { useMemo, useState } from "react";

import { AudioPlayer } from "../components/AudioPlayer.jsx";
import { FileUploader } from "../components/FileUploader.jsx";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { DownloadButton } from "../components/DownloadButton.jsx";
import { TranscriptCard } from "../components/TranscriptCard.jsx";
import { StatusAlert } from "../components/StatusAlert.jsx";

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
  const audioUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Backend returned an error",
        );
      }

      const url = data.pdf_url?.startsWith("http")
        ? data.pdf_url
        : `${BASE_URL}${data.pdf_url}`;
      setPdfUrl(url);
      setOriginalText(data.original_text || "");
      setTranslatedText(data.translated_text || "");
      setMessage("PDF generated.");
    } catch (error) {
      console.error("API Error:", error);
      setMessage(error.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader
        title="Audio to PDF"
        copy="Upload audio and receive a clean transcript PDF."
      />
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
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
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
          <input
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
          />
        </label>
      </div>

      {file ? <AudioPlayer file={file} sourceUrl={audioUrl} /> : null}

      <div className="action-row">
        <GlowButton onClick={convert} disabled={busy}>
          {busy ? "Converting..." : "Convert to PDF"}
        </GlowButton>

        <DownloadButton
          url={pdfUrl}
          filename={`${filename || "voice2pdf"}.pdf`}
        >
          Download PDF
        </DownloadButton>
      </div>

      {busy ? (
        <StatusAlert type="loading" message="Converting audio to PDF..." />
      ) : null}
      {message ? (
        <StatusAlert
          type={message.toLowerCase().includes("error") ? "error" : "success"}
          message={message}
        />
      ) : null}

      <div className="transcript-grid">
        {originalText ? (
          <TranscriptCard title="Original Transcript" content={originalText} />
        ) : null}
        {translatedText ? (
          <TranscriptCard
            title="Translated Transcript"
            content={translatedText}
            className="translated"
          />
        ) : null}
      </div>
    </div>
  );
}
