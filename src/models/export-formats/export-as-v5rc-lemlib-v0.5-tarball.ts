import type { Trajectory } from "../entities/trajectory/trajectory";

// meters → inches
const METERS_TO_INCHES = 39.37007874;

// temporary constant speed (0–127 VEX scale)
const DEFAULT_SPEED = 100;

export function exportAsLemLibTarball(trajectories: Trajectory[]) {
  let content = "";

  for (const trajectory of trajectories) {
    const safeName = trajectory.name.replace(/\s+/g, "");

    content += `#PATH-POINTS-START ${safeName}\n`;

    // NOTE: for now, using control points directly
    // later you will replace this with spline sampling
    for (const cp of trajectory.controlPoints) {
      const x = (cp.x * METERS_TO_INCHES).toFixed(3);
      const y = (cp.y * METERS_TO_INCHES).toFixed(3);

      content += `${x}, ${y}, ${DEFAULT_SPEED}\n`;
    }

    // duplicate last point (Path.jerryio convention)
    const last = trajectory.controlPoints.at(-1);
    if (last) {
      const x = (last.x * METERS_TO_INCHES).toFixed(3);
      const y = (last.y * METERS_TO_INCHES).toFixed(3);
      content += `${x}, ${y}, 0\n`;
    }

    content += `endData\n`;
  }

  // Optional footer
  content += `#Made with BLITZ (blitz.vlarkus.com)\n`;

  // download
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `lemlib_paths.txt`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
