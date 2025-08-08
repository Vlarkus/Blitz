// Topological types

export type SplineType = "LINEAR" | "BEZIER" | "CLOTHOID";
export type SymmetryType = "BROKEN" | "ALIGNED" | "MIRRORED";
export type InterpolationType = "EQUIDISTANT" | "UNIFORM";

export type Unit = "m" | "cm" | "in";

export interface Vec2 {
  x: number;
  y: number;
}

// Color type
export type Color = `#${string}`; // Hex color format

// Tool types
export type ToolID =
  | "move"
  | "add"
  | "delete"
  | "insert"
  | "cut"
  | "merge"
  | "simulate";
