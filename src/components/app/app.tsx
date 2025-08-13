import { useDataStore } from "../../models/dataStore";
import "./app.scss";
import Menu from "./menu/menu";
import Workspace from "./workspace/workspace";

export default function App() {
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );
  const setSelectedTrajectoryId = useDataStore(
    (state) => state.setSelectedTrajectoryId
  );

  setSelectedTrajectoryId("default-trajectory-id");

  return (
    <div className="app">
      <Menu />
      <Workspace />
    </div>
  );
}
