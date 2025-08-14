import "./radio-button-group.scss";

type Option = { label: string; value: string };

type Props = {
  name: string;
  options: Option[]; // e.g. [{label:'A', value:'a'}, ...]
  value: string; // controlled selected value
  onChange: (value: string) => void;
  className?: string; // optional wrapper class
};

export default function RadioButtonGroup({
  name,
  options,
  value,
  onChange,
  className,
}: Props) {
  return (
    <div
      className={`radio-group ${className ?? ""}`}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={`radio-btn ${value === opt.value ? "is-active" : ""}`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="radio-label">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
