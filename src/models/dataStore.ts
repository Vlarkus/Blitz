import { create } from "zustand";
import { Trajectory } from "./data/trajectory";
import type { IDataStore } from "./IDataStore";

export const useDataStore = create<IDataStore>((set, get) => ({
  trajectories: [],
  selectedTrajectoryId: null,
  selectedControlPointId: null,

  setSelectedTrajectoryId: (id) =>
    set({ selectedTrajectoryId: id, selectedControlPointId: null }),

  setSelectedControlPointId: (id) => {
    const trajectory = get().trajectories.find((t) =>
      t.controlPoints.some((cp) => cp.id === id)
    );
    if (!trajectory) return;
    set({
      selectedControlPointId: id,
      selectedTrajectoryId: trajectory.id,
    });
  },

  addTrajectory: (trajectory) => {
    set((state) => ({ trajectories: [...state.trajectories, trajectory] }));
  },

  removeTrajectoryById: (id) => {
    set((state) => ({
      trajectories: state.trajectories.filter((t) => t.id !== id),
      selectedTrajectoryId:
        state.selectedTrajectoryId === id ? null : state.selectedTrajectoryId,
      selectedControlPointId:
        state.selectedTrajectoryId === id ? null : state.selectedControlPointId,
    }));
  },

  removeTrajectoryByIndex: (index) => {
    set((state) => {
      const newTrajectories = [...state.trajectories];
      const removed = newTrajectories.splice(index, 1)[0];
      const wasSelected = removed?.id === state.selectedTrajectoryId;
      return {
        trajectories: newTrajectories,
        selectedTrajectoryId: wasSelected ? null : state.selectedTrajectoryId,
        selectedControlPointId: wasSelected
          ? null
          : state.selectedControlPointId,
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

      if (index <= 0 || index >= original.length - 1) return {};

      const newCPs = original.controlPoints.slice(index);
      original.removeAllCPs();
      original.controlPoints.push(...original.controlPoints.slice(0, index));

      const newTrajectory = original.clone();
      newTrajectory.removeAllCPs();
      newCPs.forEach((cp) => newTrajectory.appendCP(cp));

      const firstCP = newTrajectory.getFirstCP();
      return {
        trajectories: [...state.trajectories, newTrajectory],
        selectedTrajectoryId: newTrajectory.id,
        selectedControlPointId: firstCP ? firstCP.id : null,
      };
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

      const wasSelected =
        state.selectedTrajectoryId === firstId ||
        state.selectedTrajectoryId === secondId;

      return {
        trajectories: [...filtered, merged],
        selectedTrajectoryId: wasSelected
          ? merged.id
          : state.selectedTrajectoryId,
        selectedControlPointId: wasSelected
          ? null
          : state.selectedControlPointId,
      };
    });
  },

  getTrajectoryById: (id) => {
    return get().trajectories.find((t) => t.id === id);
  },

  getTrajectoryByIndex: (index) => {
    return get().trajectories[index];
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
