import React from "react";
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

  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);

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

    // Default (select) behavior
    setSelectedControlPointId(cpId);
  };

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position();
    useDataStore.getState().moveControlPoint(trajId, cpId, p.x, p.y);
  };

  // Outer shape (event -> square, else circle)
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
      onMouseDown={onMouseDown}
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
      onMouseDown={onMouseDown}
      onTouchStart={() =>
        useDataStore.getState().setSelectedControlPointId(cpId)
      }
    />
  );

  // Inner content: checker (2×2) if last; else solid white
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
        if (cp.isEvent) {
          // square clip
          ctx.rect(0, 0, innerSize, innerSize);
        } else {
          // circle clip
          ctx.arc(innerSize / 2, innerSize / 2, innerRadius, 0, Math.PI * 2);
        }
      }}
    >
      {/* 2×2 tiles: TL black, TR white, BL white, BR black */}
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

  // --- Heading direction indicator (inside inner white circle/square) ---
  const lineThicknessOuter = Math.min((1 / scale) * 5, 0.8); // white outline
  const lineThicknessInner = Math.min((1 / scale) * 2.5, 0.4); // black core
  const lineLength = innerRadius * 0.6;

  const headingLine =
    cp.heading !== null ? (
      <Group>
        {/* Outer white line (outline) */}
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

        {/* Inner black line (actual direction) */}
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
      {outer}
      {isLast ? innerChecker : innerSolid}
      {headingLine}
    </>
  );
}
