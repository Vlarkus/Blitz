import { useDataStore } from "../../models/dataStore";
import { ControlPoint } from "../../models/entities/control-point/controlPoint";
import { Trajectory } from "../../models/entities/trajectory/trajectory";
import "./app.scss";
import Menu from "./menu/menu";
import Workspace from "./workspace/workspace";

function demo() {
  const store = useDataStore.getState();

  // Create a minimal control point
  const cp = new ControlPoint(
    "Demo CP", // name
    0, // x
    0 // y
    // all other params will use defaults
  );

  // Create a minimal trajectory with that control point
  const traj = new Trajectory(
    "Demo Trajectory", // name
    undefined, // color (random default)
    [cp] // controlPoints
    // other params use defaults
  );

  // Add to store and set as selected
  store.addTrajectory(traj);
  store.setSelectedTrajectoryId(traj.id);
  store.setSelectedControlPointId(cp.id);
}

export default function App() {
  demo();
  return (
    <div className="app">
      <Menu />
      <Workspace />
    </div>
  );
}
