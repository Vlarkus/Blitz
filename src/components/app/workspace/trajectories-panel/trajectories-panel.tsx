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
  const execute = useDataStore((s) => s.execute);
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );
  const setSelectedTrajectoryId = useDataStore(
    (s) => s.setSelectedTrajectoryId
  );

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target !== e.currentTarget) return; // clicked a child → ignore
    setSelectedControlPointId(null);
  };

  return (
    <div className="tr-panel">
      <div className="side-panel-element tr-list" onClick={handleClick}>
        {trajectories.map((traj) => (
          <TrCard trID={traj.id} key={traj.id} />
        ))}
      </div>

      <div className="tr-edit-options">
        <button
          className="btn"
          onClick={() => {
            const traj = new Trajectory("Trajectory", []);
            const trajId = traj.id;
            execute({
              redo: () => {
                addTrajectory(traj);
                setSelectedTrajectoryId(trajId);
              },
              undo: () => {
                removeTrajectory(trajId);
              },
            });
          }}
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
              // Remove the selected trajectory with undo/redo
              const trajId = selectedTrajectoryId;
              const trajToRemove = trajectories.find((t) => t.id === trajId);

              if (trajToRemove) {
                execute({
                  redo: () => {
                    removeTrajectory(trajId);
                  },
                  undo: () => {
                    addTrajectory(trajToRemove);
                    setSelectedTrajectoryId(trajId);
                  },
                });
              }
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
