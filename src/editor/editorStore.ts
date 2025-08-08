import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Vec2, ToolID, InterpolationType, Unit } from "../types/types";

function updateTrajectoryInList(
  list: Trajectory[],
  id: string,
  changes: Partial<Trajectory>
): Trajectory[] {
  return list.map((t) => (t.id === id ? { ...t, ...changes } : t));
}

// TODO: rework this file so it only manages editor store. Leave only selected trajectory & selected control point

interface EditorState {
  // Viewport state
  pan: Vec2;
  zoom: number;
  setPanZoom: (p: Vec2, z: number) => void;

  // Tool state
  activeTool: ToolID;
  setActiveTool: (tool: ToolID) => void;

  // Units
  unit: Unit;
  pxPerMeter: number;

  // Selection
  selectedTrajectoryId: string | null;
  selectedControlPointId: string | null;
  setSelectedTrajectoryId: (id: string | null) => void;
  setSelectedControlPointId: (id: string | null) => void;

  insertControlPoint: (
    trajectoryId: string,
    index: number,
    point: Omit<ControlPoint, "id">
  ) => void;

  // Trajectories
  trajectories: Trajectory[];
  addTrajectory: (traj: Trajectory) => void;
  removeTrajectory: (id: string) => void;
  reorderTrajectories: (newOrderIds: string[]) => void;
  updateTrajectory: (id: string, changes: Partial<Trajectory>) => void;

  cutTrajectoryAtPoint: (trajectoryId: string, controlPointId: string) => void;

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

  activeTool: "move",
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
          ? {
              ...t,
              controlPoints: [
                ...t.controlPoints,
                {
                  ...point,
                  id: nanoid(),
                  name: point.name || `P${t.controlPoints.length + 1}`,
                },
              ],
            }
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

  insertControlPoint: (trajectoryId, index, point) =>
    set((state) => ({
      trajectories: state.trajectories.map((t) =>
        t.id === trajectoryId
          ? {
              ...t,
              controlPoints: [
                ...t.controlPoints.slice(0, index),
                { ...point, id: crypto.randomUUID() },
                ...t.controlPoints.slice(index),
              ],
            }
          : t
      ),
    })),

  cutTrajectoryAtPoint: (trajectoryId, controlPointId) =>
    set((state) => {
      const original = state.trajectories.find((t) => t.id === trajectoryId);
      if (!original) return {};

      const index = original.controlPoints.findIndex(
        (p) => p.id === controlPointId
      );
      if (index === -1 || index === original.controlPoints.length - 1)
        return {};

      const cp = original.controlPoints[index];
      const tail = original.controlPoints.slice(index + 1);

      const newStart = {
        ...cp,
        id: crypto.randomUUID(),
        name: `${cp.name} (copy)`,
      };
      const newTrajectory = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (cut)`,
        controlPoints: [newStart, ...tail],
      };

      const updatedOriginal = {
        ...original,
        controlPoints: original.controlPoints.slice(0, index + 1),
      };

      return {
        trajectories: state.trajectories
          .filter((t) => t.id !== trajectoryId)
          .concat(updatedOriginal, newTrajectory),
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
              handleIn: { dx: -30, dy: -20 },
              handleOut: { dx: 30, dy: 10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p2",
              name: "Mid1",
              x: 200,
              y: 120,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -20, dy: -30 },
              handleOut: { dx: 20, dy: 10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p3",
              name: "Mid2",
              x: 300,
              y: 100,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -20, dy: 20 },
              handleOut: { dx: 30, dy: -10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "p4",
              name: "End",
              x: 400,
              y: 120,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "broken",
              handleIn: { dx: -40, dy: 0 },
              handleOut: { dx: 20, dy: 20 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
        {
          id: "t2",
          name: "Aligned Symmetry",
          color: "#52d273",
          isLocked: false,
          isVisible: true,
          interpolationType: "Equidistant",
          controlPoints: [
            {
              id: "a1",
              name: "Start",
              x: 100,
              y: 300,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -30, dy: 0 },
              handleOut: { dx: 30, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "a2",
              name: "Mid1",
              x: 200,
              y: 280,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -25, dy: 5 },
              handleOut: { dx: 25, dy: -5 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "a3",
              name: "Mid2",
              x: 300,
              y: 320,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -20, dy: 10 },
              handleOut: { dx: 20, dy: -10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "a4",
              name: "End",
              x: 400,
              y: 300,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "aligned",
              handleIn: { dx: -40, dy: 0 },
              handleOut: { dx: 40, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
        {
          id: "t3",
          name: "Mirrored Symmetry",
          color: "#e8835a",
          isLocked: false,
          isVisible: true,
          interpolationType: "Equidistant",
          controlPoints: [
            {
              id: "m1",
              name: "Start",
              x: 100,
              y: 500,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "mirrored",
              handleIn: { dx: -30, dy: 20 },
              handleOut: { dx: 30, dy: -20 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "m2",
              name: "Mid1",
              x: 200,
              y: 520,
              theta: null,
              splineType: "Line",
              symmetry: "mirrored",
              handleIn: { dx: -25, dy: 15 },
              handleOut: { dx: 25, dy: -15 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "m3",
              name: "Mid2",
              x: 300,
              y: 500,
              theta: null,
              splineType: "Line",
              symmetry: "mirrored",
              handleIn: { dx: -20, dy: 10 },
              handleOut: { dx: 20, dy: -10 },
              isLocked: false,
              isVisible: true,
            },
            {
              id: "m4",
              name: "End",
              x: 400,
              y: 520,
              theta: null,
              splineType: "CubicBezier",
              symmetry: "mirrored",
              handleIn: { dx: -40, dy: 0 },
              handleOut: { dx: 40, dy: 0 },
              isLocked: false,
              isVisible: true,
            },
          ],
        },
      ],
    }),

  // END of store
}));
