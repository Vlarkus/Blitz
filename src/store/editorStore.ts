import { create } from "zustand";
import type {
  Vec2,
  ToolID,
  Trajectory,
  ControlPoint,
} from "../types/editorTypes";

interface EditorState {
  // Viewport state
  pan: Vec2;
  zoom: number;
  setPan: (p: Vec2) => void;
  setZoom: (z: number) => void;
  setPanZoom: (p: Vec2, z: number) => void;

  // Tool state
  activeTool: ToolID;
  setActiveTool: (tool: ToolID) => void;

  // Units
  unit: "m" | "cm" | "in";
  pxPerMeter: number;

  // Trajectories
  trajectories: Trajectory[];
  addTrajectory: (traj: Trajectory) => void;
  removeTrajectory: (id: string) => void;
  addControlPoint: (trajectoryId: string, point: ControlPoint) => void;
  updateControlPoint: (
    trajectoryId: string,
    pointId: string,
    changes: Partial<ControlPoint>
  ) => void;
  removeControlPoint: (trajectoryId: string, pointId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Viewport state
  pan: { x: 0, y: 0 },
  zoom: 1,
  setPan: (p) => set({ pan: p }),
  setZoom: (z) => set({ zoom: z }),
  setPanZoom: (p, z) => set({ pan: p, zoom: z }),

  // Tool state
  activeTool: "select",
  setActiveTool: (tool) => {
    console.log("Tool changed to:", tool);
    set({ activeTool: tool });
  },

  // Unit system
  unit: "m",
  pxPerMeter: 100,

  // Trajectories
  trajectories: [],

  addTrajectory: (traj) =>
    set((state) => ({
      trajectories: [...state.trajectories, traj],
    })),

  removeTrajectory: (id) =>
    set((state) => ({
      trajectories: state.trajectories.filter((t) => t.id !== id),
    })),

  addControlPoint: (trajectoryId, point) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === trajectoryId
          ? { ...t, controlPoints: [...t.controlPoints, point] }
          : t
      ),
    })),

  updateControlPoint: (trajectoryId, pointId, changes) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === trajectoryId
          ? {
              ...t,
              controlPoints: t.controlPoints.map((p) =>
                p.id === pointId ? { ...p, ...changes } : p
              ),
            }
          : t
      ),
    })),

  removeControlPoint: (trajectoryId, pointId) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === trajectoryId
          ? {
              ...t,
              controlPoints: t.controlPoints.filter((p) => p.id !== pointId),
            }
          : t
      ),
    })),
}));