import type { Trajectory } from "../entities/trajectory/trajectory";

// 1 m = 39.37007874 in
const METERS_TO_INCHES = 39.37007874;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export function exportAsFtc14423RobocornsSwerve(trajectory: Trajectory) {
  const safeMapName = trajectory.name
    .replace(/[^a-z0-9_]/gi, "_") // Replace invalid chars with _
    .replace(/^[0-9]/, "_$&") // Prefix with _ if starts with number
    .replace(/_+/g, "_") // Collapse multiple underscores
    .toLowerCase();

  let content = `Map<String, double[][][]> ${safeMapName} = new HashMap<>() {{\n`;

  const cps = trajectory.controlPoints;

  for (let i = 0; i < cps.length - 1; i++) {
    const cp = cps[i];
    const next = cps[i + 1];

    // --- heading: radians -> degrees ---
    const headingDeg = radToDeg(next.heading ?? 0);

    // --- positions in inches, assuming cp.x / cp.y / r are in meters ---

    // handleOut absolute (in inches)
    const handleOutAbs = cp.handleOut
      ? {
          x:
            -(cp.x + cp.handleOut.r * Math.cos(cp.handleOut.theta)) *
            METERS_TO_INCHES,
          y:
            -(cp.y + cp.handleOut.r * Math.sin(cp.handleOut.theta)) *
            METERS_TO_INCHES,
        }
      : null;

    // handleIn absolute (in inches)
    const handleInAbs = next.handleIn
      ? {
          x:
            -(next.x + next.handleIn.r * Math.cos(next.handleIn.theta)) *
            METERS_TO_INCHES,
          y:
            -(next.y + next.handleIn.r * Math.sin(next.handleIn.theta)) *
            METERS_TO_INCHES,
        }
      : null;

    // Build point list in inches
    let points: { x: number; y: number }[] = [];

    if (cp.splineType === "BEZIER" && handleOutAbs && handleInAbs) {
      points = [
        {
          x: -(next.x * METERS_TO_INCHES),
          y: -(next.y * METERS_TO_INCHES),
        },
        handleInAbs,
        handleOutAbs,
        {
          x: -(cp.x * METERS_TO_INCHES),
          y: -(cp.y * METERS_TO_INCHES),
        },
      ];
    } else {
      points = [
        {
          x: -(next.x * METERS_TO_INCHES),
          y: -(next.y * METERS_TO_INCHES),
        },
        {
          x: -(cp.x * METERS_TO_INCHES),
          y: -(cp.y * METERS_TO_INCHES),
        },
      ];
    }

    const pointsStr = points
      .map((p) => `{ ${p.x.toFixed(3)}, ${p.y.toFixed(3)} }`)
      .join(", ");

    content += `    put("${
      cp.name
    }", new double[][][]{ { ${pointsStr} }, { { ${headingDeg.toFixed(
      5
    )} } } });\n`;
  }

  content += `}};\n`;

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
