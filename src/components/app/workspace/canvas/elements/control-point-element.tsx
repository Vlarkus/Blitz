import React from "react";
import { Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";

type Props = { trajId: string; cpId: string };

export default function ControlPointElement({ trajId, cpId }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));

  const scale = useEditorStore((s) => s.activeViewport.scale);

  if (!cp) return null;
  if (!traj) return null;

  const radius = Math.min((1 / scale) * 10, 2);

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position(); // world coords (layer is scaled)
    // TODO: snap logic here if needed
    useDataStore.getState().moveControlPoint(trajId, cpId, p.x, p.y);
  };

  const trajColor = traj.color;
  const innerFill = cp.isEvent ? "#DAA520" /* gold */ : "#eee";
  const innerRadius = radius * 0.6; // smaller, screen-relative

  return (
    <>
      {/* Outer circle: trajectory color */}
      <Circle
        name={`cp:${trajId}:${cpId}`}
        x={cp.x}
        y={cp.y}
        radius={radius}
        fill={trajColor}
        draggable={!cp.isLocked && !traj.isLocked}
        onDragMove={onDragMove}
        onMouseDown={() =>
          useDataStore.getState().setSelectedControlPointId(cpId)
        }
        onTouchStart={() =>
          useDataStore.getState().setSelectedControlPointId(cpId)
        }
      />
      {/* Inner circle: white or gold; purely visual (no events) */}
      <Circle
        x={cp.x}
        y={cp.y}
        radius={innerRadius}
        fill={innerFill}
        listening={false}
      />
    </>
  );
}
