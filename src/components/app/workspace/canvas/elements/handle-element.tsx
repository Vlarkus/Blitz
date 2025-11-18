import { Line, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";

type Props = {
  trajId: string;
  cpId: string;
  which: "in" | "out";
};

export default function HandleElement({ trajId, cpId, which }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setHandlePosition = useDataStore((s) => s.setHandlePosition);

  if (!cp || !traj) return null;

  // Determine first/last CP in trajectory
  const cps = traj.controlPoints;
  const idx = cps.findIndex((c) => c.id === cpId);
  const isFirst = idx === 0;
  const isLast = idx === cps.length - 1;

  // Handles (polar relative to CP)
  const h = which === "in" ? cp.handleIn : cp.handleOut;
  const hx = cp.x + h.r * Math.cos(h.theta);
  const hy = cp.y + h.r * Math.sin(h.theta);

  // Visibility:
  // - hide IN handle on first CP
  // - hide OUT handle on last CP
  // - hide any handle that is marked linear
  const showHandle = !(
    (which === "in" && isFirst) ||
    (which === "out" && isLast) ||
    h.isLinear
  );
  if (!showHandle) return null;
  const strokeW = 1 / scale;
  const radius = Math.min((1 / scale) * 5, 1);

  const handleColor = "#f0f0f0";

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position(); // world coords (layer scaled)
    // Optional: apply snapping here if needed
    setHandlePosition(trajId, cpId, which, { type: "absolute", x, y }); // store converts to polar internally
  };

  const draggable = !cp.isLocked && !traj.isLocked && activeTool === "select";

  return (
    <>
      {/* Line from CP to handle (purely visual) */}
      <Line
        points={[hx, hy, cp.x, cp.y]}
        strokeWidth={strokeW}
        stroke={handleColor}
        dash={[0.05, 0.05]}
        listening={false}
      />
      {/* Draggable handle dot */}
      <Circle
        x={hx}
        y={hy}
        radius={radius}
        fill={handleColor}
        draggable={draggable}
        onDragMove={onDragMove}
        // don't steal CP selection; only the dot is draggable
      />
    </>
  );
}
