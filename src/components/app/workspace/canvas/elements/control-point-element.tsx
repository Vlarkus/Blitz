import { useEffect, useRef, useState } from "react";
import { Circle, Rect, Group, Line } from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useCanvasCoordinates } from "../canvas-coordinate-helper";

type Props = { trajId: string; cpId: string };

export default function ControlPointElement({ trajId, cpId }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));

  const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );
  const toggleSelectedControlPointId = useDataStore(
    (s) => s.toggleSelectedControlPointId
  );
  const setSelectedTrajectoryId = useDataStore(
    (s) => s.setSelectedTrajectoryId
  );
  const cutTrajectoryAt = useDataStore((s) => s.cutTrajectoryAt);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const execute = useDataStore((s) => s.execute);
  const getTrajectoryIdByControlPointId = useDataStore(
    (s) => s.getTrajectoryIdByControlPointId
  );

  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);
  const selectedControlPointIds = useDataStore(
    (s) => s.selectedControlPointIds
  );

  const [hovered, setHovered] = useState(false);
  const dragStartPos = useRef<Record<string, { x: number; y: number }> | null>(
    null
  );
  const dragAnchorPos = useRef<{ x: number; y: number } | null>(null);
  const dragDidMove = useRef(false);
  const selectionRingRef = useRef<Konva.Group | null>(null);

  if (!cp || !traj) return null;

  const radius = Math.min((1 / scale) * 10, 2);
  const size = radius * 2;

  const innerRadius = radius * 0.6;
  const innerSize = size * 0.6;
  const isSelected = selectedControlPointIds.includes(cpId);
  const selectionGap = Math.min((1 / scale) * 2.5, 0.6);
  const selectionStroke = isSelected ? Math.min((1 / scale) * 2, 0.5) : 0;

  useEffect(() => {
    const node = selectionRingRef.current;
    if (!node || !isSelected) return;
    const layer = node.getLayer();
    if (!layer) return;

    const anim = new Konva.Animation((frame) => {
      const t = (frame?.time ?? 0) / 1000;
      node.rotation((t * 10) % 360);
    }, layer);

    anim.start();
    return () => {
      anim.stop();
    };
  }, [isSelected]);

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

    if (activeTool === "select") {
      const shift = e.evt.shiftKey;
      const alreadySelected = selectedControlPointIds.includes(cpId);

      if (shift) {
        toggleSelectedControlPointId(cpId);
      } else if (!alreadySelected) {
        setSelectedControlPointId(cpId);
      }

      if (!shift && !cp?.isLocked && !traj?.isLocked) {
        const idsToMove = alreadySelected
          ? selectedControlPointIds
          : [cpId];
        const startPositions: Record<string, { x: number; y: number }> = {};
        idsToMove.forEach((id) => {
          const tId = getTrajectoryIdByControlPointId(id);
          if (!tId) return;
          const cpData = useDataStore.getState().getControlPoint(tId, id);
          if (!cpData) return;
          startPositions[id] = { x: cpData.x, y: cpData.y };
        });
        dragStartPos.current = startPositions;
        dragAnchorPos.current = { x: cp.x, y: cp.y };
        dragDidMove.current = false;
      }
    }
  };

  const onDragMove = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position();
    if (!dragStartPos.current || !dragAnchorPos.current) {
      moveControlPoint(trajId, cpId, p.x, p.y);
      return;
    }

    const dx = p.x - dragAnchorPos.current.x;
    const dy = p.y - dragAnchorPos.current.y;
    if (!dragDidMove.current && Math.hypot(dx, dy) > 0.001) {
      dragDidMove.current = true;
    }
    Object.entries(dragStartPos.current).forEach(([id, start]) => {
      const tId = getTrajectoryIdByControlPointId(id);
      if (!tId) return;
      moveControlPoint(tId, id, start.x + dx, start.y + dy);
    });
  };

  const onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool !== "select") return;
    if (e.evt.button !== 0) return;
    if (e.evt.shiftKey) return;
    if (dragDidMove.current) return;

    setSelectedControlPointId(cpId);
  };

  const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const p = e.target.position();
    const startPos = dragStartPos.current;
    const anchor = dragAnchorPos.current;
    dragStartPos.current = null;
    dragAnchorPos.current = null;

    // Only push a command if position actually changed
    if (startPos && anchor) {
      const dx = p.x - anchor.x;
      const dy = p.y - anchor.y;
      if (dx === 0 && dy === 0) return;
      const endPos: Record<string, { x: number; y: number }> = {};
      Object.entries(startPos).forEach(([id, pos]) => {
        endPos[id] = { x: pos.x + dx, y: pos.y + dy };
      });
      execute({
        redo: () => {
          Object.entries(endPos).forEach(([id, pos]) => {
            const tId = getTrajectoryIdByControlPointId(id);
            if (!tId) return;
            moveControlPoint(tId, id, pos.x, pos.y);
          });
        },
        undo: () => {
          Object.entries(startPos).forEach(([id, pos]) => {
            const tId = getTrajectoryIdByControlPointId(id);
            if (!tId) return;
            moveControlPoint(tId, id, pos.x, pos.y);
          });
        },
      });
    }
  };

  // --- Robot hover preview (world-space) ---
  const robotStroke = Math.min((1 / scale) * 2.5, 0.5);
  // const INCH_TO_M = 0.0254;

  const { widthM, heightM } = useEditorStore((s) => s.robotConfig);
  const robotRadiusM = Math.sqrt(widthM * widthM + heightM * heightM) / 2;

  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const transform = useCanvasCoordinates(canvasConfig);

  const robotHoverGhost =
    hovered && activeTool === "show_robot" ? (
      <Group
        x={cp.x}
        y={cp.y}
        rotation={cp.heading ? transform.mapHeading(cp.heading) : 0}
        listening={false}
      >
        {/* Reach circle (circumcribed) */}
        <Circle
          radius={robotRadiusM}
          stroke="#ffffff"
          strokeWidth={robotStroke}
        // dash={[robotRadiusM * 0.25, robotRadiusM * 0.25]}
        />

        {/* Robot footprint (Configurable) */}
        <Rect
          x={-widthM / 2}
          y={-heightM / 2}
          width={widthM}
          height={heightM}
          stroke="#ffffff"
          strokeWidth={robotStroke}
          dash={[widthM * 0.15, heightM * 0.15]}
        />
        {/* Front indicator - shaft + arrowhead */}
        <Line
          points={[
            0,
            0, // Start at center
            widthM * 0.45,
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
            widthM * 0.45,
            0, // Arrow tip (matches shaft end)
            widthM * 0.35,
            -widthM * 0.08, // Left barb
            widthM * 0.45,
            0, // Back to tip
            widthM * 0.35,
            widthM * 0.08, // Right barb
          ]}
          stroke="#ffffff"
          strokeWidth={robotStroke * 1.2}
          lineCap="round"
          lineJoin="round"
          closed
        />
      </Group>
    ) : null;

  // --- Selection ring ---
  const selectionRing = isSelected ? (
    <Group x={cp.x} y={cp.y} ref={selectionRingRef} listening={false}>
      {cp.isEvent ? (
        <Rect
          x={0}
          y={0}
          width={size + selectionGap * 2}
          height={size + selectionGap * 2}
          offsetX={(size + selectionGap * 2) / 2}
          offsetY={(size + selectionGap * 2) / 2}
          stroke="#ffffff"
          strokeWidth={selectionStroke}
          dash={[selectionGap * 2, selectionGap * 1.2]}
        />
      ) : (
        <Circle
          x={0}
          y={0}
          radius={radius + selectionGap}
          stroke="#ffffff"
          strokeWidth={selectionStroke}
          dash={[selectionGap * 2, selectionGap * 1.2]}
        />
      )}
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
      onMouseUp={onMouseUp}
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
      onMouseUp={onMouseUp}
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
      {selectionRing}
    </>
  );
}
