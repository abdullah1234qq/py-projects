import { useRef, useState } from "react";
import AudioRecord from "react-native-audio-record";

import { WS_URL, textToPdfAndSave } from "../api";

export function useRealtimeStream(language = "en") {
  const [listening, setListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [segments, setSegments] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);

  const transcript = segments.map((segment) => segment.text).filter(Boolean).join(" ");

  function configureAudio() {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "voice2pdf-stream.wav"
    });
  }

  function start() {
    if (listening) {
      return;
    }
    setMessage("");
    setSegments([]);
    configureAudio();

    try {
      const socket = new WebSocket(`${WS_URL}/ws/audio`);
      socketRef.current = socket;

      socket.onopen = () => {
        try {
          socket.send(JSON.stringify({ type: "config", language, mimeType: "audio/l16;rate=16000" }));
          AudioRecord.on("data", (data) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "audio", encoding: "base64", audio: data, mimeType: "audio/l16;rate=16000" }));
            }
          });
          AudioRecord.start();
          startedAtRef.current = Date.now();
          timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
          setListening(true);
        } catch (err) {
          setMessage(`✗ Failed to start audio: ${err.message}`);
        }
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "transcript") {
            setSegments((current) => {
              const next = current.filter((segment) => segment.sequence !== payload.sequence);
              return [...next, { sequence: payload.sequence, text: payload.text }].sort((a, b) => a.sequence - b.sequence);
            });
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      socket.onerror = (event) => {
        setMessage(`✗ WebSocket error: ${event.message || "Connection lost"}`);
        setListening(false);
      };

      socket.onclose = () => {
        setListening(false);
      };
    } catch (err) {
      setMessage(`✗ Failed to connect: ${err.message}`);
    }
  }

  async function stop() {
    if (!listening) {
      return;
    }
    await AudioRecord.stop();
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "stop" }));
      socketRef.current.close();
    }
    clearInterval(timerRef.current);
    setListening(false);
  }

  async function savePdf() {
    try {
      const path = await textToPdfAndSave(transcript);
      setMessage(`✓ Saved to ${path}`);
    } catch (error) {
      setMessage(`✗ ${error.message}`);
    }
  }

  return { elapsed, listening, message, savePdf, start, stop, transcript };
}
