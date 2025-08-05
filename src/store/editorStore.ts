import { create } from "zustand";
import type {
  Vec2,
  ToolID,
  Trajectory,
  ControlPoint,
  InterpolationType,
} from "../types/editorTypes";

function getRandomColor(): `#${string}` {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color as `#${string}`;
}

function updateTrajectoryInList(
  list: Trajectory[],
  id: string,
  changes: Partial<Trajectory>
): Trajectory[] {
  return list.map((t) => (t.id === id ? { ...t, ...changes } : t));
}

interface EditorState {
  // Viewport state
  pan: Vec2;
  zoom: number;
  setPanZoom: (p: Vec2, z: number) => void;

  // Tool state
  activeTool: ToolID;
  setActiveTool: (tool: ToolID) => void;

  // Units
  unit: "m" | "cm" | "in";
  pxPerMeter: number;

  // Selection
  selectedTrajectoryId: string | null;
  selectedControlPointId: string | null;
  setSelectedTrajectoryId: (id: string | null) => void;
  setSelectedControlPointId: (id: string | null) => void;

  // Trajectories
  trajectories: Trajectory[];
  addTrajectory: (traj: Trajectory) => void;
  removeTrajectory: (id: string) => void;
  reorderTrajectories: (newOrderIds: string[]) => void;
  updateTrajectory: (id: string, changes: Partial<Trajectory>) => void;

  // Control Points
  addControlPoint: (trajectoryId: string, point: ControlPoint) => void;
  updateControlPoint: (
    trajectoryId: string,
    pointId: string,
    changes: Partial<ControlPoint>
  ) => void;
  removeControlPoint: (trajectoryId: string, pointId: string) => void;

  // Demo
  seedDemo: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1,
  setPanZoom: (p, z) => set({ pan: p, zoom: z }),

  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),

  unit: "m",
  pxPerMeter: 100,

  selectedTrajectoryId: null,
  selectedControlPointId: null,
  setSelectedTrajectoryId: (id) =>
    set({ selectedTrajectoryId: id, selectedControlPointId: null }),
  setSelectedControlPointId: (id) => set({ selectedControlPointId: id }),

  trajectories: [],

  addTrajectory: (traj) =>
    set((state) => ({
      trajectories: [
        ...state.trajectories,
        { ...traj, color: getRandomColor(), interpolationType: "Equidistant" },
      ],
    })),

  removeTrajectory: (id) =>
    set((state) => {
      const isSelected = state.selectedTrajectoryId === id;
      return {
        trajectories: state.trajectories.filter((t) => t.id !== id),
        selectedTrajectoryId: isSelected ? null : state.selectedTrajectoryId,
        selectedControlPointId: isSelected
          ? null
          : state.selectedControlPointId,
      };
    }),

  reorderTrajectories: (newOrderIds) =>
    set((state) => {
      const byId = new Map(state.trajectories.map((t) => [t.id, t]));
      return {
        trajectories: newOrderIds.map((id) => byId.get(id)!).filter(Boolean),
      };
    }),

  updateTrajectory: (id, changes) =>
    set((state) => ({
      trajectories: updateTrajectoryInList(state.trajectories, id, changes),
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
    set((state) => {
      const isSelected = state.selectedControlPointId === pointId;
      return {
        trajectories: state.trajectories.map((t) =>
          t.id === trajectoryId
            ? {
                ...t,
                controlPoints: t.controlPoints.filter((p) => p.id !== pointId),
              }
            : t
        ),
        selectedControlPointId: isSelected
          ? null
          : state.selectedControlPointId,
      };
    }),

  seedDemo: () =>
    set({
      trajectories: [
        {
          id: "t1",
          name: "Broken Symmetry",
          color: "#4ea1ff",
          isLocked: false,
          isVisible: true,
          interpolationType: "Equidistant",
          controlPoints: [
            {
              id: "p1",
              name: "Start",
              x: 100,
              y: 100,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p2",
              name: "p2",
              x: 100,
              y: 100,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p3",
              name: "End",
              x: 100,
              y: 100,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
      ],
    }),
}));
