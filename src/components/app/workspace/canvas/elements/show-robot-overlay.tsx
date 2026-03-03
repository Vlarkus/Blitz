import { useEffect, useMemo, useState } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useCanvasCoordinates } from "../canvas-coordinate-helper";

type Pose = { x: number; y: number; heading: number };

export default function ShowRobotOverlay({ headingRad }: { headingRad: number }) {
  const showRobot = useEditorStore((s) => s.showRobot);
  const hoverWorld = useEditorStore((s) => s.hoverWorld);
  const hoveredElementName = useEditorStore((s) => s.hoveredElementName);
  const hoveredCurvePoint = useEditorStore((s) => s.hoveredCurvePoint);
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const { widthM, heightM } = useEditorStore((s) => s.robotConfig);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const transform = useCanvasCoordinates(canvasConfig);

  const [pose, setPose] = useState<Pose | null>(null);

  const snapTarget = useMemo(() => {
    if (!showRobot) return null;
    if (!hoveredElementName?.startsWith("curve:")) return null;
    if (!hoveredCurvePoint) return null;
    return {
      key: `${hoveredCurvePoint.trajId}:${hoveredCurvePoint.index}`,
      x: hoveredCurvePoint.x,
      y: hoveredCurvePoint.y,
    };
  }, [showRobot, hoveredElementName, hoveredCurvePoint]);

  useEffect(() => {
    if (!showRobot || !hoverWorld) {
      setPose(null);
      return;
    }

    const target: Pose = snapTarget
      ? { x: snapTarget.x, y: snapTarget.y, heading: headingRad }
      : { x: hoverWorld.xM, y: hoverWorld.yM, heading: headingRad };

    setPose(target);
  }, [showRobot, hoverWorld, snapTarget, headingRad]);

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
