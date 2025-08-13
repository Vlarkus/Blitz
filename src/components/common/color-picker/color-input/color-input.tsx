import { EditableLabel } from "../../editable-label";
import "./color-input.scss";

type Props = {
  value: string; // e.g. "#ff8800" or "ff8800"
  onChange: (hex: string) => void; // emits with leading '#'
  className?: string;
  disabled?: boolean;
};

export default function ColorInput({
  value,
  onChange,
  className = "",
  disabled = false,
}: Props) {
  // show without leading '#'
  const display = (value || "").replace(/^#/, "").slice(0, 6);

  const handleCommit = (next: string | number) => {
    const text = String(next);
    const cleaned = text.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    onChange("#" + cleaned.toLowerCase());
  };

  return (
    <div
      className={`color-input ${className}`}
      aria-disabled={disabled || undefined}
    >
      <span className="hash" aria-hidden>
        #
      </span>
      <EditableLabel
        value={display}
        onCommit={handleCommit}
        disabled={disabled}
        ariaLabel="Hex color"
        className="hex-field"
        commitOnBlur={true}
        autoSelect={true}
      />
    </div>
  );
}
