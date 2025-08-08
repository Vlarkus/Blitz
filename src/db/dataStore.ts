import { create } from "zustand";
import { Trajectory } from "./data/trajectory";

interface DataStore {
  trajectories: Trajectory[];
  activeTrajectoryId: string | null;
  activeControlPointId: string | null;

  addTrajectory: (trajectory: Trajectory) => void;
  removeTrajectoryById: (id: string) => void;
  removeTrajectoryByIndex: (index: number) => void;
  moveTrajectory: (fromIndex: number, toIndex: number) => void;
  cutTrajectory: (trajectoryId: string, controlPointId: string) => void;
  mergeTrajectories: (firstId: string, secondId: string) => void;
  getTrajectoryById: (id: string) => Trajectory | undefined;
  getTrajectoryByIndex: (index: number) => Trajectory | undefined;

  setActiveTrajectory: (id: string | null) => void;
  setActiveControlPoint: (id: string | null) => void;

  duplicateTrajectory: (id: string) => void;
  reorderTrajectories: (newOrder: string[]) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  trajectories: [],
  activeTrajectoryId: null,
  activeControlPointId: null,

  addTrajectory: (trajectory) => {
    set((state) => ({ trajectories: [...state.trajectories, trajectory] }));
  },

  removeTrajectoryById: (id) => {
    set((state) => ({
      trajectories: state.trajectories.filter((t) => t.id !== id),
      activeTrajectoryId:
        state.activeTrajectoryId === id ? null : state.activeTrajectoryId,
    }));
  },

  removeTrajectoryByIndex: (index) => {
    set((state) => {
      const newTrajectories = [...state.trajectories];
      const removed = newTrajectories.splice(index, 1)[0];
      return {
        trajectories: newTrajectories,
        activeTrajectoryId:
          removed?.id === state.activeTrajectoryId
            ? null
            : state.activeTrajectoryId,
      };
    });
  },

  moveTrajectory: (fromIndex, toIndex) => {
    set((state) => {
      const list = [...state.trajectories];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { trajectories: list };
    });
  },

  cutTrajectory: (trajectoryId, controlPointId) => {
    set((state) => {
      const original = state.trajectories.find((t) => t.id === trajectoryId);
      if (!original) return {};
      const index = original.getCPIndex(controlPointId);
      if (index < 0 || index >= original.length - 1) return {};

      const newCPs = original.controlPoints.slice(index);
      original.removeAllCPs();
      original.controlPoints.push(...original.controlPoints.slice(0, index));

      const newTrajectory = original.clone();
      newTrajectory.removeAllCPs();
      newCPs.forEach((cp) => newTrajectory.appendCP(cp));

      return { trajectories: [...state.trajectories, newTrajectory] };
    });
  },

  mergeTrajectories: (firstId, secondId) => {
    set((state) => {
      const first = state.trajectories.find((t) => t.id === firstId);
      const second = state.trajectories.find((t) => t.id === secondId);
      if (!first || !second) return {};

      const merged = first.clone();
      second.controlPoints.forEach((cp) => merged.appendCP(cp));

      const filtered = state.trajectories.filter(
        (t) => t.id !== firstId && t.id !== secondId
      );
      return { trajectories: [...filtered, merged] };
    });
  },

  getTrajectoryById: (id) => {
    return get().trajectories.find((t) => t.id === id);
  },

  getTrajectoryByIndex: (index) => {
    return get().trajectories[index];
  },

  setActiveTrajectory: (id) => {
    set({ activeTrajectoryId: id });
  },

  setActiveControlPoint: (id) => {
    set({ activeControlPointId: id });
  },

  duplicateTrajectory: (id) => {
    set((state) => {
      const original = state.trajectories.find((t) => t.id === id);
      if (!original) return {};
      const copy = original.clone();
      return { trajectories: [...state.trajectories, copy] };
    });
  },

  reorderTrajectories: (newOrder) => {
    set((state) => {
      const idMap = new Map(state.trajectories.map((t) => [t.id, t]));
      const reordered = newOrder
        .map((id) => idMap.get(id))
        .filter(Boolean) as Trajectory[];
      return { trajectories: reordered };
    });
  },
}));
