// src/.../StatusBar.tsx
import { useEditorStore, SCALE_COEFF } from "../../../../editor/editor-store";
import { metersToDistance } from "../../../../utils/unit-conversion";
import "./status-bar.scss";

const COORD_PRECISION = 2; // change to control digits after the decimal

export default function StatusBar() {
  const hover = useEditorStore((s) => s.hoverWorld); // { xM, yM } | null
  const scale = useEditorStore((s) => s.activeViewport.scale); // px per meter
  const distanceUnit = useEditorStore((s) => s.canvasConfig.units.distance);
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
      </div>
      <div className="status-cluster status-cluster-right">
        <div className="status-segment side-panel-element status-segment-zoom">
          <span className="status-zoom">{zoomPercent}%</span>
        </div>
      </div>
    </div>
  );
}
