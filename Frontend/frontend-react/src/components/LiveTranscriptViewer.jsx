export function LiveTranscriptViewer({ transcript }) {
  return (
    <section className="transcript-card">
      <div className="section-title">
        <span>Live Preview</span>
        <span className="edit-mark">Edit</span>
      </div>
      <p>{transcript || "Your real-time transcript will appear here as audio chunks are processed."}</p>
    </section>
  );
}
