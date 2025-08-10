// src/domain/Trajectory/iTrajectory.ts
import type {
  ColorHex,
  InterpolationType,
  SymmetryType,
  SplineType,
} from "../../../types/types";
import type { ControlPoint } from "../controlPoint/controlPoint";

export interface TrajectoryInternalAPI {
  // meta
  setName(name: string): void;
  setColor(color: ColorHex): void;
  setInterpolationType(type: InterpolationType): void;
  setIsVisible(isVisible: boolean): void;
  setIsLocked(isLocked: boolean): void;

  // control points
  addControlPoint(cp: ControlPoint): void;
  insertControlPoint(cp: ControlPoint, index: number): void;
  insertControlPointBefore(cp: ControlPoint, beforeId: string): void;
  insertControlPointAfter(cp: ControlPoint, afterId: string): void;
  removeControlPoint(id: string): void;
  removeAllControlPoints(): void;
  copyControlPoint(id: string): ControlPoint | undefined;

  // neighbor-aware operations kept here for now (class-level)
  setControlPointPosition(id: string, x: number, y: number): void;

  // TODO: Revisit symmetry enforcement rules; align with trajectory-level ops later
  setControlPointSymmetry(id: string, symmetry: SymmetryType): void;

  // TODO: Verify shared state issues when changing spline type
  setControlPointSplineType(id: string, splineType: SplineType): void;

  setHelperPointPosition(
    cpId: string,
    handle: "in" | "out",
    absX: number,
    absY: number
  ): void;
}
