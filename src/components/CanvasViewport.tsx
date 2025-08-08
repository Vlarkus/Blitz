import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Group, Path } from "react-konva";
import { useEditorStore } from "../editor/editorStore";

// ---- handle math helpers ----
const EPS = 1e-6;
const toPolar = (dx: number, dy: number) => {
  const r = Math.hypot(dx, dy);
  const theta = Math.atan2(dy, dx);
  return { r, theta };
};
const fromPolar = (r: number, theta: number) => ({
  dx: r * Math.cos(theta),
  dy: r * Math.sin(theta),
});
const wrapPi = (theta: number) =>
  theta > Math.PI
    ? theta - 2 * Math.PI
    : theta <= -Math.PI
    ? theta + 2 * Math.PI
    : theta;

type WhichHandle = "in" | "out";

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
  );
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function applySymmetry(
  cp: {
    symmetry: "broken" | "aligned" | "mirrored";
    handleIn?: { dx: number; dy: number };
    handleOut?: { dx: number; dy: number };
  },
  moved: WhichHandle,
  movedVal: { dx: number; dy: number }
) {
  const other: WhichHandle = moved === "in" ? "out" : "in";
  const hIn = cp.handleIn ?? { dx: 0, dy: 0 };
  const hOut = cp.handleOut ?? { dx: 0, dy: 0 };

  if (cp.symmetry === "broken") {
    return moved === "in" ? { handleIn: movedVal } : { handleOut: movedVal };
  }

  const { r, theta } = toPolar(movedVal.dx, movedVal.dy);
  if (r < EPS) {
    if (cp.symmetry === "mirrored") {
      return moved === "in"
        ? { handleIn: { dx: 0, dy: 0 }, handleOut: { dx: 0, dy: 0 } }
        : { handleOut: { dx: 0, dy: 0 }, handleIn: { dx: 0, dy: 0 } };
    }
    return moved === "in"
      ? { handleIn: { dx: 0, dy: 0 } }
      : { handleOut: { dx: 0, dy: 0 } };
  }

  const oppTheta = wrapPi(theta + Math.PI);

  if (cp.symmetry === "aligned") {
    const otherCurrent = other === "in" ? hIn : hOut;
    const otherR = Math.hypot(otherCurrent.dx, otherCurrent.dy) || r;
    const opp = fromPolar(otherR, oppTheta);
    return moved === "in"
      ? { handleIn: movedVal, handleOut: opp }
      : { handleOut: movedVal, handleIn: opp };
  }

  // mirrored
  const opp = fromPolar(r, oppTheta);
  return moved === "in"
    ? { handleIn: movedVal, handleOut: opp }
    : { handleOut: movedVal, handleIn: opp };
}

export default function CanvasViewport() {
  const {
    activeTool,
    removeControlPoint,
    selectedTrajectoryId,
    addControlPoint,
    insertControlPoint,
  } = useEditorStore();

  const setSelectedTrajectoryId = useEditorStore(
    (s) => s.setSelectedTrajectoryId
  );
  const setSelectedControlPointId = useEditorStore(
    (s) => s.setSelectedControlPointId
  );

  const cutTrajectoryAtPoint = useEditorStore((s) => s.cutTrajectoryAtPoint);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  const { pan, zoom, setPanZoom, trajectories, updateControlPoint, seedDemo } =
    useEditorStore();

  const [dim, setDim] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setDim({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (trajectories.length === 0) seedDemo();
  }, [trajectories.length, seedDemo]);

  const onWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const old = zoom;
    const ptr = stageRef.current?.getPointerPosition();
    if (!ptr) return;
    const world = { x: (ptr.x - pan.x) / old, y: (ptr.y - pan.y) / old };
    const newScale = e.evt.deltaY < 0 ? old * scaleBy : old / scaleBy;
    const newPan = {
      x: ptr.x - world.x * newScale,
      y: ptr.y - world.y * newScale,
    };
    setPanZoom(newPan, newScale);
  };

  const onMouseDown = (e: any) => {
    if (e.evt.button === 1 || e.evt.button === 2) {
      setIsPanning(true);
      e.evt.preventDefault();
    }
    if (activeTool === "add" && selectedTrajectoryId && e.evt.button === 0) {
      const pointer = stageRef.current?.getPointerPosition();
      if (pointer) {
        const worldX = (pointer.x - pan.x) / zoom;
        const worldY = (pointer.y - pan.y) / zoom;

        addControlPoint(selectedTrajectoryId, {
          x: worldX,
          y: worldY,
          theta: 0,
          symmetry: "mirrored", // or your default
          splineType: "CubicBezier",
          id: "",
          name: "",
          handleIn: { dx: -20, dy: 0 },
          handleOut: { dx: 20, dy: 0 },
        });
      }
      return;
    } else if (activeTool === "insert") {
      const stage = e.target.getStage();
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const { x: canvasX, y: canvasY } = pointer;
      const worldX = (canvasX - pan.x) / zoom;
      const worldY = (canvasY - pan.y) / zoom;

      let closestDist = Infinity;
      let closestTrajId: string | null = null;
      let bestIdx = -1;

      trajectories.forEach((traj) => {
        if (!traj.isVisible) return;

        const pts = traj.controlPoints.filter((p) => p.isVisible !== false);
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i];
          const p1 = pts[i + 1];
          const dist = pointToSegmentDistance(
            worldX,
            worldY,
            p0.x,
            p0.y,
            p1.x,
            p1.y
          );
          if (dist < closestDist) {
            closestDist = dist;
            closestTrajId = traj.id;
            bestIdx = i;
          }
        }
      });

      const threshold = 10 / zoom;
      if (
        closestDist <= threshold &&
        closestTrajId !== null &&
        bestIdx !== -1
      ) {
        const splineType =
          trajectories.find((t) => t.id === closestTrajId)?.controlPoints[
            bestIdx
          ]?.splineType ?? "CubicBezier";

        const newPoint = {
          id: "", // ignored by store
          name: "Inserted Point",
          x: worldX,
          y: worldY,
          theta: 0,
          symmetry: "mirrored" as const,
          splineType,
          handleIn: { dx: -20, dy: 0 },
          handleOut: { dx: 20, dy: 0 },
          isLocked: false,
          isVisible: true,
        };

        insertControlPoint(closestTrajId, bestIdx + 1, newPoint);
        setSelectedTrajectoryId(closestTrajId);
        setSelectedControlPointId(newPoint.id);
      }

      return;
    }
  };

  const onMouseUp = () => setIsPanning(false);
  const onMouseMove = (e: any) => {
    if (!isPanning) return;
    setPanZoom(
      { x: pan.x + e.evt.movementX, y: pan.y + e.evt.movementY },
      zoom
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-100 h-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={dim.width}
        height={dim.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        style={{ backgroundColor: "#1e1e1e" }}
      >
        <Layer>
          {trajectories
            .filter((t) => t.isVisible)
            .map((t) => {
              const pts = t.controlPoints.filter((p) => p.isVisible !== false);
              const invScale = 1 / Math.max(zoom, 0.001);
              const strokeW = 2 * invScale;
              const anchorR = 6 * invScale;
              const handleR = 3 * invScale;
              const handleStroke = 1.2 * invScale;

              const absHandleOut = (p: (typeof pts)[number]) => ({
                x: p.x + (p.handleOut?.dx ?? 0),
                y: p.y + (p.handleOut?.dy ?? 0),
              });
              const absHandleIn = (p: (typeof pts)[number]) => ({
                x: p.x + (p.handleIn?.dx ?? 0),
                y: p.y + (p.handleIn?.dy ?? 0),
              });

              const Segment = ({
                p0,
                p1,
              }: {
                p0: (typeof pts)[number];
                p1: (typeof pts)[number];
              }) => {
                if (p0.splineType === "CubicBezier") {
                  const c1 = absHandleOut(p0);
                  const c2 = absHandleIn(p1);
                  const d = `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p1.x} ${p1.y}`;
                  return (
                    <Path
                      data={d}
                      stroke={t.color}
                      strokeWidth={strokeW}
                      hitStrokeWidth={2 * strokeW}
                    />
                  );
                }
                // Line and Clothoid placeholder
                return (
                  <Line
                    points={[p0.x, p0.y, p1.x, p1.y]}
                    stroke={t.color}
                    strokeWidth={strokeW}
                    hitStrokeWidth={strokeW * 2}
                  />
                );
              };

              return (
                <Group key={t.id}>
                  {/* Segments */}
                  {pts.length >= 2 &&
                    pts.slice(0, -1).map((p0, i) => {
                      const p1 = pts[i + 1];
                      return (
                        <Segment
                          key={`${t.id}-seg-${p0.id}-${p1.id}`}
                          p0={p0}
                          p1={p1}
                        />
                      );
                    })}

                  {/* Handles & ControlPoints */}
                  {pts.map((p, i) => {
                    const hIn = absHandleIn(p);
                    const hOut = absHandleOut(p);
                    const locked = t.isLocked || p.isLocked;

                    const skipHandleOut = p.splineType === "Line";
                    const skipHandleIn =
                      i > 0 && pts[i - 1].splineType === "Line";

                    const onDragHandle = (which: WhichHandle) => (e: any) => {
                      if (locked) return;
                      const hx = e.target.x();
                      const hy = e.target.y();
                      const rel = { dx: hx - p.x, dy: hy - p.y };
                      const updates = applySymmetry(
                        {
                          symmetry: p.symmetry,
                          handleIn: p.handleIn,
                          handleOut: p.handleOut,
                        },
                        which,
                        rel
                      );
                      useEditorStore
                        .getState()
                        .updateControlPoint(t.id, p.id, updates);
                    };

                    const onDragControlPointMove = (e: any) => {
                      if (locked) return;
                      const nx = e.target.x();
                      const ny = e.target.y();
                      if (rafRef.current) cancelAnimationFrame(rafRef.current);
                      rafRef.current = requestAnimationFrame(() => {
                        useEditorStore
                          .getState()
                          .updateControlPoint(t.id, p.id, { x: nx, y: ny });
                        rafRef.current = null;
                      });
                    };

                    return (
                      <Group key={p.id}>
                        {/* handle lines */}
                        {!skipHandleIn && (
                          <Line
                            points={[p.x, p.y, hIn.x, hIn.y]}
                            stroke="#888"
                            strokeWidth={handleStroke}
                            dash={[4 * invScale, 4 * invScale]}
                            listening={false}
                          />
                        )}
                        {!skipHandleOut && (
                          <Line
                            points={[p.x, p.y, hOut.x, hOut.y]}
                            stroke="#888"
                            strokeWidth={handleStroke}
                            dash={[4 * invScale, 4 * invScale]}
                            listening={false}
                          />
                        )}

                        {/* handle points - draggable */}
                        {!skipHandleIn && (
                          <Circle
                            x={hIn.x}
                            y={hIn.y}
                            radius={handleR}
                            fill="#bbb"
                            stroke="#666"
                            strokeWidth={handleStroke}
                            draggable={!locked && activeTool === "move"}
                            onDragMove={onDragHandle("in")}
                            onDragEnd={onDragHandle("in")}
                          />
                        )}
                        {!skipHandleOut && (
                          <Circle
                            x={hOut.x}
                            y={hOut.y}
                            radius={handleR}
                            fill="#bbb"
                            stroke="#666"
                            strokeWidth={handleStroke}
                            draggable={!locked && activeTool === "move"}
                            onDragMove={onDragHandle("out")}
                            onDragEnd={onDragHandle("out")}
                          />
                        )}

                        {/* anchor (control point) */}
                        <Circle
                          x={p.x}
                          y={p.y}
                          radius={anchorR}
                          fill={t.color}
                          stroke="#000"
                          strokeWidth={handleStroke}
                          draggable={!locked && activeTool === "move"}
                          onDragMove={onDragControlPointMove}
                          onDragEnd={(e) => {
                            const nx = e.target.x();
                            const ny = e.target.y();
                            useEditorStore
                              .getState()
                              .updateControlPoint(t.id, p.id, { x: nx, y: ny });
                          }}
                          onClick={() => {
                            if (
                              ["move", "insert", "simulate"].includes(
                                activeTool
                              )
                            ) {
                              setSelectedTrajectoryId(t.id);
                              setSelectedControlPointId(p.id);
                            } else if (activeTool === "delete") {
                              removeControlPoint(t.id, p.id);
                            } else if (activeTool === "cut") {
                              cutTrajectoryAtPoint(t.id, p.id);
                              useEditorStore
                                .getState()
                                .setSelectedControlPointId(null);
                            }
                          }}
                        />
                      </Group>
                    );
                  })}
                </Group>
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}
