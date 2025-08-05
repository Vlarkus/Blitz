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
  selectedTrajectoryId: string | null;
  addTrajectory: (traj: Trajectory) => void;
  removeTrajectory: (id: string) => void;
  renameTrajectory: (id: string, name: string) => void;
  setTrajectoryVisibility: (id: string, visible: boolean) => void;
  setTrajectoryLock: (id: string, locked: boolean) => void;
  toggleTrajectoryVisibility: (id: string) => void;
  toggleTrajectoryLock: (id: string) => void;
  setSelectedTrajectoryId: (id: string | null) => void;

  // Achor Points
  addControlPoint: (trajectoryId: string, point: ControlPoint) => void;
  updateControlPoint: (
    trajectoryId: string,
    pointId: string,
    changes: Partial<ControlPoint>
  ) => void;
  removeControlPoint: (trajectoryId: string, pointId: string) => void;

  reorderTrajectories: (newOrderIds: string[]) => void;

  selectedControlPointId: string | null;
  setSelectedControlPointId: (id: string | null) => void;

  // Demo
  seedDemo: () => void;
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
  selectedTrajectoryId: null,

  addTrajectory: (traj) =>
    set((state) => ({
      trajectories: [...state.trajectories, traj],
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

  renameTrajectory: (id, name) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === id ? { ...t, name } : t
      ),
    })),

  setTrajectoryVisibility: (id, visible) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === id ? { ...t, isVisible: visible } : t
      ),
    })),

  setTrajectoryLock: (id, locked) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === id ? { ...t, isLocked: locked } : t
      ),
    })),

  toggleTrajectoryVisibility: (id) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === id ? { ...t, isVisible: !t.isVisible } : t
      ),
    })),

  toggleTrajectoryLock: (id) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === id ? { ...t, isLocked: !t.isLocked } : t
      ),
    })),

  setSelectedTrajectoryId: (id) =>
    set((state) => ({
      selectedTrajectoryId: id,
      selectedControlPointId: id === null ? null : state.selectedControlPointId,
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

  reorderTrajectories: (newOrderIds) =>
    set((state) => {
      const byId = new Map(state.trajectories.map((t) => [t.id, t]));
      return {
        trajectories: newOrderIds.map((id) => byId.get(id)!).filter(Boolean),
      };
    }),

  selectedControlPointId: null,
  setSelectedControlPointId: (id) => set({ selectedControlPointId: id }),

  // Demo data

  seedDemo: () =>
    set({
      trajectories: [
        {
          id: "t1",
          name: "Broken Symmetry",
          color: "#4ea1ff",
          isLocked: false,
          isVisible: true,
          controlPoints: [
            {
              id: "p1",
              x: 100,
              y: 100,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p2",
              x: 200,
              y: 200,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -20, dy: -20 },
              handleOut: { dx: 20, dy: 20 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p3",
              x: 300,
              y: 100,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p4",
              x: 400,
              y: 200,
              splineType: "Line",
              symmetry: "broken",
              handleIn: { dx: -20, dy: -20 },
              handleOut: { dx: 20, dy: 20 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
        {
          id: "t2",
          name: "Aligned Symmetry",
          color: "#2ecc71",
          isLocked: false,
          isVisible: true,
          controlPoints: [
            {
              id: "p5",
              x: 100,
              y: 300,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -30, dy: -10 },
              handleOut: { dx: 30, dy: 10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p6",
              x: 200,
              y: 400,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -25, dy: -15 },
              handleOut: { dx: 25, dy: 15 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p7",
              x: 300,
              y: 300,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p8",
              x: 400,
              y: 400,
              splineType: "Line",
              symmetry: "aligned",
              handleIn: { dx: -20, dy: -20 },
              handleOut: { dx: 20, dy: 20 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
        {
          id: "t3",
          name: "Mirrored Symmetry",
          color: "#e74c3c",
          isLocked: false,
          isVisible: true,
          controlPoints: [
            {
              id: "p9",
              x: 100,
              y: 500,
              splineType: "CubicBezier",
              symmetry: "mirrored",
              handleIn: { dx: -30, dy: 10 },
              handleOut: { dx: 30, dy: -10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p10",
              x: 200,
              y: 600,
              splineType: "CubicBezier",
              symmetry: "mirrored",
              handleIn: { dx: -25, dy: 15 },
              handleOut: { dx: 25, dy: -15 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p11",
              x: 300,
              y: 500,
              splineType: "CubicBezier",
              symmetry: "mirrored",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p12",
              x: 400,
              y: 600,
              splineType: "Line",
              symmetry: "mirrored",
              handleIn: { dx: -20, dy: 20 },
              handleOut: { dx: 20, dy: -20 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
      ],
    }),
}));
