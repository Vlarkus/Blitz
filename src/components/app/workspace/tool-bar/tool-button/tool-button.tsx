import "./tool-button.scss";
import React from "react";

interface ToolButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function ToolButton({
  isActive,
  onClick,
  children,
}: ToolButtonProps) {
  return (
    <button
      className={`tool-button ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
