import type { Trajectory } from "../../../../../models/entities/trajectory/trajectory";
import type { ControlPointId, TrajectoryId } from "../../../../../types/types";

type GetHandlePositionFn = (
  trajId: TrajectoryId,
  cpId: ControlPointId,
  which: "in" | "out"
) => { x: number; y: number } | null;

export default function buildPath(
  traj: Trajectory,
  getHandlePosition: GetHandlePositionFn
): string {
  const cps = traj.controlPoints ?? [];
  if (cps.length === 0) return "";

  let d = `M ${cps[0].x} ${cps[0].y}`;

  for (let i = 0; i < cps.length - 1; i++) {
    const a = cps[i];
    const b = cps[i + 1];

    // Each CP's splineType affects the segment that STARTS at that CP
    const type = a.splineType; // e.g. "BEZIER" | "LINEAR"

    if (type === "BEZIER") {
      // Get absolute positions of handles using the helper functions
      const c1 = getHandlePosition(traj.id, a.id, "out");
      const c2 = getHandlePosition(traj.id, b.id, "in");

      // Fallback to anchor points if handles are missing
      const c1x = c1?.x ?? a.x;
      const c1y = c1?.y ?? a.y;
      const c2x = c2?.x ?? b.x;
      const c2y = c2?.y ?? b.y;

      d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${b.x} ${b.y}`;
    } else {
      // Default to straight line
      d += ` L ${b.x} ${b.y}`;
    }
  }

  return d;
}
