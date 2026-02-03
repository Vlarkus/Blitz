import { useEffect, useRef } from "react";
import { Circle, Rect, Group, Line } from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useDataStore } from "../../../../../models/dataStore";
import { useEditorStore } from "../../../../../editor/editor-store";
import {
  CanvasCoordinateSystem,
  useCanvasCoordinates,
} from "../canvas-coordinate-helper";

type Props = { trajId: string; cpId: string };

const ROBOT_HOVER_FADE_MS = 350;

export default function ControlPointElement({ trajId, cpId }: Props) {
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));

  const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId,
  );
  const toggleSelectedControlPointId = useDataStore(
    (s) => s.toggleSelectedControlPointId,
  );
  const setSelectedTrajectoryId = useDataStore(
    (s) => s.setSelectedTrajectoryId,
  );
  const cutTrajectoryAt = useDataStore((s) => s.cutTrajectoryAt);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const execute = useDataStore((s) => s.execute);
  const getHandlePosition = useDataStore((s) => s.getHandlePosition);
  const getTrajectoryIdByControlPointId = useDataStore(
    (s) => s.getTrajectoryIdByControlPointId,
  );

  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);
  const { widthM, heightM } = useEditorStore((s) => s.robotConfig);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const hoveredElementName = useEditorStore((s) => s.hoveredElementName);
  const selectedControlPointIds = useDataStore(
    (s) => s.selectedControlPointIds,
  );
  const setHoveredElementName = useEditorStore((s) => s.setHoveredElementName);
  const hoverClearTimer = useRef<number | null>(null);
  const transform = useCanvasCoordinates(canvasConfig);
  const coordSys = new CanvasCoordinateSystem(canvasConfig);

  const dragStartPos = useRef<Record<string, { x: number; y: number }> | null>(
    null,
  );
  const dragAnchorPos = useRef<{ x: number; y: number } | null>(null);
  const dragDidMove = useRef(false);
  const selectionRingRectRef = useRef<Konva.Rect | null>(null);
  const selectionRingCircleRef = useRef<Konva.Circle | null>(null);

  const radius = Math.min((1 / scale) * 10, 2);
  const size = radius * 2;

  const innerRadius = radius * 0.6;
  const innerSize = size * 0.6;
  const isSelected = selectedControlPointIds.includes(cpId);
  const selectionGap = Math.min((1 / scale) * 2.5, 0.6);
  const selectionStroke = isSelected ? Math.min((1 / scale) * 2, 0.5) : 0;
  const selectionRingSize = size + selectionGap * 2;
  const selectionRingRadius = radius + selectionGap;
  const selectionPerimeter = cp?.isEvent
    ? 4 * selectionRingSize
    : 2 * Math.PI * selectionRingRadius;
  const targetDashCycle = Math.max(selectionGap * 3.2, 0.001);
  const dashRepeatCount = Math.max(
    8,
    Math.round(selectionPerimeter / targetDashCycle),
  );
  const selectionDashCycle = selectionPerimeter / dashRepeatCount;
  const selectionDash: [number, number] = [
    selectionDashCycle / 2,
    selectionDashCycle / 2,
  ];

  useEffect(() => {
    return () => {
      if (hoverClearTimer.current !== null) {
        window.clearTimeout(hoverClearTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const node = cp?.isEvent
      ? selectionRingRectRef.current
      : selectionRingCircleRef.current;
    if (!node || !isSelected) return;
    const layer = node.getLayer();
    if (!layer) return;

    const dashSpeed = selectionDashCycle * 1.5;
    const anim = new Konva.Animation((frame) => {
      const t = (frame?.time ?? 0) / 1000;
      const ring = cp?.isEvent
        ? selectionRingRectRef.current
        : selectionRingCircleRef.current;
      if (!ring) return;
      ring.dashOffset((t * dashSpeed) % selectionDashCycle);
    }, layer);

    anim.start();
    return () => {
      anim.stop();
    };
  }, [isSelected, selectionDashCycle, cp?.isEvent]);

  if (!cp || !traj) return null;

  const isLast =
    traj.controlPoints.length > 0 &&
    traj.controlPoints[traj.controlPoints.length - 1].id === cp.id;

  const inferredHeading = (() => {
    if (cp.heading !== null) return cp.heading;

    const vectorToHeadingCw = (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) return 0;
      const v = coordSys.fromUser(dx, dy);
      const screenAngleDeg = (Math.atan2(v.y, v.x) * 180) / Math.PI;
      const cwScreenDeg = screenAngleDeg + 90;
      return coordSys.mapHeadingFromScreen(cwScreenDeg);
    };

    const cps = traj.controlPoints;
    const idx = cps.findIndex((p) => p.id === cp.id);
    if (idx < 0) return 0;

    const prev = idx > 0 ? cps[idx - 1] : null;
    const next = idx < cps.length - 1 ? cps[idx + 1] : null;

    // Build local tangents from the visible path (Bezier handles when applicable).
    const incoming = (() => {
      if (!prev) return null as { x: number; y: number } | null;
      if (prev.splineType === "BEZIER") {
        const hIn = getHandlePosition(traj.id, cp.id, "in");
        if (hIn) return { x: cp.x - hIn.x, y: cp.y - hIn.y };
      }
      return { x: cp.x - prev.x, y: cp.y - prev.y };
    })();

    const outgoing = (() => {
      if (!next) return null as { x: number; y: number } | null;
      if (cp.splineType === "BEZIER") {
        const hOut = getHandlePosition(traj.id, cp.id, "out");
        if (hOut) return { x: hOut.x - cp.x, y: hOut.y - cp.y };
      }
      return { x: next.x - cp.x, y: next.y - cp.y };
    })();

    // Middle CP: average inbound and outbound tangent directions.
    if (prev && next) {
      const v1x = incoming?.x ?? 0;
      const v1y = incoming?.y ?? 0;
      const v2x = outgoing?.x ?? 0;
      const v2y = outgoing?.y ?? 0;
      const n1 = Math.hypot(v1x, v1y) || 1;
      const n2 = Math.hypot(v2x, v2y) || 1;
      const vx = v1x / n1 + v2x / n2;
      const vy = v1y / n1 + v2y / n2;
      if (vx !== 0 || vy !== 0) return vectorToHeadingCw(vx, vy);
      if (v2x !== 0 || v2y !== 0) return vectorToHeadingCw(v2x, v2y);
      if (v1x !== 0 || v1y !== 0) return vectorToHeadingCw(v1x, v1y);
      return 0;
    }

    // Endpoints: use the only adjacent segment direction.
    if (outgoing) return vectorToHeadingCw(outgoing.x, outgoing.y);
    if (incoming) return vectorToHeadingCw(incoming.x, incoming.y);
    return 0;
  })();

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
        const idsToMove = alreadySelected ? selectedControlPointIds : [cpId];
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

  const robotRadiusM = Math.sqrt(widthM * widthM + heightM * heightM) / 2;

  const isRobotHover =
    activeTool === "show_robot" &&
    hoveredElementName === `cp:${trajId}:${cpId}`;

  const robotHoverGhost = isRobotHover ? (
      <Group
        x={cp.x}
        y={cp.y}
        rotation={transform.mapHeading(inferredHeading)}
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
    <Group x={cp.x} y={cp.y} listening={false}>
      {cp.isEvent ? (
        <Rect
          ref={selectionRingRectRef}
          x={0}
          y={0}
          width={selectionRingSize}
          height={selectionRingSize}
          offsetX={selectionRingSize / 2}
          offsetY={selectionRingSize / 2}
          stroke="#ffffff"
          strokeWidth={selectionStroke}
          dash={selectionDash}
        />
      ) : (
        <Circle
          ref={selectionRingCircleRef}
          x={0}
          y={0}
          radius={selectionRingRadius}
          stroke="#ffffff"
          strokeWidth={selectionStroke}
          dash={selectionDash}
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
      hitStrokeWidth={0}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={() => {
        if (activeTool === "show_robot") {
          if (hoverClearTimer.current !== null) {
            window.clearTimeout(hoverClearTimer.current);
            hoverClearTimer.current = null;
          }
          setHoveredElementName(`cp:${trajId}:${cpId}`);
        }
      }}
      onMouseLeave={() => {
        if (activeTool === "show_robot") {
          if (hoverClearTimer.current !== null) {
            window.clearTimeout(hoverClearTimer.current);
          }
          const name = `cp:${trajId}:${cpId}`;
          hoverClearTimer.current = window.setTimeout(() => {
            if (useEditorStore.getState().hoveredElementName === name) {
              setHoveredElementName(null);
            }
          }, ROBOT_HOVER_FADE_MS);
        }
      }}
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
      onMouseEnter={() => {
        if (activeTool === "show_robot") {
          if (hoverClearTimer.current !== null) {
            window.clearTimeout(hoverClearTimer.current);
            hoverClearTimer.current = null;
          }
          setHoveredElementName(`cp:${trajId}:${cpId}`);
        }
      }}
      onMouseLeave={() => {
        if (activeTool === "show_robot") {
          if (hoverClearTimer.current !== null) {
            window.clearTimeout(hoverClearTimer.current);
          }
          const name = `cp:${trajId}:${cpId}`;
          hoverClearTimer.current = window.setTimeout(() => {
            if (useEditorStore.getState().hoveredElementName === name) {
              setHoveredElementName(null);
            }
          }, ROBOT_HOVER_FADE_MS);
        }
      }}
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
          rotation={transform.mapHeading(cp.heading)}
          listening={false}
        />
        <Line
          x={cp.x}
          y={cp.y}
          points={[0, 0, lineLength, 0]}
          stroke="#000000"
          strokeWidth={lineThicknessInner}
          lineCap="round"
          rotation={transform.mapHeading(cp.heading)}
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
