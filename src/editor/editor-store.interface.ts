import type { Tool } from "../types/types";

export interface Viewport {
  // pixels per meter
  scale: number;
  // world -> screen: screen = world * scale + origin
  originX: number;
  originY: number;
  // stage size in pixels
  stageWidth: number;
  stageHeight: number;
  // snapping
  snappingEnabled: boolean; // master toggle
  snapGridM: number; // grid pitch in meters
}

export type AxisDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type RotationDirection = "CW" | "CCW";
export type AngleUnit = "DEGREES" | "RADIANS" | "ROTATIONS";
export type DistanceUnit = "METERS" | "INCHES" | "FEET";

export interface CanvasConfig {
  coordinateSystem: {
    positiveX: AxisDirection;
    positiveY: AxisDirection;
    zeroAngle: AxisDirection;
    rotationDirection: RotationDirection;
  };
  units: {
    angle: AngleUnit;
    distance: DistanceUnit;
  };
}

export interface RobotConfig {
  widthM: number;
  heightM: number;
}

export interface IEditorStore {
  // State
  activeTool: Tool;
  activeViewport: Viewport;
  robotConfig: RobotConfig;
  canvasConfig: CanvasConfig;

  // Hover indicator (null = not hovering the canvas)
  hoverWorld: { xM: number; yM: number } | null;
  hoveredElementName: string | null;
  hoveredCurvePoint:
    | { trajId: string; index: number; x: number; y: number; heading: number }
    | null;

  // Hover helpers
  setHoverFromScreen(xPx: number, yPx: number): void;
  clearHover(): void;
  setHoveredElementName(name: string | null): void;
  setHoveredCurvePoint(
    point:
      | { trajId: string; index: number; x: number; y: number; heading: number }
      | null
  ): void;

  // Tool
  setActiveTool(tool: Tool): void;

  // Stage sizing (px)
  setStageSize(width: number, height: number): void;

  // Pan/zoom
  panBy(dxPx: number, dyPx: number): void; // adjust origin by screen deltas
  panTo(originXPx: number, originYPx: number): void; // set absolute origin
  zoomTo(scale: number, centerScreenX: number, centerScreenY: number): void; // zoom keeping a screen point fixed
  zoomBy(factor: number, centerScreenX: number, centerScreenY: number): void; // multiplicative zoom
  setScale(scale: number): void; // simple setter (no re-centering)

  // Snapping controls
  setSnappingEnabled(enabled: boolean): void;
  setSnapGridMeters(meters: number): void;

  // Transforms
  worldToScreen(xM: number, yM: number): { xPx: number; yPx: number };
  screenToWorld(xPx: number, yPx: number): { xM: number; yM: number };

  // Settings
  setRobotConfig(config: Partial<RobotConfig>): void;
  setCanvasConfig(config: Partial<CanvasConfig> | ((prev: CanvasConfig) => Partial<CanvasConfig>)): void;
}
