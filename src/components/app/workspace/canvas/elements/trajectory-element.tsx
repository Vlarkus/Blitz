import React, { useMemo } from "react";
import { Group, Path } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useDataStore } from "../../../../../models/dataStore";
import { ControlPoint } from "../../../../../models/entities/control-point/controlPoint";
import ControlPointElement from "./control-point-element";
import buildPath from "../util/build-path";
import HandleElement from "./handle-element";
import CurvePointElement from "./curve-point-element";
import { CanvasCoordinateSystem } from "../canvas-coordinate-helper";

const CURVE_POINT_SPACING_M = 0.1;
const BEZIER_LENGTH_STEPS = 12;

type Pt = { x: number; y: number };
type CurvePoint = {
  x: number;
  y: number;
  heading: number;
  segIndex: number;
  t: number;
  s: number;
};

const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

const cubicAt = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
};

const estimateBezierLength = (p0: Pt, p1: Pt, p2: Pt, p3: Pt): number => {
  let length = 0;
  let prev = p0;
  for (let i = 1; i <= BEZIER_LENGTH_STEPS; i++) {
    const t = i / BEZIER_LENGTH_STEPS;
    const pt = cubicAt(p0, p1, p2, p3, t);
    length += dist(prev, pt);
    prev = pt;
  }
  return length;
};

const lerpAngle = (a: number, b: number, t: number) => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
};

const buildCurvePoints = (
  traj: {
    id: string;
    controlPoints: ReadonlyArray<{
      id: string;
      x: number;
      y: number;
      splineType: string;
      heading: number | null;
    }>;
  },
  getHandlePosition: (
    trajId: string,
    cpId: string,
    which: "in" | "out",
  ) => Pt | null,
  spacing: number,
  vectorToHeadingNoDir: (dx: number, dy: number) => number,
): CurvePoint[] => {
  const cps = traj.controlPoints ?? [];
  const points: CurvePoint[] = [];
  if (cps.length < 2) return points;

  for (let i = 0; i < cps.length - 1; i++) {
    const a = cps[i];
    const b = cps[i + 1];
    const isBezier = a.splineType === "BEZIER";

    let length = dist(a, b);
    let c1: Pt = a;
    let c2: Pt = b;

    if (isBezier) {
      const h1 = getHandlePosition(traj.id, a.id, "out");
      const h2 = getHandlePosition(traj.id, b.id, "in");
      c1 = h1 ?? { x: a.x, y: a.y };
      c2 = h2 ?? { x: b.x, y: b.y };
      length = estimateBezierLength(a, c1, c2, b);
    }

    const segmentPoints: CurvePoint[] = [];
    if (length <= 0 || spacing <= 0) continue;

    if (isBezier) {
      const samples = BEZIER_LENGTH_STEPS;
      const positions: Pt[] = [];
      const cumLen: number[] = [];
      let totalLen = 0;
      for (let k = 0; k <= samples; k++) {
        const t = k / samples;
        const pt = cubicAt(a, c1, c2, b, t);
        if (k > 0) totalLen += dist(positions[k - 1], pt);
        positions.push(pt);
        cumLen.push(totalLen);
      }

      for (let d = spacing; d < totalLen; d += spacing) {
        let k = 1;
        while (k < cumLen.length && cumLen[k] < d) k++;
        const prevLen = cumLen[k - 1] ?? 0;
        const nextLen = cumLen[k] ?? prevLen;
        const span = nextLen - prevLen || 1;
        const localT = (d - prevLen) / span;
        const t0 = (k - 1) / samples;
        const t1 = k / samples;
        const t = t0 + (t1 - t0) * localT;
        const pt = cubicAt(a, c1, c2, b, t);
        segmentPoints.push({
          x: pt.x,
          y: pt.y,
          heading: 0,
          segIndex: i,
          t,
          s: totalLen === 0 ? 0 : d / totalLen,
        });
      }
    } else {
      for (let d = spacing; d < length; d += spacing) {
        const t = d / length;
        const pt = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        segmentPoints.push({
          x: pt.x,
          y: pt.y,
          heading: 0,
          segIndex: i,
          t,
          s: length === 0 ? 0 : d / length,
        });
      }
    }

    const hasA = a.heading !== null;
    const hasB = b.heading !== null;

    if (hasA && hasB) {
      segmentPoints.forEach((p) => {
        p.heading = lerpAngle(a.heading as number, b.heading as number, p.s);
      });
    } else if (hasA || hasB) {
      const heading = (a.heading ?? b.heading) as number;
      segmentPoints.forEach((p) => {
        p.heading = heading;
      });
    } else {
      segmentPoints.forEach((p, idx) => {
        const prev = idx > 0 ? segmentPoints[idx - 1] : a;
        const next =
          idx < segmentPoints.length - 1 ? segmentPoints[idx + 1] : b;
        const v1x = p.x - prev.x;
        const v1y = p.y - prev.y;
        const v2x = next.x - p.x;
        const v2y = next.y - p.y;
        const n1 = Math.hypot(v1x, v1y) || 1;
        const n2 = Math.hypot(v2x, v2y) || 1;
        const vx = v1x / n1 + v2x / n2;
        const vy = v1y / n1 + v2y / n2;
        const useX = vx || v1x || v2x;
        const useY = vy || v1y || v2y;
        p.heading = vectorToHeadingNoDir(useX, useY);
      });
    }

    points.push(...segmentPoints);
  }

  return points;
};

type Props = { trajId: string };

export default function TrajectoryElement({ trajId }: Props) {
  // ----- Store reads (must be at top) -----
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const getHandlePosition = useDataStore((s) => s.getHandlePosition);

  const insertControlPointAfter = useDataStore(
    (s) => s.insertControlPointAfter,
  );
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId,
  );

  const activeTool = useEditorStore((s) => s.activeTool);
  const scale = useEditorStore((s) => s.activeViewport.scale);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);

  // ----- Geometry helpers (local) -----
  const noDirConfig = {
    ...canvasConfig,
    coordinateSystem: {
      ...canvasConfig.coordinateSystem,
      rotationDirection: "CCW" as const,
    },
  };
  const coordSysNoDir = new CanvasCoordinateSystem(noDirConfig);
  const vectorToHeadingNoDir = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return 0;
    const v = coordSysNoDir.fromUser(dx, dy);
    const screenAngleDeg = (Math.atan2(v.y, v.x) * 180) / Math.PI;
    const cwScreenDeg = screenAngleDeg + 90;
    return coordSysNoDir.mapHeadingFromScreen(cwScreenDeg);
  };

  const shouldRenderCurvePoints =
    activeTool === "insert" || activeTool === "show_robot";

  const curvePoints = useMemo(() => {
    if (!shouldRenderCurvePoints || !traj) return [];
    return buildCurvePoints(
      traj,
      getHandlePosition,
      CURVE_POINT_SPACING_M,
      vectorToHeadingNoDir,
    );
  }, [
    shouldRenderCurvePoints,
    traj,
    getHandlePosition,
    canvasConfig,
    vectorToHeadingNoDir,
  ]);

  if (!traj) return null;

  const d = buildPath(traj, getHandlePosition);

  // ----- Insert handler on the path -----
  const onPathMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Only left click
    if (e.evt.button !== 0) return;

    // Insert tool works only on curve points now
    if (activeTool === "insert") return;

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
      {curvePoints.map((pt, idx) => (
        <CurvePointElement
          key={`${traj.id}:curve:${idx}`}
          name={`curve:${traj.id}:${idx}`}
          trajId={traj.id}
          index={idx}
          x={pt.x}
          y={pt.y}
          heading={pt.heading}
          onInsert={() => {
            if (traj.controlPoints.length < 2) return;
            const cps = traj.controlPoints;
            const afterCpId = cps[pt.segIndex].id;
            const newCp = new ControlPoint("", pt.x, pt.y);
            insertControlPointAfter(trajId, afterCpId, newCp);
            setSelectedControlPointId(newCp.id);
          }}
        />
      ))}
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
