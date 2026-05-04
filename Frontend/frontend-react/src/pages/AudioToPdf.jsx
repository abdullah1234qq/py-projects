import { useMemo, useState } from "react";

import { api, downloadBlob, filenameFromHeaders } from "../api/client";
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
      const response = await api.post("/audio-to-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });
      downloadBlob(response.data, filenameFromHeaders(response.headers, "voice2pdf-transcript.pdf"));
      setMessage("PDF generated and downloaded.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Conversion failed.");
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
      {message ? <p className="status-line">{message}</p> : null}
    </div>
  );
}
