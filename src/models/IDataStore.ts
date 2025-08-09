import type { Trajectory } from "./data/trajectory";

export interface IDataStore {
  trajectories: Trajectory[];

  selectedTrajectoryId: string | null;
  selectedControlPointId: string | null;
  setSelectedTrajectoryId: (id: string | null) => void;
  setSelectedControlPointId: (id: string | null) => void;

  addTrajectory: (trajectory: Trajectory) => void;
  removeTrajectoryById: (id: string) => void;
  removeTrajectoryByIndex: (index: number) => void;
  moveTrajectory: (fromIndex: number, toIndex: number) => void;
  cutTrajectory: (trajectoryId: string, controlPointId: string) => void;
  mergeTrajectories: (firstId: string, secondId: string) => void;
  getTrajectoryById: (id: string) => Trajectory | undefined;
  getTrajectoryByIndex: (index: number) => Trajectory | undefined;

  duplicateTrajectory: (id: string) => void;
  reorderTrajectories: (newOrder: string[]) => void;
}
