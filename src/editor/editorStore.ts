import { create } from "zustand";
import type { Vec2, ToolID, Unit } from "../types/types";

interface EditorState {
  // Viewport
  pan: Vec2;
  zoom: number;
  setPanZoom: (p: Vec2, z: number) => void;

  // Tool selection
  activeTool: ToolID;
  setActiveTool: (tool: ToolID) => void;

  // Units
  unit: Unit;
  pxPerMeter: number;
}

export const useEditorStore = create<EditorState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1,
  setPanZoom: (p, z) => set({ pan: p, zoom: z }),

  activeTool: "move",
  setActiveTool: (tool) => set({ activeTool: tool }),

  unit: "m",
  pxPerMeter: 100,
}));
