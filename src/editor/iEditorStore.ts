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

export interface IEditorStore {
  // State
  activeTool: Tool;
  activeViewport: Viewport;

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
}
