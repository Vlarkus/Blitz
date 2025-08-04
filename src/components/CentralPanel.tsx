import React from "react";
import CanvasViewport from "./CanvasViewport";

export default function CentralPanel() {
  return (
    <div className="central-panel d-flex flex-column flex-grow-1 bg-dark">
      <div className="central-panel d-flex flex-column flex-grow-1 overflow-hidden">
        <div className="canvas-container flex-grow-1">
          <CanvasViewport />
        </div>

        <div
          className="canvas-info bg-dark text-white px-3 d-flex align-items-center"
          style={{ height: "32px" }}
        >
          Info line goes here
        </div>
      </div>
    </div>
  );
}
