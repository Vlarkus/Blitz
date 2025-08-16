import { useDataStore } from "../../../../models/dataStore";
import { Trajectory } from "../../../../models/entities/trajectory/trajectory";
import TrCard from "./tr-card/tr-card";
import "./trajectories-panel.scss";

export default function TrajectoriesPanel() {
  const trajectories = useDataStore((state) => state.trajectories);
  const setSelectedTrajectoryId = useDataStore(
    (state) => state.setSelectedTrajectoryId
  );
  const setTrajectoryVisibility = useDataStore(
    (state) => state.setTrajectoryVisibility
  );
  const addTrajectory = useDataStore((state) => state.addTrajectory);
  const setTrajectoryLock = useDataStore((state) => state.setTrajectoryLock);

  return (
    <div className="tr-panel">
      <div className="side-panel-element tr-list">
        {trajectories.map((traj) => (
          <TrCard
            key={traj.id}
            name={traj.name}
            visible={traj.isVisible}
            locked={traj.isLocked}
            onToggleVisible={() =>
              setTrajectoryVisibility(traj.id, !traj.isVisible)
            }
            onToggleLocked={() => setTrajectoryLock(traj.id, !traj.isLocked)}
            onToggleExpand={(expanded: any) => {
              // later: show/hide control point list for this trajectory
              console.log("Expanded:", traj.id, expanded);
            }}
          />
        ))}
      </div>
      <div className="tr-edit-options">
        <button
          className="btn add-btn"
          onClick={() => addTrajectory(new Trajectory("Trajectory", []))}
        >
          +
        </button>
        <button className="btn delete-btn">−</button>
      </div>
    </div>
  );
}
