import { Circle } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";

const CURVE_POINT_RADIUS = 1.6;
const CURVE_POINT_RADIUS_SHOW_ROBOT = 2;
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
  heading: _heading,
  name,
  onInsert,
}: Props) {
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setHoveredElementName = useEditorStore((s) => s.setHoveredElementName);
  const setHoveredCurvePoint = useEditorStore((s) => s.setHoveredCurvePoint);

  const baseRadius = Math.min((1 / scale) * 7, CURVE_POINT_RADIUS);
  const radius =
    activeTool === "show_robot"
      ? baseRadius * (CURVE_POINT_RADIUS_SHOW_ROBOT / CURVE_POINT_RADIUS)
      : baseRadius;
  const stroke = Math.min((1 / scale) * 2, 0.5);

  return (
    <>
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
            setHoveredElementName(name);
            setHoveredCurvePoint({ trajId, index, x, y, heading: _heading });
          }
        }}
        onMouseLeave={() => {
          if (activeTool === "show_robot") {
            if (useEditorStore.getState().hoveredElementName === name) {
              setHoveredElementName(null);
              setHoveredCurvePoint(null);
            }
          }
        }}
      />
    </>
  );
}
