import type {
  ColorHex,
  ControlPointId,
  HandlePosInput,
  InterpolationType,
  SplineType,
  SymmetryType,
  TrajectoryId,
} from "../types/types";
import type { ControlPoint } from "./entities/control-point/controlPoint";
import type { Trajectory } from "./entities/trajectory/trajectory";

export interface IDataStore {
  /** ───── Selection ───── */
  setSelectedTrajectoryId(id: TrajectoryId | null): void;
  setSelectedControlPointId(id: ControlPointId | null): void;

  /** ───── Trajectories ───── */
  addTrajectory(traj: Trajectory): void;
  removeTrajectory(id: TrajectoryId): void;
  renameTrajectory(id: TrajectoryId, name: string): void;
  setTrajectoryColor(id: TrajectoryId, color: ColorHex): void;
  setTrajectoryVisibility(id: TrajectoryId, visible: boolean): void;
  setTrajectoryLock(id: TrajectoryId, locked: boolean): void;
  setTrajectoryInterpolation(id: TrajectoryId, type: InterpolationType): void;
  cloneTrajectory(id: TrajectoryId): TrajectoryId | null;
  reorderTrajectory(fromIndex: number, toIndex: number): void;

  /** ───── Control Points ───── */
  addControlPoint(trajId: TrajectoryId, cp: ControlPoint, index?: number): void;
  insertControlPointBefore(
    trajId: TrajectoryId,
    beforeCpId: ControlPointId,
    cp: ControlPoint
  ): void;
  setControlPointLock(cpId: ControlPointId, locked: boolean): void;
  insertControlPointAfter(
    trajId: TrajectoryId,
    afterCpId: ControlPointId,
    cp: ControlPoint
  ): void;
  removeControlPoint(trajId: TrajectoryId, cpId: ControlPointId): void;
  renameControlPoint(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    name: string
  ): void;
  moveControlPoint(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    x: number,
    y: number
  ): void;
  setControlPointHeading(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    heading: number | null
  ): void;
  setControlPointSymmetry(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    symmetry: SymmetryType
  ): void;
  setControlPointSplineType(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    type: SplineType
  ): void;
  setControlPointEvent(trajId: string, cpId: string, event: boolean): void;

  /** ───── Helper Points (Handles) ───── */
  setHandlePosition(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    which: "in" | "out",
    pos: HandlePosInput
  ): void;

  getHandlePosition(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    which: "in" | "out"
  ): { x: number; y: number } | null;

  getHandlePolar(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    which: "in" | "out"
  ): { r: number; theta: number } | null;

  /** ───── Lookups & Path ops ───── */
  getTrajectoryIdByControlPointId(cpId: ControlPointId): TrajectoryId | null;
  getTrajectoryById(id: TrajectoryId): Trajectory | undefined;
  getControlPoint(
    trajId: TrajectoryId,
    cpId: ControlPointId
  ): ControlPoint | undefined;
  cutTrajectoryAt(
    trajId: TrajectoryId,
    cpId: ControlPointId
  ): { firstId: TrajectoryId; secondId: TrajectoryId } | null;
  mergeTrajectories(
    firstId: TrajectoryId,
    secondId: TrajectoryId
  ): TrajectoryId | null;

  touchTrajectory(trajId: TrajectoryId): void;
}
