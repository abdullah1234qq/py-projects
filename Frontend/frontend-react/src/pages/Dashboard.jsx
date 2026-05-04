import { ArrowIcon, DocumentWaveIcon, MicIcon, PdfIcon } from "../components/Icons.jsx";
import { NeonCard } from "../components/NeonCard.jsx";
import { NeonHeroMark } from "../components/NeonHeroMark.jsx";

const actions = [
  {
    id: "audio-pdf",
    title: "Audio to PDF",
    copy: "Convert audio files into PDF documents.",
    tone: "blue",
    icon: DocumentWaveIcon
  },
  {
    id: "pdf-audio",
    title: "PDF to Audio",
    copy: "Turn documents into natural audio.",
    tone: "green",
    icon: PdfIcon
  },
  {
    id: "realtime",
    title: "Realtime Transcription",
    copy: "Stream speech and save it as a PDF.",
    tone: "purple",
    icon: MicIcon
  }
];

export function Dashboard({ setCurrentPage, username }) {
  return (
    <div className="dashboard-grid">
      <section className="welcome-panel">
        <NeonHeroMark />
        <h1>Voice<span>2</span>PDF</h1>
        <p>Your Voice. Your PDF. Your Way.</p>
      </section>

      <section className="action-panel">
        <div className="section-title">
          <span>Hello, {username || "Student"}</span>
          <span>Choose an action</span>
        </div>
        <div className="action-list">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <NeonCard key={action.id} tone={action.tone}>
                <button className="action-card" onClick={() => setCurrentPage(action.id)}>
                  <span className={`icon-badge ${action.tone}`}>
                    <Icon />
                  </span>
                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.copy}</small>
                  </span>
                  <ArrowIcon />
                </button>
              </NeonCard>
            );
          })}
        </div>
      </section>

      <section className="recent-panel">
        <div className="section-title">
          <span>Recent Activity</span>
          <span>View All</span>
        </div>
        <div className="recent-item">
          <span className="icon-badge blue">
            <DocumentWaveIcon />
          </span>
          <div>
            <strong>History Lecture.wav</strong>
            <small>Audio to PDF</small>
          </div>
          <span className="success-dot">Done</span>
        </div>
      </section>
    </div>
  );
}
