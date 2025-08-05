import React, { useMemo } from "react";
import { useEditorStore } from "../store/editorStore";
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

export default function TrajectoriesPanel() {
  const { trajectories, reorderTrajectories } = useEditorStore();

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
        className="trajectories-list flex-grow-1 bg-dark rounded-border overflow-auto p-2"
        style={{ minHeight: 0 }}
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

      <div
        className="trajectory-panel-footer bg-dark d-flex justify-content-center align-items-center gap-2"
        style={{ height: 40 }}
      >
        <button className="btn btn-outline-dark square-btn">1</button>
        <button className="btn btn-outline-dark square-btn">2</button>
      </div>
    </div>
  );
}
