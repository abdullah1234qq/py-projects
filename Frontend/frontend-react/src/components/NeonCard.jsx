export function NeonCard({ children, tone = "blue", className = "" }) {
  return <section className={`neon-card card-${tone} ${className}`}>{children}</section>;
}
