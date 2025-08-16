import { useDataStore } from "../../models/dataStore";
import { ControlPoint } from "../../models/entities/control-point/controlPoint";
import { Trajectory } from "../../models/entities/trajectory/trajectory";
import "./app.scss";
import Menu from "./menu/menu";
import Workspace from "./workspace/workspace";

function demo() {
  const store = useDataStore.getState();

  const cp = new ControlPoint("Demo CP", 0, 0);

  store.addTrajectory(new Trajectory("Trajectory", [cp]));
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
