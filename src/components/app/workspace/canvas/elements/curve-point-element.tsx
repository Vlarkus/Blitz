import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useCanvasCoordinates } from "../canvas-coordinate-helper";

const CURVE_POINT_RADIUS = 1.6;
const CURVE_POINT_RADIUS_SHOW_ROBOT = 2;
const ROBOT_HOVER_FADE_MS = 350;
const ROBOT_HOVER_TRANSITION_MS = 75;
const SHOW_CURVE_POINTS = false;

type Props = {
  trajId: string;
  index: number;
  x: number;
  y: number;
  heading: number;
  name: string;
  onInsert?: () => void;
};

export default function CurvePointElement({
  trajId,
  index,
  x,
  y,
  heading,
  name,
  onInsert,
}: Props) {
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);
  const hoveredElementName = useEditorStore((s) => s.hoveredElementName);
  const setHoveredElementName = useEditorStore((s) => s.setHoveredElementName);
  const setHoveredCurvePoint = useEditorStore((s) => s.setHoveredCurvePoint);
  const hoverClearTimer = useRef<number | null>(null);
  const [ghostPose, setGhostPose] = useState({ x, y, heading });
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hoverClearTimer.current !== null) {
        window.clearTimeout(hoverClearTimer.current);
      }
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  const robotStroke = Math.min((1 / scale) * 2.5, 0.5);
  const { widthM, heightM } = useEditorStore((s) => s.robotConfig);
  const robotRadiusM = Math.sqrt(widthM * widthM + heightM * heightM) / 2;

  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const transform = useCanvasCoordinates(canvasConfig);

  const isHovered = activeTool === "show_robot" && hoveredElementName === name;

  const lerpAngle = (a: number, b: number, t: number) => {
    const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
    return a + diff * t;
  };

  useLayoutEffect(() => {
    if (!isHovered) return;

    const prev = useEditorStore.getState().hoveredCurvePoint;
    const isNeighbor =
      prev && prev.trajId === trajId && Math.abs(prev.index - index) === 1;

    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    const start = isNeighbor ? prev : { x, y, heading };
    const end = { x, y, heading };

    setGhostPose(start);
    setHoveredCurvePoint({ trajId, index, x, y, heading });

    if (!isNeighbor || ROBOT_HOVER_TRANSITION_MS <= 0) {
      setGhostPose(end);
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / ROBOT_HOVER_TRANSITION_MS);
      setGhostPose({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        heading: lerpAngle(start.heading, end.heading, t),
      });
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [isHovered, trajId, index, x, y, heading, setHoveredCurvePoint]);

  const robotHoverGhost = isHovered ? (
    <Group
      x={ghostPose.x}
      y={ghostPose.y}
        rotation={transform.mapHeading(ghostPose.heading)}
      listening={false}
    >
      <Circle
        radius={robotRadiusM}
        stroke="#ffffff"
        strokeWidth={robotStroke}
      />
      <Rect
        x={-widthM / 2}
        y={-heightM / 2}
        width={widthM}
        height={heightM}
        stroke="#ffffff"
        strokeWidth={robotStroke}
        dash={[widthM * 0.15, heightM * 0.15]}
      />
      <Line
        points={[0, 0, widthM * 0.45, 0]}
        stroke="#ffffff"
        strokeWidth={robotStroke * 1.5}
        lineCap="round"
        lineJoin="round"
      />
      <Line
        points={[
          widthM * 0.45,
          0,
          widthM * 0.35,
          -widthM * 0.08,
          widthM * 0.45,
          0,
          widthM * 0.35,
          widthM * 0.08,
        ]}
        stroke="#ffffff"
        strokeWidth={robotStroke * 1.2}
        lineCap="round"
        lineJoin="round"
        closed
      />
    </Group>
  ) : null;

  const baseRadius = Math.min((1 / scale) * 7, CURVE_POINT_RADIUS);
  const radius =
    activeTool === "show_robot"
      ? baseRadius * (CURVE_POINT_RADIUS_SHOW_ROBOT / CURVE_POINT_RADIUS)
      : baseRadius;
  const stroke = Math.min((1 / scale) * 2, 0.5);

  return (
    <>
      {robotHoverGhost}
      <Circle
        name={name}
        x={x}
        y={y}
        radius={radius}
        stroke="#ffffff"
        strokeWidth={stroke}
        opacity={SHOW_CURVE_POINTS ? 1 : 0}
        fill="rgba(0,0,0,0)"
        listening={activeTool === "show_robot" || activeTool === "insert"}
        hitStrokeWidth={12}
        onMouseDown={(e) => {
          if (activeTool !== "insert") return;
          e.cancelBubble = true;
          e.evt.preventDefault();
          onInsert?.();
        }}
        onMouseEnter={() => {
          if (activeTool === "show_robot") {
            if (hoverClearTimer.current !== null) {
              window.clearTimeout(hoverClearTimer.current);
              hoverClearTimer.current = null;
            }
            setHoveredElementName(name);
          }
        }}
        onMouseLeave={() => {
          if (activeTool === "show_robot") {
            if (hoverClearTimer.current !== null) {
              window.clearTimeout(hoverClearTimer.current);
            }
            hoverClearTimer.current = window.setTimeout(() => {
              if (useEditorStore.getState().hoveredElementName === name) {
                setHoveredElementName(null);
              }
            }, ROBOT_HOVER_FADE_MS);
          }
        }}
      />
    </>
  );
}
