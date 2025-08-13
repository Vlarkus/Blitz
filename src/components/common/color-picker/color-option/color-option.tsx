import { useEffect, useRef, useState } from "react";
import "./color-option.scss";

type ColorOptionProps = {
  color: string;
  onClick: (color: string) => void;
};

export default function ColorOption({ color, onClick }: ColorOptionProps) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsActive(true);
    onClick(color);
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`color-option${isActive ? " active" : ""}`}
      style={{ backgroundColor: color, color }}
      onClick={handleClick}
      role="button"
      aria-label={`Select color ${color}`}
    />
  );
}
