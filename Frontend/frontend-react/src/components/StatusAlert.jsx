export function StatusAlert({ type = "info", message = "", children = null }) {
  return (
    <div className={`status-alert ${type}`} role="status">
      {type === "loading" ? (
        <div className="spinner" aria-hidden />
      ) : null}
      <div className="status-content">
        {children || <span>{message}</span>}
      </div>
    </div>
  );
}
