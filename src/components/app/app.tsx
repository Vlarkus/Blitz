// import { useDataStore } from "../../models/dataStore";
// import { ControlPoint } from "../../models/entities/control-point/controlPoint";
// import { Trajectory } from "../../models/entities/trajectory/trajectory";
// import type { SymmetryType, SplineType } from "../../types/types";
import "./app.scss";
import Menu from "./menu/menu";
import Workspace from "./workspace/workspace";
import InputCapabilityOverlay from "../input-capability-overlay/input-capability-overlay";

// function demo() {
//   const store = useDataStore.getState();

//   if (store.trajectories.length > 0) return;

//   // Example symmetry & spline types (replace with your actual enum values)
//   const sym: SymmetryType[] = ["BROKEN", "BROKEN", "ALIGNED", "MIRRORED"];
//   const spline: SplineType = "BEZIER" as SplineType;

//   const makeCPs = (offsetY: number, colorName: string) => [
//     new ControlPoint(`${colorName}-P0`, -10, 0 + offsetY, 0, spline, sym[0]),
//     new ControlPoint(`${colorName}-P1`, -5, 6 + offsetY, 0, spline, sym[1]),
//     new ControlPoint(`${colorName}-P2`, 5, 6 + offsetY, 0, spline, sym[2]),
//     new ControlPoint(`${colorName}-P3`, 10, 0 + offsetY, 0, spline, sym[3]),
//   ];

//   const tRed = new Trajectory("Red Trajectory", makeCPs(-22, "R"), "#ff3b30");

//   const tGreen = new Trajectory("Green Trajectory", makeCPs(0, "G"), "#34c759");

//   const tBlue = new Trajectory("Blue Trajectory", makeCPs(22, "B"), "#0a84ff");

//   store.addTrajectory(tRed);
//   store.addTrajectory(tGreen);
//   store.addTrajectory(tBlue);

//   // Select the green trajectory and its first control point
//   store.setSelectedTrajectoryId(tGreen.id);
//   store.setSelectedControlPointId(tGreen.controlPoints[0].id);
// }

export default function App() {
  // demo();
  return (
    <div className="app">
      <InputCapabilityOverlay />
      <Menu />
      <Workspace />
    </div>
  );
}
