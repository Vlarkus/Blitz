import { useDataStore } from "../../../../models/dataStore";

export default function TrajectoriesPanel() {
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

  return <div className="side-panel-element">w</div>;
}
