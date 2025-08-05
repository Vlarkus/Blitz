import CanvasViewport from "./CanvasViewport";

export default function CentralPanel() {
  return (
    <div className="central-panel d-flex flex-column flex-grow-1 bg-dark overflow-hidden">
      <div className="canvas-container rounded-border flex-grow-1">
        <CanvasViewport />
      </div>

      <div className="canvas-info bg-dark text-white px-3 d-flex align-items-center">
        Canvas info goes here
      </div>
    </div>
  );
}
