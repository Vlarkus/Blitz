import React from "react";
import { Line, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";
import { mixColors } from "../../../../../utils/utils";

type Props = {
  trajId: string;
  cpId: string;
  which: "in" | "out";
};

export default function HandleElement({ trajId, cpId, which }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const setHandlePosition = useDataStore((s) => s.setHandlePosition);

  if (!cp) return null;
  if (!traj) return null;

  // Handles are stored in polar relative to CP (r, thetaRad)
  const h = which === "in" ? cp.handleIn : cp.handleOut;
  const hx = cp.x + h.r * Math.cos(h.theta);
  const hy = cp.y + h.r * Math.sin(h.theta);

  // ---- visibility condition placeholder ----
  const showHandle = true; // TODO: replace with your own condition(s)
  if (!showHandle) return null;

  const strokeW = 1 / scale;
  const radius = Math.min((1 / scale) * 5, 1);

  const handleColor = "#f0f0f0";

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position(); // world coords (layer scaled)
    // Optional: apply snapping here if needed
    setHandlePosition(trajId, cpId, which, { type: "absolute", x, y }); // store converts to polar internally
  };

  return (
    <>
      {/* Line from CP to handle (purely visual) */}
      <Line
        points={[hx, hy, cp.x, cp.y]}
        strokeWidth={strokeW}
        stroke={handleColor}
        dash={[0.2, 0.2]}
        listening={false}
      />
      {/* Draggable handle dot */}
      <Circle
        x={hx}
        y={hy}
        radius={radius}
        fill={handleColor}
        draggable={!cp.isLocked && !traj.isLocked}
        onDragMove={onDragMove}
        // don't steal CP selection; only the dot is draggable
      />
    </>
  );
}
