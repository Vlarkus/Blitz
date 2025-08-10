import type { SplineType, SymmetryType } from "../../../types/types";
import type { HelperPoint } from "../helper-point/helperPoint";

export interface ControlPointInternalAPI {
  setName(name: string): void;
  setX(x: number): void;
  setY(y: number): void;
  setPosition(x: number, y: number): void;
  offsetX(offset: number): void;
  offsetY(offset: number): void;
  offsetPosition(offsetX: number, offsetY: number): void;
  setHeading(heading: number | null): void;
  setSplineType(splineType: SplineType): void;
  setSymmetry(symmetry: SymmetryType): void;
  setHandleIn(handle: HelperPoint): void;
  setHandleOut(handle: HelperPoint): void;
  setIsLocked(isLocked: boolean): void;
  setIsEvent(isEvent: boolean): void;
}
