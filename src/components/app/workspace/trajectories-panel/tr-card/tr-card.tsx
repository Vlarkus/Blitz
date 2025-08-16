import React from "react";
import "./tr-card.scss";
import { EditableLabel } from "../../../../common/editable-label";

type TrCardProps = {
  name?: string;
  visible?: boolean;
  locked?: boolean;

  /** Optional handlers to wire later */
  onToggleVisible?: () => void;
  onToggleLocked?: () => void;
  onToggleExpand?: (expanded: boolean) => void;
};

export default function TrCard({
  name,
  visible,
  locked,
  onToggleVisible,
  onToggleLocked,
  onToggleExpand,
}: TrCardProps) {
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    onToggleExpand?.(next);
  };

  const handleToggleVisible = () => {
    onToggleVisible?.();
  };

  const handleToggleLocked = () => {
    onToggleLocked?.();
  };

  return (
    <div className="tr-card" role="group" aria-label="Trajectory card">
      <div className="left-half">
        <button
          type="button"
          className={`tr-card-expander ${expanded ? "is-open" : ""}`}
          aria-label={
            expanded ? "Collapse control points" : "Expand control points"
          }
          onClick={toggleExpand}
        >
          {/* Chevron icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 10l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {/* Name */}
        <div className="tr-card-name">
          <EditableLabel<string>
            value={name!}
            onCommit={(next) => console.log("Rename trajectory to:", next)}
            ariaLabel="Trajectory name"
            className="el"
            labelClassName="el-label"
            inputClassName="el-input"
          />
        </div>
      </div>

      <div className="right-half">
        {/* Visible toggle (eye) */}
        <button
          type="button"
          className={`tr-card-icon ${visible ? "is-on" : "is-off"}`}
          onClick={handleToggleVisible}
          aria-label={visible ? "Hide trajectory" : "Show trajectory"}
          title={visible ? "Visible" : "Hidden"}
        >
          {/* Eye / Eye-off (simple inline SVG) */}
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M17.94 17.94C16.12 19.24 14.15 20 12 20 5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.06M22.94 12s-1.34 2.5-3.5 4.44M3 3l18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </button>
        {/* Lock toggle */}
        <button
          type="button"
          className={`tr-card-icon ${locked ? "is-on" : "is-off"}`}
          onClick={handleToggleLocked}
          aria-label={locked ? "Unlock trajectory" : "Lock trajectory"}
          title={locked ? "Locked" : "Unlocked"}
        >
          {locked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 10V7a5 5 0 0 1 9.5-2M6 10h12v10H6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
