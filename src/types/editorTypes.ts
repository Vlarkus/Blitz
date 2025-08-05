export type ToolID = "select" | "add" | "insert" | "remove" | "pan" | "zoom";

export type SplineType = "Line" | "CubicBezier" | "Clothoid";

export type InterpolationType = "Equidistant" | "FixedCount";

export type SymmetryType = "broken" | "aligned" | "mirrored";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Handle {
  dx: number;
  dy: number;
}

export interface ControlPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  theta: number | null;
  splineType: SplineType; // NOTE: The spline type applies to the path AFTER this control point.
  symmetry: SymmetryType;
  handleIn: Handle;
  handleOut: Handle;
  isLocked?: boolean;
  isVisible?: boolean;
}

export interface Trajectory {
  id: string;
  name: string;
  color: `#${string}`;
  splineType?: SplineType;
  interpolationType?: InterpolationType;
  isLocked: boolean;
  isVisible: boolean;
  controlPoints: ControlPoint[];
}
