import { useState } from "react";

import { Shell } from "./components/Shell.jsx";
import { useDeviceType } from "./hooks/useDeviceType.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { AudioToPdf } from "./pages/AudioToPdf.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { PdfToAudio } from "./pages/PdfToAudio.jsx";
import { PdfAllAudio } from "./pages/PdfAllAudio.jsx";
import { Realtime } from "./pages/Realtime.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [username, setUsername] = usePersistentState("voice2pdf.username", "Student");
  const deviceType = useDeviceType();

  const pages = {
    dashboard: <Dashboard setCurrentPage={setCurrentPage} username={username} />,
    "audio-pdf": <AudioToPdf />,
    "pdf-audio": <PdfToAudio />,
    "pdf-all-audio": <PdfAllAudio />,
    realtime: <Realtime />
  };

  return (
    <Shell
      currentPage={currentPage}
      deviceType={deviceType}
      setCurrentPage={setCurrentPage}
      setUsername={setUsername}
      username={username}
    >
      {pages[currentPage]}
    </Shell>
  );
}
