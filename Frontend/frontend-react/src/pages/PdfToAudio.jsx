import { useState } from "react";

import { api, downloadBlob, filenameFromHeaders } from "../api/client";
import { AudioPlayer } from "../components/AudioPlayer.jsx";
import { FileUploader } from "../components/FileUploader.jsx";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";

export function PdfToAudio() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioName, setAudioName] = useState("");
  const [language, setLanguage] = useState("English");
  const [busy, setBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function convert() {
    if (!file) {
      setMessage("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const response = await api.post("/pdf-to-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });
      setAudioUrl(URL.createObjectURL(response.data));
      setAudioName(filenameFromHeaders(response.headers, "voice2pdf-audio.mp3"));
      downloadBlob(response.data, filenameFromHeaders(response.headers, "voice2pdf-audio.mp3"));
      setMessage("Audio generated.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  async function generateAllAudio() {
    if (!file) {
      setMessage("Choose a PDF first.");
      return;
    }
    setZipBusy(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/pdf-to-all-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });
      downloadBlob(response.data, filenameFromHeaders(response.headers, "voice2pdf-all-audio.zip"));
      setMessage("All-language audio ZIP generated.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "ZIP generation failed.");
    } finally {
      setZipBusy(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader title="PDF to Audio" copy="Upload a PDF and listen to the extracted text." />
      <NeonHeroMark tone="green" />
      <FileUploader accept="application/pdf" label="Upload a PDF document" helper="Readable PDFs work best" onFile={setFile} />
      <div className="form-grid one">
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
      </div>
      {audioUrl ? <AudioPlayer sourceUrl={audioUrl} file={{ name: audioName }} duration="Ready" /> : null}
      <GlowButton tone="green" onClick={convert} disabled={busy}>
        {busy ? "Generating..." : "Generate Audio"}
      </GlowButton>
      <button className="secondary-action" onClick={generateAllAudio} disabled={zipBusy}>
        {zipBusy ? "Building ZIP..." : "Generate All Languages"}
      </button>
      {message ? <p className="status-line">{message}</p> : null}
    </div>
  );
}
