import { PlayIcon } from "./Icons.jsx";

export function AudioPlayer({ file, sourceUrl, duration = "03:45" }) {
  const name = file?.name || "Generated audio";

  return (
    <div className="audio-player">
      <div className="play-dot" aria-hidden="true">
        <PlayIcon />
      </div>
      <div className="waveform" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} style={{ "--level": `${24 + ((index * 17) % 48)}%` }} />
        ))}
      </div>
      <div className="audio-meta">
        <strong>{name}</strong>
        <span>{duration}</span>
      </div>
      {sourceUrl ? <audio controls src={sourceUrl} /> : null}
    </div>
  );
}
