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
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ControlPointCard from "./ControlPointCard";

interface Props {
  traj: Trajectory;
  index: number;
}

export default function TrajectoryCard({ traj }: Props) {
  const {
    setSelectedTrajectoryId,
    selectedTrajectoryId,
    updateTrajectory, // <-- use this from the store
  } = useEditorStore();

  // dnd-kit sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: traj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(traj.name);

  const isSelected = traj.id === selectedTrajectoryId;

  const commitName = () => {
    const next = nameDraft.trim();
    updateTrajectory(traj.id, { name: next.length ? next : traj.name });
    setEditing(false);
  };

  return (
    <div
      className="d-flex flex-column"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div
        className={`trajectory-card d-flex justify-content-between align-items-center px-2 py-1 ${
          isSelected ? "selected" : ""
        } ${!expanded ? "collapsed" : ""}`}
        onClick={() => setSelectedTrajectoryId(traj.id)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {/* LEFT: name + toggle */}
        <div className="d-flex align-items-center gap-2 flex-grow-1">
          <button
            className="toggle-btn btn btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            title={expanded ? "Collapse" : "Expand"}
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
              title={traj.name}
            >
              {traj.name}
            </span>
          )}
        </div>

        {/* RIGHT: eye, lock, drag */}
        <div className="d-flex align-items-center gap-2">
          <span
            className={`icon-btn eye ${traj.isVisible ? "open" : "closed"}`}
            onClick={(e) => {
              e.stopPropagation();
              updateTrajectory(traj.id, { isVisible: !traj.isVisible });
            }}
            title={traj.isVisible ? "Hide" : "Show"}
          >
            {traj.isVisible ? <FaEye /> : <FaEyeSlash />}
          </span>

          <span
            className={`icon-btn lock ${traj.isLocked ? "locked" : "unlocked"}`}
            onClick={(e) => {
              e.stopPropagation();
              updateTrajectory(traj.id, { isLocked: !traj.isLocked });
            }}
            title={traj.isLocked ? "Unlock" : "Lock"}
          >
            {traj.isLocked ? <FaLock /> : <FaLockOpen />}
          </span>

          <span
            className="drag-handle icon-btn"
            {...listeners}
            onMouseDown={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <FaGripLines />
          </span>
        </div>
      </div>

      {/* Control Points */}
      {expanded && (
        <div className="control-point-list">
          {traj.controlPoints.map((p, i) => (
            <ControlPointCard key={p.id} trajId={traj.id} point={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
