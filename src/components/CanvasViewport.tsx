import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Circle } from "react-konva";
import { useEditorStore } from "../store/editorStore";

export default function CanvasViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const { pan, zoom, setPanZoom } = useEditorStore();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = zoom;
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const newPan = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setPanZoom(newPan, newScale);
  };

  const handleMouseDown = (e: any) => {
    if (e.evt.button === 1 || e.evt.button === 2) {
      setIsPanning(true);
      e.evt.preventDefault();
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleMouseMove = (e: any) => {
    if (!isPanning) return;
    setPanZoom(
      { x: pan.x + e.evt.movementX, y: pan.y + e.evt.movementY },
      zoom
    );
  };

  return (
    <div ref={containerRef} className="w-100 h-100">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ backgroundColor: "#1e1e1e" }}
      >
        <Layer>
          <Circle
            x={100}
            y={100}
            radius={30}
            fill="red"
            draggable
            onDragMove={(e) => {
              const { x, y } = e.target.position();
              console.log("Dragging circle to:", x, y);
            }}
          />
          <Circle
            x={200}
            y={100}
            radius={30}
            fill="blue"
            draggable
            onDragMove={(e) => {
              const { x, y } = e.target.position();
              console.log("Dragging circle to:", x, y);
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
