import React from "react";
import "./cp-card.scss";
import { EditableLabel } from "../../../../../common/editable-label";
import { Trajectory } from "../../../../../../models/entities/trajectory/trajectory";
import { useDataStore } from "../../../../../../models/dataStore";
import { ControlPoint } from "../../../../../../models/entities/control-point/controlPoint";

type CpListProps = {
  cpID: string;
};

export default function CpCard({ cpID }: CpListProps) {
  const dataStore = useDataStore(); // get the store instance

  const traj = dataStore.getTrajectoryById(cpID) as Trajectory;
  console.log("traj", traj);
  const cp = dataStore.getControlPoint(traj.id, cpID) as ControlPoint;

  const [expanded, setExpanded] = React.useState<boolean>(false);

  const handleToggleLocked = () => {
    dataStore.setControlPointLock(cp.id, !cp.isLocked);
  };

  const handleRename = (next: string) => {
    dataStore.renameTrajectory(traj.id, next);
  };

  return (
    <div
      className={`cp-card${
        dataStore.selectedControlPointId === cpID ? " selected" : ""
      }`}
      role="group"
      aria-label="Control Point card"
      onClick={() => dataStore.setSelectedControlPointId(cpID)}
    >
      <div className="left-half">
        {/* Name */}
        <div className="tr-card-name">
          <EditableLabel<string>
            value={traj.name}
            onCommit={handleRename}
            ariaLabel="Trajectory name"
            className="el"
            labelClassName="el-label"
            inputClassName="el-input"
          />
        </div>
      </div>

      <div className="right-half">
        {/* Lock toggle */}
        <button
          type="button"
          className={`tr-card-icon ${traj.isLocked ? "is-on" : "is-off"}`}
          onClick={handleToggleLocked}
          aria-label={traj.isLocked ? "Unlock trajectory" : "Lock trajectory"}
          title={traj.isLocked ? "Locked" : "Unlocked"}
        >
          {traj.isLocked ? (
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
