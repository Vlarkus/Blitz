import { useState, useRef } from "react";
import { Circle, Rect, Group, Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";

type Props = { trajId: string; cpId: string };

export default function ControlPointElement({ trajId, cpId }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));

  const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );
  const setSelectedTrajectoryId = useDataStore(
    (s) => s.setSelectedTrajectoryId
  );
  const cutTrajectoryAt = useDataStore((s) => s.cutTrajectoryAt);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const execute = useDataStore((s) => s.execute);

  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);

  const [hovered, setHovered] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  if (!cp || !traj) return null;

  const radius = Math.min((1 / scale) * 10, 2);
  const size = radius * 2;

  const innerRadius = radius * 0.6;
  const innerSize = size * 0.6;

  const isLast =
    traj.controlPoints.length > 0 &&
    traj.controlPoints[traj.controlPoints.length - 1].id === cp.id;

  const draggable = !cp.isLocked && !traj.isLocked && activeTool === "select";

  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;

    switch (activeTool) {
      case "remove":
        e.evt.preventDefault();
        e.target.stopDrag?.();
        removeControlPoint(trajId, cpId);
        setSelectedTrajectoryId(trajId);
        return;

      case "cut":
        cutTrajectoryAt(trajId, cpId);
        return;
    }

    // Store initial drag position for undo/redo
    if (activeTool === "select" && !cp?.isLocked && !traj?.isLocked) {
      dragStartPos.current = { x: cp!.x, y: cp!.y };
    }

    setSelectedControlPointId(cpId);
  };

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position();
    moveControlPoint(trajId, cpId, p.x, p.y);
  };

  const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position();
    const startPos = dragStartPos.current;
    dragStartPos.current = null;

    // Only push a command if position actually changed
    if (startPos && (startPos.x !== p.x || startPos.y !== p.y)) {
      execute({
        redo: () => {
          moveControlPoint(trajId, cpId, p.x, p.y);
        },
        undo: () => {
          moveControlPoint(trajId, cpId, startPos.x, startPos.y);
        },
      });
    }
  };

  // --- Robot hover preview (world-space) ---
  const robotStroke = Math.min((1 / scale) * 2.5, 0.5);
  const INCH_TO_M = 0.0254;

  const robotSizeM = 18 * INCH_TO_M; // 0.4572 m
  const robotRadiusM = (robotSizeM * Math.SQRT2) / 2; // 0.3232 m

  const robotHoverGhost =
    hovered && activeTool === "show_robot" ? (
      <Group
        x={cp.x}
        y={cp.y}
        rotation={cp.heading ? (cp.heading * 180) / Math.PI : 0}
        listening={false}
      >
        {/* Reach circle (9 in radius) */}
        <Circle
          radius={robotRadiusM}
          stroke="#ffffff"
          strokeWidth={robotStroke}
          // dash={[robotRadiusM * 0.25, robotRadiusM * 0.25]}
        />

        {/* Robot footprint (18 in × 18 in) */}
        <Rect
          x={-robotSizeM / 2}
          y={-robotSizeM / 2}
          width={robotSizeM}
          height={robotSizeM}
          stroke="#ffffff"
          strokeWidth={robotStroke}
          dash={[robotSizeM * 0.15, robotSizeM * 0.15]}
        />
        {/* Front indicator - shaft + arrowhead */}
        <Line
          points={[
            0,
            0, // Start at center
            robotSizeM * 0.45,
            0, // Shaft ENDPOINT like heading line
          ]}
          stroke="#ffffff"
          strokeWidth={robotStroke * 1.5}
          lineCap="round"
          lineJoin="round"
        />
        {/* Arrowhead */}
        <Line
          points={[
            robotSizeM * 0.45,
            0, // Arrow tip (matches shaft end)
            robotSizeM * 0.35,
            -robotSizeM * 0.08, // Left barb
            robotSizeM * 0.45,
            0, // Back to tip
            robotSizeM * 0.35,
            robotSizeM * 0.08, // Right barb
          ]}
          stroke="#ffffff"
          strokeWidth={robotStroke * 1.2}
          lineCap="round"
          lineJoin="round"
          closed
        />
      </Group>
    ) : null;

  // --- Outer shape ---
  const outer = cp.isEvent ? (
    <Rect
      name={`cp:${trajId}:${cpId}`}
      x={cp.x}
      y={cp.y}
      width={size}
      height={size}
      offsetX={size / 2}
      offsetY={size / 2}
      fill={traj.color}
      draggable={draggable}
      hitStrokeWidth={12}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() =>
        useDataStore.getState().setSelectedControlPointId(cpId)
      }
    />
  ) : (
    <Circle
      name={`cp:${trajId}:${cpId}`}
      x={cp.x}
      y={cp.y}
      radius={radius}
      fill={traj.color}
      draggable={draggable}
      hitStrokeWidth={12}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() =>
        useDataStore.getState().setSelectedControlPointId(cpId)
      }
    />
  );

  // --- Inner fill ---
  const innerSolid = cp.isEvent ? (
    <Rect
      x={cp.x}
      y={cp.y}
      width={innerSize}
      height={innerSize}
      offsetX={innerSize / 2}
      offsetY={innerSize / 2}
      fill="#ffffff"
      listening={false}
    />
  ) : (
    <Circle
      x={cp.x}
      y={cp.y}
      radius={innerRadius}
      fill="#ffffff"
      listening={false}
    />
  );

  const innerChecker = (
    <Group
      x={cp.x}
      y={cp.y}
      offsetX={innerSize / 2}
      offsetY={innerSize / 2}
      listening={false}
      clipFunc={(ctx) => {
        if (cp.isEvent) ctx.rect(0, 0, innerSize, innerSize);
        else ctx.arc(innerSize / 2, innerSize / 2, innerRadius, 0, Math.PI * 2);
      }}
    >
      <Rect
        x={0}
        y={0}
        width={innerSize / 2}
        height={innerSize / 2}
        fill="#000"
      />
      <Rect
        x={innerSize / 2}
        y={0}
        width={innerSize / 2}
        height={innerSize / 2}
        fill="#fff"
      />
      <Rect
        x={0}
        y={innerSize / 2}
        width={innerSize / 2}
        height={innerSize / 2}
        fill="#fff"
      />
      <Rect
        x={innerSize / 2}
        y={innerSize / 2}
        width={innerSize / 2}
        height={innerSize / 2}
        fill="#000"
      />
    </Group>
  );

  // --- Heading indicator ---
  const lineThicknessOuter = Math.min((1 / scale) * 5, 0.8);
  const lineThicknessInner = Math.min((1 / scale) * 2.5, 0.4);
  const lineLength = innerRadius * 0.6;

  const headingLine =
    cp.heading !== null ? (
      <Group>
        <Line
          x={cp.x}
          y={cp.y}
          points={[0, 0, lineLength, 0]}
          stroke="#ffffff"
          strokeWidth={lineThicknessOuter}
          lineCap="round"
          rotation={(cp.heading * 180) / Math.PI}
          listening={false}
        />
        <Line
          x={cp.x}
          y={cp.y}
          points={[0, 0, lineLength, 0]}
          stroke="#000000"
          strokeWidth={lineThicknessInner}
          lineCap="round"
          rotation={(cp.heading * 180) / Math.PI}
          listening={false}
        />
      </Group>
    ) : null;

  return (
    <>
      {robotHoverGhost}
      {outer}
      {isLast ? innerChecker : innerSolid}
      {headingLine}
    </>
  );
}
