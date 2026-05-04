import { useState } from "react";

import { GlowButton } from "../components/GlowButton.jsx";
import { LiveTranscriptViewer } from "../components/LiveTranscriptViewer.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { useRealtimeTranscription } from "../hooks/useRealtimeTranscription.js";

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function Realtime() {
  const [language, setLanguage] = useState("en");
  const realtime = useRealtimeTranscription(language);

  return (
    <div className="stream-page">
      <PageHeader title="Stream Audio to PDF" copy="Speak in real time and save the transcript." />
      <NeonHeroMark mode="mic" tone="green" />
      <h2><span>Speak.</span> We&apos;ll write.</h2>
      <div className="listening-bar">
        <span className={realtime.isListening ? "live-dot active" : "live-dot"} />
        <strong>{realtime.isListening ? "Listening..." : "Ready"}</strong>
        <span>{formatTime(realtime.elapsed)}</span>
      </div>
      <div className="stream-wave" aria-hidden="true">
        {Array.from({ length: 54 }).map((_, index) => (
          <span key={index} style={{ "--level": `${22 + ((index * 23) % 62)}%` }} />
        ))}
      </div>
      <div className="stream-controls">
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="en">EN</option>
          <option value="ur">UR</option>
          <option value="ar">AR</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="es">ES</option>
        </select>
        <GlowButton tone="green" className="round-control" onClick={realtime.isListening ? realtime.stop : realtime.start}>
          {realtime.isListening ? "Pause" : "Start"}
        </GlowButton>
        <button className="save-button" onClick={realtime.savePdf}>Save PDF</button>
      </div>
      <LiveTranscriptViewer transcript={realtime.transcript} />
      {realtime.error ? <p className="status-line error">{realtime.error}</p> : null}
    </div>
  );
}
