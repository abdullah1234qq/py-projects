import { DocumentWaveIcon, MicIcon } from "./Icons.jsx";

export function NeonHeroMark({ mode = "document", tone = "blue" }) {
  const Icon = mode === "mic" ? MicIcon : DocumentWaveIcon;

  return (
    <div className={`hero-mark hero-${tone}`}>
      <div className="ring ring-outer" />
      <div className="ring ring-middle" />
      <div className="ring ring-inner" />
      <Icon />
    </div>
  );
}
