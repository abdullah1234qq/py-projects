import { DocumentWaveIcon, MicIcon, PdfIcon } from "./Icons.jsx";

const navItems = [
  { id: "dashboard", label: "Home", icon: DocumentWaveIcon },
  { id: "audio-pdf", label: "Audio PDF", icon: DocumentWaveIcon },
  { id: "pdf-audio", label: "PDF Audio", icon: PdfIcon },
  { id: "pdf-all-audio", label: "All Audio", icon: PdfIcon },
  { id: "realtime", label: "Realtime", icon: MicIcon }
];

export function Shell({ children, currentPage, setCurrentPage, deviceType, username, setUsername }) {
  return (
    <div className={`app-shell ${deviceType}`}>
      <aside className="sidebar">
        <div className="brand">Voice<span>2</span>PDF</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={currentPage === item.id ? "active" : ""}
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main>
        <div className="topbar">
          <div>
            <strong>Hello, {username || "Student"}</strong>
            <span>Let your voice do the work.</span>
          </div>
          <label className="name-field">
            <span>Name</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your name" />
          </label>
        </div>
        {children}
      </main>
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={currentPage === item.id ? "active" : ""}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
