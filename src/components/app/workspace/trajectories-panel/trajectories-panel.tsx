import { useDataStore } from "../../../../models/dataStore";
import { Trajectory } from "../../../../models/entities/trajectory/trajectory";
import TrCard from "./tr-card/tr-card";
import "./trajectories-panel.scss";

export default function TrajectoriesPanel() {
  const trajectories = useDataStore((s) => s.trajectories);

  const selectedTrajectoryId = useDataStore((s) => s.selectedTrajectoryId);
  const selectedControlPointId = useDataStore((s) => s.selectedControlPointId);

  const addTrajectory = useDataStore((s) => s.addTrajectory);
  const removeTrajectory = useDataStore((s) => s.removeTrajectory);
  const removeControlPoint = useDataStore((s) => s.removeControlPoint);

  return (
    <div className="tr-panel">
      <div className="side-panel-element tr-list">
        {trajectories.map((traj) => (
          <TrCard trID={traj.id} key={traj.id} />
        ))}
      </div>

      <div className="tr-edit-options">
        <button
          className="btn"
          onClick={() => addTrajectory(new Trajectory("Trajectory", []))}
          aria-label="Add trajectory"
          title="Add trajectory"
        >
          +
        </button>

        <button
          className="btn"
          aria-label="Remove selected item"
          title="Remove selected control point or trajectory"
          disabled={!selectedControlPointId && !selectedTrajectoryId}
          onClick={() => {
            if (selectedControlPointId && selectedTrajectoryId) {
              // Remove the selected control point
              removeControlPoint(selectedTrajectoryId, selectedControlPointId);
            } else if (selectedTrajectoryId) {
              // Remove the selected trajectory
              removeTrajectory(selectedTrajectoryId);
            }
            // else: nothing selected → no-op
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}
