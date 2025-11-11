// src/utils/exportAsFtc14423RobocornsSwerve.ts
import type { Trajectory } from "../entities/trajectory/trajectory";

const UNIT_SCALE = 1.0; // meters → change to 39.37 for inches if needed

/**
 * Export trajectory into a Java map format
 * compatible with FTC 14423 Robocorns Swerve.
 * Automatically downloads a .txt file using the same naming convention as saveToJSON.
 */
export function exportAsFtc14423RobocornsSwerve(trajectory: Trajectory) {
  let content = `Map<String, double[][][]> trajectoryMap = new HashMap<>() {{\n`;

  const cps = trajectory.controlPoints;

  for (let i = 0; i < cps.length - 1; i++) {
    const cp = cps[i];
    const next = cps[i + 1];

    // Compute handle positions in absolute coordinates
    const handleOutAbs = cp.handleOut
      ? {
          x: cp.x + cp.handleOut.r * Math.cos(cp.handleOut.theta) * UNIT_SCALE,
          y: cp.y + cp.handleOut.r * Math.sin(cp.handleOut.theta) * UNIT_SCALE,
        }
      : null;

    const handleInAbs = next.handleIn
      ? {
          x:
            next.x +
            next.handleIn.r * Math.cos(next.handleIn.theta) * UNIT_SCALE,
          y:
            next.y +
            next.handleIn.r * Math.sin(next.handleIn.theta) * UNIT_SCALE,
        }
      : null;

    // Build point list
    let points: { x: number; y: number }[] = [];

    if (cp.splineType === "BEZIER" && handleOutAbs && handleInAbs) {
      points = [
        { x: next.x * UNIT_SCALE, y: next.y * UNIT_SCALE },
        handleInAbs,
        handleOutAbs,
        { x: cp.x * UNIT_SCALE, y: cp.y * UNIT_SCALE },
      ];
    } else {
      points = [
        { x: next.x * UNIT_SCALE, y: next.y * UNIT_SCALE },
        { x: cp.x * UNIT_SCALE, y: cp.y * UNIT_SCALE },
      ];
    }

    const heading = (next.heading ?? 0).toFixed(5);
    const pointsStr = points
      .map((p) => `{ ${p.x.toFixed(3)}, ${p.y.toFixed(3)} }`)
      .join(", ");

    content += `    put("${cp.name}", new double[][][]{ { ${pointsStr} }, { { ${heading} } } });\n`;
  }

  content += `}};\n`;

  // --- Save as file (same as saveToJSON style) ---
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const safeName = trajectory.name.replace(/[^a-z0-9_-]/gi, "_");
  const fullName = `${safeName}.txt`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fullName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
