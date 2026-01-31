import { useLayoutEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import "./canvas.scss";
import { useEditorStore } from "../../../../editor/editor-store";
import TrajectoriesLayer from "./layers/trajectories-layer";
import { useDataStore } from "../../../../models/dataStore";
import { ControlPoint } from "../../../../models/entities/control-point/controlPoint";
import FieldImage from "./field-image/field-image";

import { useCanvasCoordinates } from "./canvas-coordinate-helper";
import { Group } from "react-konva";

export default function Canvas() {
  // Select store fields individually to keep selector snapshots stable
  const activeViewport = useEditorStore((s) => s.activeViewport);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const transform = useCanvasCoordinates(canvasConfig);

  const setStageSize = useEditorStore((s) => s.setStageSize);
  const panBy = useEditorStore((s) => s.panBy);
  const zoomBy = useEditorStore((s) => s.zoomBy);

  const activeTool = useEditorStore((s) => s.activeTool); // ...

  const selectedTrajectoryId = useDataStore((s) => s.selectedTrajectoryId);
  // const selectedControlPointId = useDataStore((s) => s.selectedControlPointId);
  // const getTrajectoryById = useDataStore((s) => {
  //   s.getTrajectoryById;
  // });
  const addControlPoint = useDataStore((s) => s.addControlPoint);
  const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  const execute = useDataStore((s) => s.execute);
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );
  const setSelectedControlPointIds = useDataStore(
    (s) => s.setSelectedControlPointIds
  );
  const addSelectedControlPointIds = useDataStore(
    (s) => s.addSelectedControlPointIds
  );
  const clearSelectedControlPoints = useDataStore(
    (s) => s.clearSelectedControlPoints
  );
  const setSelectedTrajectoryId = useDataStore(
    (s) => s.setSelectedTrajectoryId
  );
  const trajectories = useDataStore((s) => s.trajectories);
  // const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  // const getTrajectoryIdByControlPointId = useDataStore(
  //   (s) => s.getTrajectoryIdByControlPointId
  // );

  // Container sizing
  const containerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setStageSize(Math.max(0, cr.width), Math.max(0, cr.height));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [setStageSize]);

  // Panning state
  const [panning, setPanning] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const selectionStart = useRef<{
    x: number;
    y: number;
    additive: boolean;
  } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    additive: boolean;
  } | null>(null);

  // const getClickedControlPointId = (target: any): string | null => {
  //   if (!target) return null;
  //   // Preferred: explicit cpId attr set on the CP node
  //   if (typeof target.attrs?.cpId === "string") return target.attrs.cpId;

  //   // Fallback: name prefix convention "cp:<id>"
  //   const n = target.attrs?.name;
  //   if (typeof n === "string" && n.startsWith("cp:")) return n.slice(3);

  //   return null;
  // };

  // Start panning on:
  //  - Middle mouse anywhere, OR
  //  - Left-click on "empty space" (captured by an invisible background Rect)
  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const isMiddle = e.evt.button === 1;
    const isLeft = e.evt.button === 0;

    // Panning
    if (isMiddle || (isLeft && activeTool === "pan")) {
      e.evt.preventDefault();
      setPanning(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) last.current = { x: pos.x, y: pos.y };
      return;
    }

    // Tool Used
    if (isLeft) {
      if (activeTool === "add") {
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();
        if (!pos) return; // no pointer -> nothing to do
        if (!selectedTrajectoryId) return; // no selected trajectory -> no-op

        // screen -> world (user coords)
        const { x, y } = transform.screenToUser(pos.x, pos.y, activeViewport);

        // Construct CP first so we know its id
        const cp = new ControlPoint("Control Point", x, y);
        const trajId = selectedTrajectoryId;
        const cpId = cp.id;

        // Create undoable command
        execute({
          redo: () => {
            addControlPoint(trajId, cp);
            setSelectedTrajectoryId(trajId); // reassert selection (optional)
            setSelectedControlPointId(cpId); // select the newly added CP
          },
          undo: () => {
            removeControlPoint(trajId, cpId);
          },
        });

        return;
      }
    }
  };

  const onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      // always update hover, even when not panning or over shapes
      setHoverFromScreen(pos.x, pos.y);
    } else {
      // pointer left the stage surface but event bubbled — clear hover
      clearHover();
    }

    if (panning && last.current && pos) {
      panBy(pos.x - last.current.x, pos.y - last.current.y);
      last.current = { x: pos.x, y: pos.y };
    }

    if (selectionStart.current && pos) {
      setSelectionBox((prev) =>
        prev
          ? { ...prev, x2: pos.x, y2: pos.y }
          : {
              x1: selectionStart.current!.x,
              y1: selectionStart.current!.y,
              x2: pos.x,
              y2: pos.y,
              additive: selectionStart.current!.additive,
            }
      );
    }
  };

  const onMouseLeave = () => {
    endPan();
    endSelection();
    clearHover();
  };

  const endPan = () => {
    setPanning(false);
    last.current = null;
  };

  const endSelection = () => {
    if (!selectionStart.current || !selectionBox) return;

    const dx = Math.abs(selectionBox.x2 - selectionBox.x1);
    const dy = Math.abs(selectionBox.y2 - selectionBox.y1);
    const isClick = dx < 3 && dy < 3;

    if (isClick) {
      if (!selectionBox.additive) clearSelectedControlPoints();
      selectionStart.current = null;
      setSelectionBox(null);
      return;
    }

    const p1 = transform.screenToUser(
      selectionBox.x1,
      selectionBox.y1,
      activeViewport
    );
    const p2 = transform.screenToUser(
      selectionBox.x2,
      selectionBox.y2,
      activeViewport
    );
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    const selectedIds: string[] = [];
    trajectories.forEach((traj) => {
      traj.controlPoints.forEach((cp) => {
        if (
          cp.x >= minX &&
          cp.x <= maxX &&
          cp.y >= minY &&
          cp.y <= maxY
        ) {
          selectedIds.push(cp.id);
        }
      });
    });

    if (selectionBox.additive) {
      addSelectedControlPointIds(selectedIds);
    } else {
      setSelectedControlPointIds(selectedIds, selectedIds[0] ?? null);
    }

    selectionStart.current = null;
    setSelectionBox(null);
  };

  const onBackgroundMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    if (activeTool !== "select") return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    selectionStart.current = { x: pos.x, y: pos.y, additive: e.evt.shiftKey };
    setSelectionBox({
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
      additive: e.evt.shiftKey,
    });
  };

  // Wheel zoom (keeps pointer anchored)
  const onWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const factor = e.evt.deltaY > 0 ? 0.9 : 1.1; // scroll up -> zoom in
    zoomBy(factor, pos.x, pos.y);
  };

  // Compute the visible world-rect so the background Rect matches the view.
  // Since Layer applies (origin, scale), the visible world width/height are:
  const worldWidth = activeViewport.stageWidth / activeViewport.scale;
  const worldHeight = activeViewport.stageHeight / activeViewport.scale;
  const worldLeft = -activeViewport.originX / activeViewport.scale;
  const worldTop = -activeViewport.originY / activeViewport.scale;

  // Manage mouse position while hovering over canvas.
  const setHoverFromScreen = useEditorStore((s) => s.setHoverFromScreen);
  const clearHover = useEditorStore((s) => s.clearHover);

  return (
    <section
      className="canvas-area"
      ref={containerRef}
      style={{ cursor: panning ? "grabbing" : "default" }}
    >
      <Stage
        width={activeViewport.stageWidth}
        height={activeViewport.stageHeight}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => {
          endPan();
          endSelection();
        }}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        {/* Apply viewport transform so children use world meters */}
        <Layer
          x={activeViewport.originX}
          y={activeViewport.originY}
          scaleX={activeViewport.scale}
          scaleY={activeViewport.scale}
        >
          {/* Invisible background to capture left-clicks on *empty* space for panning */}
          <Rect
            name="pan-bg"
            x={worldLeft}
            y={worldTop}
            width={worldWidth}
            height={worldHeight}
            fill="rgba(0,0,0,0)"
            listening={true}
            onMouseDown={onBackgroundMouseDown}
          />
          <FieldImage />
          <Group
            rotation={transform.groupProps.rotation}
            scaleX={transform.groupProps.scaleX}
            scaleY={transform.groupProps.scaleY}
          >
            <TrajectoriesLayer />
          </Group>
        </Layer>
        {selectionBox && (
          <Layer listening={false}>
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              stroke="#4da3ff"
              strokeWidth={1}
              dash={[4, 4]}
              fill="rgba(77, 163, 255, 0.15)"
            />
          </Layer>
        )}
      </Stage>
    </section>
  );
}
