import React from "react";
import "./tr-card.scss";
import { AnimatePresence, motion } from "framer-motion";
import { EditableLabel } from "../../../../common/editable-label";
import { Trajectory } from "../../../../../models/entities/trajectory/trajectory";
import { useDataStore } from "../../../../../models/dataStore";
import CpCard from "./cp-list/cp-card";

interface TrCardProps {
  trID: string;
}

export default function TrCard({ trID }: TrCardProps) {
  const dataStore = useDataStore(); // get the store instance

  const traj = dataStore.getTrajectoryById(trID) as Trajectory;

  const [expanded, setExpanded] = React.useState<boolean>(false);

  const toggleExpand = () => setExpanded((prev) => !prev);

  const handleToggleVisible = () => {
    dataStore.setTrajectoryVisibility(traj.id, !traj.isVisible);
  };

  const handleToggleLocked = () => {
    dataStore.setTrajectoryLock(traj.id, !traj.isLocked);
  };

  const handleRename = (next: string) => {
    dataStore.renameTrajectory(traj.id, next);
  };

  return (
    <>
      <div
        className={`tr-card${
          dataStore.selectedTrajectoryId === traj.id ? " selected" : ""
        }`}
        role="group"
        aria-label="Trajectory card"
        onClick={() => dataStore.setSelectedTrajectoryId(traj.id)}
      >
        <div className="left-half">
          <button
            type="button"
            className={`tr-card-expander ${!expanded ? "is-open" : ""}`}
            aria-label={
              !expanded ? "Collapse control points" : "Expand control points"
            }
            onClick={toggleExpand}
          >
            {/* Chevron icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 10l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
          {/* Visible toggle (eye) */}
          <button
            type="button"
            className={`tr-card-icon ${traj.isVisible ? "is-on" : "is-off"}`}
            onClick={handleToggleVisible}
            aria-label={traj.isVisible ? "Hide trajectory" : "Show trajectory"}
            title={traj.isVisible ? "Visible" : "Hidden"}
          >
            {traj.isVisible ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M17.94 17.94C16.12 19.24 14.15 20 12 20 5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-6.06M22.94 12s-1.34 2.5-3.5 4.44M3 3l18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>
          {/* Lock toggle */}
          <button
            type="button"
            className={`tr-card-icon ${traj.isLocked ? "is-on" : "is-off"}`}
            onClick={handleToggleLocked}
            aria-label={traj.isLocked ? "Unlock trajectory" : "Lock trajectory"}
            title={traj.isLocked ? "Locked" : "Unlocked"}
          >
            {traj.isLocked ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
      {/* Control Points List */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="tr-card-cp-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {traj.controlPoints.map((cp) => (
              <motion.div
                key={cp.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                <CpCard trajId={traj.id} cpId={cp.id} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
