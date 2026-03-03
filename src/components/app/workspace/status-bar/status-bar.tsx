// src/.../StatusBar.tsx
import { useEditorStore, SCALE_COEFF } from "../../../../editor/editor-store";
import {
  metersToDistance,
  radiansToAngle,
} from "../../../../utils/unit-conversion";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./status-bar.scss";

const COORD_PRECISION = 2; // change to control digits after the decimal

export default function StatusBar() {
  const hover = useEditorStore((s) => s.hoverWorld); // { xM, yM } | null
  const viewport = useEditorStore((s) => s.activeViewport);
  const scale = viewport.scale; // px per meter
  const zoomBy = useEditorStore((s) => s.zoomBy);
  const showRobot = useEditorStore((s) => s.showRobot);
  const robotHeading = useEditorStore((s) => s.robotHeading);
  const distanceUnit = useEditorStore((s) => s.canvasConfig.units.distance);
  const angleUnit = useEditorStore((s) => s.canvasConfig.units.angle);
  const unitsConfig = useEditorStore((s) => s.canvasConfig.units);

  const emptyValue = "-";
  const fmt = (n: number) => n.toFixed(COORD_PRECISION);
  const zoomPercent = Math.round((scale / SCALE_COEFF) * 100); // 180 => 100%

  return (
    <div className="status-bar">
      <div className="status-cluster status-cluster-left">
        <div className="status-segment side-panel-element status-segment-pos">
          <span className="status-pos-item">
            x: {hover ? fmt(metersToDistance(hover.xM, distanceUnit, unitsConfig)) : emptyValue}
          </span>
        </div>
        <div className="status-segment side-panel-element status-segment-pos">
          <span className="status-pos-item">
            y: {hover ? fmt(metersToDistance(hover.yM, distanceUnit, unitsConfig)) : emptyValue}
          </span>
        </div>
        {showRobot && (
          <div className="status-segment side-panel-element status-segment-pos">
            <span className="status-pos-item">
              ϑ: {hover ? fmt(radiansToAngle(robotHeading, angleUnit)) : emptyValue}
            </span>
          </div>
        )}
      </div>
      <div className="status-cluster status-cluster-right">
        <div className="status-segment side-panel-element">
          <div
            className="zoom-btn"
            onClick={() =>
              zoomBy(1.1, viewport.stageWidth / 2, viewport.stageHeight / 2)
            }
            title="Zoom In"
          >
            <FaPlus size={10} />
          </div>
          <div
            className="zoom-btn"
            onClick={() =>
              zoomBy(0.9, viewport.stageWidth / 2, viewport.stageHeight / 2)
            }
            title="Zoom Out"
          >
            <FaMinus size={10} />
          </div>
        </div>
        <div className="status-segment side-panel-element">
          <span className="status-zoom" style={{ minWidth: "3.5ch", textAlign: "right" }}>
            {zoomPercent}%
          </span>




        </div>

      </div>
    </div>
  );
}
