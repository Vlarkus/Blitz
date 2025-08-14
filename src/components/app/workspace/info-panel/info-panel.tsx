import "./info-panel.scss";
import { useDataStore } from "../../../../models/dataStore";
import TrajectoryInfo from "./trajectory-info/trajectory-info";
import ControlPointInfo from "./control-point-info/control-point-info";

export default function InfoPanel() {
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );
  const selectedControlPointId = useDataStore(
    (state) => state.selectedControlPointId
  );
  const cp = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
      : undefined
  );
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);

  return (
    <div className="info-panel">
      <TrajectoryInfo />
      <hr className="divider" />
      <ControlPointInfo />
      <hr className="divider" />
    </div>
  );
}
