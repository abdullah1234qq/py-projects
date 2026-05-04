export function GlowButton({ children, tone = "blue", className = "", ...props }) {
  return (
    <button className={`glow-button glow-${tone} ${className}`} {...props}>
      {children}
    </button>
  );
}
