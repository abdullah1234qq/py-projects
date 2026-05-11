import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "./Icons.jsx";

function formatTime(seconds = 0) {
  if (!isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function AudioPlayer({ sourceUrl, file }) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const idRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    // create audio element once
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    function onLoaded() {
      setDuration(audio.duration || 0);
    }

    function onEnded() {
      setPlaying(false);
      setCurrent(0);
    }

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    // Listen to play events from other players to avoid duplicate playback
    function onExternalPlay(e) {
      const otherId = e?.detail?.id;
      if (otherId && otherId !== idRef.current) {
        audio.pause();
        setPlaying(false);
      }
    }

    window.addEventListener("voice2pdf-audio-play", onExternalPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      window.removeEventListener("voice2pdf-audio-play", onExternalPlay);
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (sourceUrl) {
      audio.src = sourceUrl;
    }
    // keep volume in sync
    audio.volume = volume;
  }, [sourceUrl, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function tick() {
      setCurrent(audio.currentTime || 0);
      rafRef.current = requestAnimationFrame(tick);
    }

    if (playing) {
      // notify other players to stop
      window.dispatchEvent(
        new CustomEvent("voice2pdf-audio-play", {
          detail: { id: idRef.current },
        }),
      );
      audio.play().catch(() => setPlaying(false));
      rafRef.current = requestAnimationFrame(tick);
    } else {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  function togglePlay() {
    setPlaying((p) => !p);
  }

  function onSeek(e) {
    const audio = audioRef.current;
    if (!audio) return;
    const v = Number(e.target.value);
    audio.currentTime = v;
    setCurrent(v);
  }

  function onVolume(e) {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const name = file?.name || "Generated audio";

  return (
    <div className="audio-player premium">
      <div className="player-left">
        <button
          className={`player-play ${playing ? "playing" : ""}`}
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          <PlayIcon />
        </button>
        <div className="waveform-anim" aria-hidden>
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>
        <div className="meta">
          <strong>{name}</strong>
          <small>
            {formatTime(current)} / {formatTime(duration)}
          </small>
        </div>
      </div>

      <div className="player-right">
        <input
          className="progress"
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.01}
          value={current}
          onChange={onSeek}
          aria-label="Seek"
        />
        <div className="controls-row">
          <div className="vol">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolume}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
