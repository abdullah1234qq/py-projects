import { useRef, useState } from "react";

import { api, downloadBlob, filenameFromHeaders, wsUrl } from "../api/client";

function pickMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return types.find((type) => window.MediaRecorder?.isTypeSupported(type)) || "";
}

export function useRealtimeTranscription(language = "en") {
  const [status, setStatus] = useState("idle");
  const [segments, setSegments] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);

  const transcript = segments.map((segment) => segment.text).filter(Boolean).join(" ");

  async function start() {
    if (status === "listening") {
      return;
    }
    setError("");
    setSegments([]);
    setElapsed(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const socket = new WebSocket(wsUrl("/ws/audio"));
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    streamRef.current = stream;
    socketRef.current = socket;
    recorderRef.current = recorder;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "config", language, mimeType: mimeType || "audio/webm" }));
      recorder.start(1000);
      startedAtRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 1000);
      setStatus("listening");
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "transcript") {
        setSegments((current) => {
          const next = current.filter((segment) => segment.sequence !== payload.sequence);
          return [...next, { sequence: payload.sequence, text: payload.text }].sort(
            (a, b) => a.sequence - b.sequence
          );
        });
      }
    };

    socket.onerror = () => {
      setError("WebSocket connection failed.");
      setStatus("error");
    };

    socket.onclose = () => {
      if (status !== "idle") {
        setStatus("idle");
      }
    };

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(await event.data.arrayBuffer());
      }
    };
  }

  function stop() {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "stop" }));
      socketRef.current.close();
    }
    window.clearInterval(timerRef.current);
    setStatus("idle");
  }

  async function savePdf() {
    const response = await api.post(
      "/text-to-pdf",
      { text: transcript || "No transcript captured yet.", title: "Live Voice2PDF Transcript" },
      { responseType: "blob" }
    );
    downloadBlob(response.data, filenameFromHeaders(response.headers, "live-transcript.pdf"));
  }

  return {
    elapsed,
    error,
    isListening: status === "listening",
    savePdf,
    start,
    status,
    stop,
    transcript
  };
}
