import React, { useMemo } from "react";
import { useEditorStore } from "../editor/editorStore";
import TrajectoryCard from "./TrajectoryCard";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { FaPaintBrush, FaPlus, FaTrash } from "react-icons/fa";

export default function TrajectoriesPanel() {
  const {
    selectedTrajectoryId,
    selectedControlPointId,
    setSelectedTrajectoryId,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const ids = useMemo(() => trajectories.map((t) => t.id), [trajectories]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const newOrder = arrayMove(ids, oldIndex, newIndex);

    reorderTrajectories(newOrder);
  };

  return (
    <div className="trajectories-panel d-flex bg-dark flex-column h-100">
      <div
        className="trajectories-list flex-grow-1 bg-dark min-height-0 rounded-border overflow-auto p-2"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedTrajectoryId(null);
        }}
      >
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {trajectories.map((t, i) => (
              <TrajectoryCard key={t.id} traj={t} index={i} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="trajectory-panel-footer bg-dark justify-content-center align-items-center gap-2 px-2 py-1">
        <button
          className="btn square-btn"
          title="Add Trajectory"
          onClick={() =>
            addTrajectory({
              id: crypto.randomUUID(),
              name: "New Trajectory",
              color: "#ffffff",
              isLocked: false,
              isVisible: true,
              controlPoints: [],
            })
          }
        >
          <FaPlus />
        </button>

        <button
          className={`btn square-btn ${
            !selectedTrajectoryId ? "disabled" : ""
          }`}
          title="Delete Selected"
          onClick={() => {
            if (selectedControlPointId && selectedTrajectoryId) {
              removeControlPoint(selectedTrajectoryId, selectedControlPointId);
            } else if (selectedTrajectoryId) {
              removeTrajectory(selectedTrajectoryId);
            }
          }}
          disabled={!selectedTrajectoryId}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
