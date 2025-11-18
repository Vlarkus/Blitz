import React from "react";
import { Group, Path } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useDataStore } from "../../../../../models/dataStore";
import { ControlPoint } from "../../../../../models/entities/control-point/controlPoint";
import ControlPointElement from "./control-point-element";
import buildPath from "../util/build-path";
import HandleElement from "./handle-element";

type Props = { trajId: string };

export default function TrajectoryElement({ trajId }: Props) {
  // ----- Store reads (must be at top) -----
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const getHandlePosition = useDataStore((s) => s.getHandlePosition);

  const insertControlPointAfter = useDataStore(
    (s) => s.insertControlPointAfter
  );
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );

  const activeTool = useEditorStore((s) => s.activeTool);
  const activeViewport = useEditorStore((s) => s.activeViewport);
  const scale = useEditorStore((s) => s.activeViewport.scale);

  if (!traj) return null;

  const d = buildPath(traj, getHandlePosition);

  // ----- Geometry helpers (local) -----
  const screenToWorld = (sx: number, sy: number) => {
    const { originX, originY, scale } = activeViewport;
    return { x: (sx - originX) / scale, y: (sy - originY) / scale };
  };

  type Pt = { x: number; y: number };
  const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const dot = (ax: number, ay: number, bx: number, by: number) =>
    ax * bx + ay * by;

  // Project P onto segment AB; return {t, proj, dist2}
  const projectPointToSegment = (p: Pt, a: Pt, b: Pt) => {
    const vx = b.x - a.x,
      vy = b.y - a.y;
    const wx = p.x - a.x,
      wy = p.y - a.y;
    const vv = vx * vx + vy * vy;
    const t = vv === 0 ? 0 : clamp01(dot(wx, wy, vx, vy) / vv);
    const proj = { x: a.x + t * vx, y: a.y + t * vy };
    const dx = p.x - proj.x,
      dy = p.y - proj.y;
    return { t, proj, dist2: dx * dx + dy * dy };
  };

  // ----- Insert handler on the path -----
  const onPathMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Only left click
    if (e.evt.button !== 0) return;

    // Insert tool: click near the polyline inserts a CP on the nearest segment
    if (activeTool === "insert") {
      e.cancelBubble = true; // don't bubble to Stage
      e.evt.preventDefault();

      if (traj.controlPoints.length < 2) return;

      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      const P = screenToWorld(pos.x, pos.y);

      // Find nearest segment
      let best = {
        segIndex: -1,
        proj: { x: 0, y: 0 },
        dist2: Number.POSITIVE_INFINITY,
      };

      const cps = traj.controlPoints;
      for (let i = 0; i < cps.length - 1; i++) {
        const a = cps[i],
          b = cps[i + 1];
        const res = projectPointToSegment(
          P,
          { x: a.x, y: a.y },
          { x: b.x, y: b.y }
        );
        if (res.dist2 < best.dist2)
          best = { segIndex: i, proj: res.proj, dist2: res.dist2 };
      }

      const afterCpId = cps[best.segIndex].id;
      const newCp = new ControlPoint("", best.proj.x, best.proj.y);

      insertControlPointAfter(trajId, afterCpId, newCp);

      setSelectedControlPointId(newCp.id);
      return;
    }

    // Default behavior (e.g., Select tool): select trajectory on path click
    useDataStore.getState().setSelectedTrajectoryId(traj.id);
  };

  return (
    <Group name={`traj:${traj.id}`} listening>
      <Path
        name={`trajectory:${traj.id}`}
        data={d}
        stroke={traj.color}
        strokeWidth={2 / scale}
        hitStrokeWidth={8 / scale}
        listening
        onMouseDown={onPathMouseDown} // <-- Insert handled here
        onTouchStart={() =>
          useDataStore.getState().setSelectedTrajectoryId(traj.id)
        }
      />
      {traj.controlPoints.map((cp) => (
        <React.Fragment key={cp.id}>
          <HandleElement trajId={traj.id} cpId={cp.id} which="in" />
          <HandleElement trajId={traj.id} cpId={cp.id} which="out" />
          <ControlPointElement trajId={traj.id} cpId={cp.id} />
        </React.Fragment>
      ))}
    </Group>
  );
}
