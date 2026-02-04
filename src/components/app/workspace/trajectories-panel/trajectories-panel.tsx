import { useDataStore } from "../../../../models/dataStore";
import { Trajectory } from "../../../../models/entities/trajectory/trajectory";
import TrCard from "./tr-card/tr-card";
import "./trajectories-panel.scss";

export default function TrajectoriesPanel() {
  const trajectories = useDataStore((s) => s.trajectories);

  const selectedTrajectoryId = useDataStore((s) => s.selectedTrajectoryId);
  const selectedControlPointIds = useDataStore((s) => s.selectedControlPointIds);

  const addTrajectory = useDataStore((s) => s.addTrajectory);
  const removeTrajectory = useDataStore((s) => s.removeTrajectory);
  const removeControlPoint = useDataStore((s) => s.removeControlPoint);
  const getTrajectoryIdByControlPointId = useDataStore(
    (s) => s.getTrajectoryIdByControlPointId
  );
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

  const existingTrajectoryIds = new Set(trajectories.map((t) => t.id));
  const selectedTrajectoryExists =
    selectedTrajectoryId != null && existingTrajectoryIds.has(selectedTrajectoryId);
  const deletableControlPoints = selectedControlPointIds
    .map((cpId) => ({ cpId, trajId: getTrajectoryIdByControlPointId(cpId) }))
    .filter((item): item is { cpId: string; trajId: string } => item.trajId !== null);
  const trajectoryIdsToDelete = Array.from(
    new Set([
      ...(selectedTrajectoryExists && selectedTrajectoryId
        ? [selectedTrajectoryId]
        : []),
      ...deletableControlPoints.map((item) => item.trajId),
    ])
  );
  const canDeleteTrajectories = trajectoryIdsToDelete.length > 0;
  const canDeleteControlPoints = deletableControlPoints.length > 0;

  return (
    <div className="tr-panel">
      <div className="side-panel-element tr-list" onClick={handleClick}>
        {trajectories.map((traj) => (
          <TrCard trID={traj.id} key={traj.id} />
        ))}
      </div>

      <div className="tr-edit-options">
        <div className="tr-edit-segment side-panel-element">
          <button
            className="btn tr-icon-btn"
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
            <span className="tr-icon-base" aria-hidden="true">
              +
            </span>
            <span className="tr-icon-badge" aria-hidden="true">
              tr
            </span>
          </button>

          <button
            className="btn tr-icon-btn"
            aria-label="Remove selected trajectories"
            title="Remove selected trajectory(ies)"
            disabled={!canDeleteTrajectories}
            onClick={() => {
              const trajectoriesToDelete = trajectories.filter((t) =>
                trajectoryIdsToDelete.includes(t.id)
              );
              if (trajectoriesToDelete.length === 0) return;

              execute({
                redo: () => {
                  trajectoryIdsToDelete.forEach((trajId) =>
                    removeTrajectory(trajId)
                  );
                },
                undo: () => {
                  trajectoriesToDelete.forEach((traj) => addTrajectory(traj));
                  if (trajectoriesToDelete.length === 1) {
                    setSelectedTrajectoryId(trajectoriesToDelete[0].id);
                  } else {
                    setSelectedTrajectoryId(null);
                  }
                },
              });
            }}
          >
            <span className="tr-icon-base" aria-hidden="true">
              −
            </span>
            <span className="tr-icon-badge" aria-hidden="true">
              tr
            </span>
          </button>
        </div>

        <div className="tr-edit-segment side-panel-element">
          <button
            className="btn tr-icon-btn"
            aria-label="Remove selected control points"
            title="Remove selected control point(s)"
            disabled={!canDeleteControlPoints}
            onClick={() => {
              deletableControlPoints.forEach(({ cpId, trajId }) => {
                removeControlPoint(trajId, cpId);
              });
            }}
          >
            <span className="tr-icon-base" aria-hidden="true">
              −
            </span>
            <span className="tr-icon-badge" aria-hidden="true">
              cp
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
