import { useState } from "react";
import type { ControlPoint } from "../types/editorTypes";
import { useEditorStore } from "../editor/editorStore";
import { FaLock, FaLockOpen } from "react-icons/fa";

interface Props {
  trajId: string;
  point: ControlPoint;
  index: number;
}

export default function ControlPointCard({ trajId, point, index }: Props) {
  const {
    updateControlPoint,
    setSelectedTrajectoryId,
    setSelectedControlPointId,
    selectedControlPointId,
  } = useEditorStore();

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(point.name);

  const toggleLocked = () =>
    updateControlPoint(trajId, point.id, { isLocked: !point.isLocked });

  const isSelected = point.id === selectedControlPointId;

  const commitName = () => {
    const next = nameDraft.trim();
    updateControlPoint(trajId, point.id, {
      name: next.length ? next : point.name,
    });
    setEditing(false);
  };

  return (
    <div
      className={`control-point-card d-flex align-items-center justify-content-between px-2 py-1 ${
        isSelected ? "selected" : ""
      }`}
      style={{ userSelect: "none", cursor: "pointer" }}
      onClick={() => {
        setSelectedTrajectoryId(trajId);
        setSelectedControlPointId(point.id);
      }}
    >
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <span className="control-point-index-badge">{index + 1}</span>
        {editing ? (
          <input
            type="text"
            className="name-edit-input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              else if (e.key === "Escape") {
                setNameDraft(point.name);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="control-point-name text-truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            title={point.name}
          >
            {point.name}
          </span>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        <span
          className={`icon-btn lock ${point.isLocked ? "locked" : "unlocked"}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLocked();
          }}
          title={point.isLocked ? "Unlock" : "Lock"}
        >
          {point.isLocked ? <FaLock /> : <FaLockOpen />}
        </span>
      </div>
    </div>
  );
}
