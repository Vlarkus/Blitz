// export type ProjectId = string; // For future multi-project windows system
export type TrajectoryId = string;
export type ControlPointId = string;

// Color
export type ColorHex = `#${string}`; // Expect normalized #RRGGBB

export type SplineType = "LINEAR" | "BEZIER" | "CLOTHOID";
export type SymmetryType = "BROKEN" | "ALIGNED" | "MIRRORED";
export type InterpolationType = "EQUIDISTANT" | "UNIFORM";

export const SPLINE_TYPES: SplineType[] = ["LINEAR", "BEZIER", "CLOTHOID"];
export const SYMMETRY_TYPES: SymmetryType[] = ["BROKEN", "ALIGNED", "MIRRORED"];
export const INTERPOLATION_TYPES: InterpolationType[] = [
  "EQUIDISTANT",
  "UNIFORM",
];

// Tool
export type Tool =
  | "select"
  | "add"
  | "remove"
  | "insert"
  | "cut"
  | "merge"
  | "simulate";
