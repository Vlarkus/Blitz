import "./color-picker.scss";
import ColorOption from "./color-option/color-option";
import ColorInput from "./color-input/color-input";

type ColorPickerProps = {
  /** Called whenever a color is chosen (swatch click or input commit) */
  onClick: (hex: string) => void;
  /** Optional palette; defaults to a Twitter-like set */
  colors?: string[];
  /** Optional initial value for the input */
  value?: string;
  className?: string;
  disabled?: boolean;
};

const DEFAULT_COLORS = [
  "#FF6900",
  "#FCB900",
  "#7BDCB5",
  "#00D084",
  "#8ED1FC",
  "#0693E3",
  "#ABB8C3",
  "#EB144C",
  "#F78DA7",
  "#9900EF",
];

export default function ColorPicker({
  onClick,
  colors = DEFAULT_COLORS,
  value,
  className,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div
      className={`color-picker${className ? " " + className : ""}`}
      role="group"
      aria-label="Color picker"
    >
      {colors.map((c) => (
        <ColorOption key={c} color={c} onClick={onClick} />
      ))}

      {/* Use the same single handler for manual entry */}
      <ColorInput
        value={value || "fail"}
        onChange={onClick}
        className="color-input"
        disabled={disabled}
      />
    </div>
  );
}
