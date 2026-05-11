import { useState } from "react";

export function TranscriptCard({ title, content = "", lang = "", className = "" }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
      setCopied(false);
    }
  }

  return (
    <div className={`transcript-card modern ${className}`}>
      <div className="card-head">
        <div>
          <strong>{title}</strong>
          {lang ? <small className="lang-tag">{lang}</small> : null}
        </div>
        <div className="card-actions">
          <button className="copy-btn" onClick={copyText} aria-label="Copy transcript">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="card-body" role="region" aria-label={title}>
        <pre>{content || ""}</pre>
      </div>
    </div>
  );
}
