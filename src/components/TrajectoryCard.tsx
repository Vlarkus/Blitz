import React, { useState } from "react";
import { useEditorStore } from "../store/editorStore";
import type { Trajectory } from "../types/editorTypes";
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaLockOpen,
  FaGripLines,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

interface Props {
  traj: Trajectory;
  index: number;
}

export default function TrajectoryCard({ traj, index }: Props) {
  const {
    setTrajectoryVisibility,
    setTrajectoryLock,
    setSelectedTrajectoryId,
    selectedTrajectoryId,
    renameTrajectory,
  } = useEditorStore();

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(traj.name);

  const isSelected = traj.id === selectedTrajectoryId;

  const commitName = () => {
    renameTrajectory(traj.id, nameDraft.trim() || traj.name);
    setEditing(false);
  };

  return (
    <div
      className={`trajectory-card d-flex justify-content-between align-items-center px-2 py-1 ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => setSelectedTrajectoryId(traj.id)}
    >
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <button
          className="toggle-btn btn btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <FaChevronDown /> : <FaChevronRight />}
        </button>

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
                setNameDraft(traj.name);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="trajectory-name text-truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {traj.name}
          </span>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        <span
          className={`icon-btn eye ${traj.isVisible ? "open" : "closed"}`}
          onClick={(e) => {
            e.stopPropagation();
            setTrajectoryVisibility(traj.id, !traj.isVisible);
          }}
        >
          {traj.isVisible ? <FaEye /> : <FaEyeSlash />}
        </span>

        <span
          className={`icon-btn lock ${traj.isLocked ? "locked" : "unlocked"}`}
          onClick={(e) => {
            e.stopPropagation();
            setTrajectoryLock(traj.id, !traj.isLocked);
          }}
        >
          {traj.isLocked ? <FaLock /> : <FaLockOpen />}
        </span>

        <span
          className="drag-handle icon-btn"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FaGripLines />
        </span>
      </div>
    </div>
  );
}
