import "./cp-card.scss";
import { EditableLabel } from "../../../../../common/editable-label";
import { useDataStore } from "../../../../../../models/dataStore";

type CpCardProps = {
  trajId: string;
  cpId: string;
};

export default function CpCard({ trajId, cpId }: CpCardProps) {
  // Lookups
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const cp = useDataStore((s) => s.getControlPoint(trajId, cpId));

  // Actions / selection
  const setSelectedControlPointId = useDataStore(
    (s) => s.setSelectedControlPointId
  );
  const setControlPointLock = useDataStore((s) => s.setControlPointLock);
  const renameControlPoint = useDataStore((s) => s.renameControlPoint);
  const selectedControlPointId = useDataStore((s) => s.selectedControlPointId);

  if (!traj || !cp) return null;

  const selected = selectedControlPointId === cpId;

  const handleToggleLocked = () => {
    setControlPointLock(traj.id, cp.id, !cp.isLocked);
  };

  const handleRename = (next: string) => {
    renameControlPoint(traj.id, cp.id, next);
  };

  return (
    <div
      className={`cp-card${selected ? " selected" : ""}`}
      role="group"
      aria-label="Control Point card"
      onClick={() => setSelectedControlPointId(cpId)}
    >
      <div className="left-half">
        <div className="cp-card-name">
          <EditableLabel<string>
            value={cp.name}
            onCommit={handleRename}
            ariaLabel="Control point name"
            className="el"
            labelClassName="el-label"
            inputClassName="el-input"
          />
        </div>
      </div>

      <div className="right-half">
        <button
          type="button"
          className={`cp-card-icon ${cp.isLocked ? "is-on" : "is-off"}`}
          onClick={handleToggleLocked}
          aria-label={
            cp.isLocked ? "Unlock control point" : "Lock control point"
          }
          title={cp.isLocked ? "Locked" : "Unlocked"}
        >
          {cp.isLocked ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 10V7a5 5 0 0 1 9.5-2M6 10h12v10H6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
