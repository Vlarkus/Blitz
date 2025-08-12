// src/.../StatusBar.tsx
import { useEditorStore } from "../../../../editor/editor-store";
import "./status-bar.scss";

const COORD_PRECISION = 2; // ← change to control digits after the decimal

export default function StatusBar() {
  const hover = useEditorStore((s) => s.hoverWorld); // { xM, yM } | null
  const scale = useEditorStore((s) => s.activeViewport.scale); // px per meter

  const fmt = (n: number) => n.toFixed(COORD_PRECISION);
  const zoomPercent = Math.round(scale * 100); // 1.0 => 100%

  return (
    <div className="status-bar">
      <span className="status-pos">
        <span className="status-pos-item">
          x: {hover ? fmt(hover.xM) : "–"}
        </span>
        <span className="status-pos-item">
          y: {hover ? fmt(hover.yM) : "–"}
        </span>
      </span>
      <span className="status-zoom-wrapper">
        <span className="status-zoom">{zoomPercent}%</span>
      </span>
    </div>
  );
}
