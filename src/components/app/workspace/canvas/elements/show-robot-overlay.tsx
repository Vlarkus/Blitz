import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useCanvasCoordinates } from "../canvas-coordinate-helper";

const ROBOT_TRANSITION_MS = 75;

type Pose = { x: number; y: number; heading: number };

function lerpAngle(a: number, b: number, t: number) {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
}

export default function ShowRobotOverlay({ headingRad }: { headingRad: number }) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const hoverWorld = useEditorStore((s) => s.hoverWorld);
  const hoveredElementName = useEditorStore((s) => s.hoveredElementName);
  const hoveredCurvePoint = useEditorStore((s) => s.hoveredCurvePoint);
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const { widthM, heightM } = useEditorStore((s) => s.robotConfig);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const transform = useCanvasCoordinates(canvasConfig);

  const [pose, setPose] = useState<Pose | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const animRef = useRef<number | null>(null);
  const modeRef = useRef<"snap" | "free" | null>(null);
  const snapKeyRef = useRef<string | null>(null);

  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  const snapTarget = useMemo(() => {
    if (activeTool !== "show_robot") return null;
    if (!hoveredElementName?.startsWith("curve:")) return null;
    if (!hoveredCurvePoint) return null;
    return {
      key: `${hoveredCurvePoint.trajId}:${hoveredCurvePoint.index}`,
      x: hoveredCurvePoint.x,
      y: hoveredCurvePoint.y,
    };
  }, [activeTool, hoveredElementName, hoveredCurvePoint]);

  useEffect(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    if (activeTool !== "show_robot" || !hoverWorld) {
      setPose(null);
      modeRef.current = null;
      snapKeyRef.current = null;
      return;
    }

    const target: Pose = snapTarget
      ? { x: snapTarget.x, y: snapTarget.y, heading: headingRad }
      : { x: hoverWorld.xM, y: hoverWorld.yM, heading: headingRad };
    const current = poseRef.current;

    const animateTo = (from: Pose, to: Pose) => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / ROBOT_TRANSITION_MS);
        setPose({
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
          heading: lerpAngle(from.heading, to.heading, t),
        });
        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          animRef.current = null;
        }
      };
      animRef.current = requestAnimationFrame(tick);
    };

    if (snapTarget) {
      const snapChanged =
        modeRef.current !== "snap" || snapKeyRef.current !== snapTarget.key;
      if (current && snapChanged) {
        animateTo(current, target);
      } else {
        setPose(target);
      }
      modeRef.current = "snap";
      snapKeyRef.current = snapTarget.key;
      return;
    }

    const fromSnap = modeRef.current === "snap";
    if (current && fromSnap) {
      animateTo(current, target);
    } else {
      setPose(target);
    }
    modeRef.current = "free";
    snapKeyRef.current = null;
  }, [activeTool, hoverWorld, snapTarget, headingRad]);

  if (!pose) return null;

  const robotStroke = Math.min((1 / scale) * 2.5, 0.5);
  const robotRadiusM = Math.sqrt(widthM * widthM + heightM * heightM) / 2;

  return (
    <Group
      x={pose.x}
      y={pose.y}
      rotation={transform.mapHeading(pose.heading)}
      listening={false}
    >
      <Circle radius={robotRadiusM} stroke="#ffffff" strokeWidth={robotStroke} />
      <Rect
        x={-heightM / 2}
        y={-widthM / 2}
        width={heightM}
        height={widthM}
        stroke="#ffffff"
        strokeWidth={robotStroke}
        dash={[heightM * 0.15, widthM * 0.15]}
      />
      <Line
        points={[0, 0, heightM * 0.45, 0]}
        stroke="#ffffff"
        strokeWidth={robotStroke * 1.5}
        lineCap="round"
        lineJoin="round"
      />
      <Line
        points={[
          heightM * 0.45,
          0,
          heightM * 0.35,
          -widthM * 0.08,
          heightM * 0.45,
          0,
          heightM * 0.35,
          widthM * 0.08,
        ]}
        stroke="#ffffff"
        strokeWidth={robotStroke * 1.2}
        lineCap="round"
        lineJoin="round"
        closed
      />
    </Group>
  );
}
