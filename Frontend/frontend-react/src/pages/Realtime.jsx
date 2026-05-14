import { useEffect, useRef, useState } from "react";

import { API_URL, api } from "../api/client";
import { GlowButton } from "../components/GlowButton.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { AudioPlayer } from "../components/AudioPlayer.jsx";
import { DownloadButton } from "../components/DownloadButton.jsx";
import { TranscriptCard } from "../components/TranscriptCard.jsx";
import { StatusAlert } from "../components/StatusAlert.jsx";

export function Realtime() {
  const [language, setLanguage] = useState("English");
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingError, setRecordingError] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      mediaRecorderRef.current?.stop();
    };
  }, []);

  async function startRecording() {
    setRecordingError("");
    setMessage("");
    setOriginalText("");
    setTranslatedText("");
    setAudioUrl("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks = [];

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        setAudioChunks(chunks);
      });

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      setRecordingError("Unable to access microphone.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }

  async function translateSpeech() {
    if (!audioChunks.length) {
      setMessage("Record audio before translating.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "realtime.webm");
      formData.append("language", language);

      const response = await api.post("/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = `${API_URL}${response.data.audio_url}`;
      setAudioUrl(url);
      setOriginalText(response.data.original_text || "");
      setTranslatedText(response.data.translated_text || "");
      setMessage("Realtime translation complete.");
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          error.message ||
          "Realtime conversion failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="work-page">
      <PageHeader
        title="Realtime Speech"
        copy="Record live speech, translate it, and download the audio."
      />
      <NeonHeroMark mode="mic" tone="green" />
      <div className="form-grid one">
        <label>
          <span>Target Language</span>
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
      </div>
      <div className="record-controls">
        <GlowButton
          tone={isRecording ? "red" : "green"}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </GlowButton>
        <GlowButton onClick={translateSpeech} disabled={isRecording || loading}>
          {loading ? "Translating..." : "Translate Audio"}
        </GlowButton>
      </div>

      {audioUrl ? (
        <div className="audio-preview">
          <AudioPlayer sourceUrl={audioUrl} />
          <DownloadButton
            url={audioUrl}
            filename="realtime-translation.mp3"
            tone="green"
          >
            Download Audio
          </DownloadButton>
        </div>
      ) : null}

      {originalText ? (
        <TranscriptCard title="Recognized Text" content={originalText} />
      ) : null}
      {translatedText ? (
        <TranscriptCard title="Translated Text" content={translatedText} />
      ) : null}
      {recordingError ? (
        <p className="status-line error">{recordingError}</p>
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
