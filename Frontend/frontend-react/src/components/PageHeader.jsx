export function PageHeader({ eyebrow, title, copy }) {
  return (
    <header className="page-header">
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h1>{title}</h1>
      {copy ? <p>{copy}</p> : null}
    </header>
  );
}
