import { create } from "zustand";
import { Trajectory } from "./entities/trajectory/trajectory";
import type {
  ColorHex,
  ControlPointId,
  HandlePosInput,
  TrajectoryId,
} from "../types/types";
import { ControlPoint } from "./entities/control-point/controlPoint";
import { HelperPoint } from "./entities/helper-point/helperPoint";
import type { IDataStore } from "./data-store.interface";
import { clampPositive, normRad } from "../utils/utils";

type State = {
  // Collections
  trajectories: Trajectory[];

  // Selection
  selectedTrajectoryId: TrajectoryId | null;
  selectedControlPointId: ControlPointId | null;
};

type Actions = IDataStore;

type Store = State & Actions;

export const useDataStore = create<Store>((set, get) => ({
  /* =========================
   * Initial state
   * ========================= */
  trajectories: [],
  selectedTrajectoryId: null,
  selectedControlPointId: null,

  /* =========================
   * Selection
   * ========================= */
  setSelectedTrajectoryId(id) {
    set({ selectedTrajectoryId: id, selectedControlPointId: null });
  },

  setSelectedControlPointId(id: ControlPointId | null) {
    if (id === null) {
      set({ selectedControlPointId: null, selectedTrajectoryId: null });
      return;
    }

    const trId = get().getTrajectoryIdByControlPointId(id);
    set({
      selectedControlPointId: id,
      selectedTrajectoryId: trId ?? null,
    });
  },

  /* =========================
   * Trajectories
   * ========================= */
  addTrajectory(traj) {
    set((s) => ({ trajectories: [...s.trajectories, traj] }));
    traj.setDirtyNotifier(() => {
      set((s) => ({ ...s, trajectories: s.trajectories.slice() })); // <- publish new array ref
    });
  },

  removeTrajectory(id) {
    set((s) => ({
      trajectories: s.trajectories.filter((t) => t.id !== id),
      selectedTrajectoryId:
        s.selectedTrajectoryId === id ? null : s.selectedTrajectoryId,
      selectedControlPointId:
        s.selectedTrajectoryId === id ? null : s.selectedControlPointId,
    }));
  },

  renameTrajectory(id, name) {
    set((s) => {
      const idx = findTrajIndex(s.trajectories, id);
      if (idx < 0) return {};
      s.trajectories[idx].internal.setName(sanitizeName(name));
      return { trajectories: [...s.trajectories] };
    });
  },

  setTrajectoryColor(id, color) {
    set((s) => {
      const idx = findTrajIndex(s.trajectories, id);
      if (idx < 0) return {};
      s.trajectories[idx].internal.setColor(normalizeColor(color));
      return { trajectories: [...s.trajectories] };
    });
  },

  setTrajectoryVisibility(id, visible) {
    set((s) => {
      const idx = findTrajIndex(s.trajectories, id);
      if (idx < 0) return {};
      s.trajectories[idx].internal.setIsVisible(!!visible);
      return { trajectories: [...s.trajectories] };
    });
  },

  setTrajectoryLock(id, locked) {
    set((s) => {
      const idx = findTrajIndex(s.trajectories, id);
      if (idx < 0) return {};
      s.trajectories[idx].internal.setIsLocked(!!locked);
      return { trajectories: [...s.trajectories] };
    });
  },

  setControlPointLock(cpId: ControlPointId, locked: boolean) {
    set((s) => {
      s.setControlPointLock(cpId, !!locked);
      return { trajectories: [...s.trajectories] };
    });
  },

  setTrajectoryInterpolation(id, type) {
    set((s) => {
      const idx = findTrajIndex(s.trajectories, id);
      if (idx < 0) return {};
      s.trajectories[idx].internal.setInterpolationType(type);
      return { trajectories: [...s.trajectories] };
    });
  },

  cloneTrajectory(id) {
    const state = get();
    const idx = findTrajIndex(state.trajectories, id);
    if (idx < 0) return null;

    const src = state.trajectories[idx];
    const cloned = new Trajectory(
      src.name + " (copy)",
      src.controlPoints.map((cp) => deepCopyControlPoint(cp)),
      src.color,
      src.interpolationType,
      src.isVisible,
      src.isLocked
    );

    cloned.setDirtyNotifier(() => {
      set((s) => ({ ...s, trajectories: s.trajectories.slice() })); // <- publish new array ref
    });

    set((s) => ({ trajectories: [...s.trajectories, cloned] }));
    return cloned.id as TrajectoryId;
  },

  reorderTrajectory(fromIndex, toIndex) {
    set((s) => {
      const arr = [...s.trajectories];
      const from = clampIndex(fromIndex, 0, arr.length - 1);
      const to = clampIndex(toIndex, 0, arr.length - 1);
      if (from === to) return {};
      const [it] = arr.splice(from, 1);
      arr.splice(to, 0, it);
      return { trajectories: arr };
    });
  },

  /* =========================
   * Control Points
   * ========================= */
  addControlPoint(trajId, cp, index) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      if (index == null) t.internal.addControlPoint(cp);
      else t.internal.insertControlPoint(cp, clampIndex(index, 0, t.length));
      return { trajectories: [...s.trajectories] };
    });
  },

  insertControlPointBefore(trajId, beforeCpId, cp) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      t.internal.insertControlPointBefore(cp, beforeCpId);
      return { trajectories: [...s.trajectories] };
    });
  },

  insertControlPointAfter(trajId, afterCpId, cp) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      t.internal.insertControlPointAfter(cp, afterCpId);
      return { trajectories: [...s.trajectories] };
    });
  },

  removeControlPoint(trajId, cpId) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      t.internal.removeControlPoint(cpId);
      return {
        trajectories: [...s.trajectories],
        selectedControlPointId:
          s.selectedControlPointId === cpId ? null : s.selectedControlPointId,
      };
    });
  },

  renameControlPoint(trajId, cpId, name) {
    set((s) => {
      const cp = findCP(s.trajectories, trajId, cpId);
      if (!cp) return {};
      cp.internal.setName(sanitizeName(name));
      return { trajectories: [...s.trajectories] };
    });
  },

  moveControlPoint(trajId, cpId, x, y) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      t.internal.setControlPointPosition(
        cpId,
        assertFinite(x, "x"),
        assertFinite(y, "y")
      );
      return { trajectories: [...s.trajectories] };
    });
  },

  setControlPointHeading(trajId, cpId, heading) {
    // validate early if you want
    if (heading !== null && !Number.isFinite(heading as number)) return;

    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};

      // Prefer a trajectory-level method if you have it:

      // Fallback: direct CP call (still ok)
      const cp = t.controlPoints.find((c) => c.id === cpId);
      if (!cp) return {};
      cp.internal.setHeading(heading);

      // Notify subscribers by changing reference(s)
      return { trajectories: [...s.trajectories] };
    });
  },

  setControlPointSymmetry(trajId, cpId, symmetry) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      t.internal.setControlPointSymmetry(cpId, symmetry);
      return { trajectories: [...s.trajectories] };
    });
  },

  setControlPointSplineType(trajId, cpId, type) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};
      // TODO in model: verify shared state issues when changing spline type
      t.internal.setControlPointSplineType(cpId, type);
      return { trajectories: [...s.trajectories] };
    });
  },

  setControlPointEvent: (trajId, cpId, event) => {
    set((state) => {
      const t = findTraj(state.trajectories, trajId);
      if (!t) return {};

      const cp = t.controlPoints.find((c) => c.id === cpId);
      if (!cp) return {};

      // if you have an internal API for cp, call it here instead:
      // cp.internal.setEvent(event);

      cp.internal.setIsEvent(event);

      return { trajectories: [...state.trajectories] };
    });
  },

  /* =========================
   * Helper points (handles)
   * ========================= */
  setHandlePosition(trajId, cpId, which, pos) {
    set((s) => {
      const t = findTraj(s.trajectories, trajId);
      if (!t) return {};

      // If it's absolute, ensure numbers are finite
      if (pos.type === "absolute") {
        pos = {
          type: "absolute",
          x: assertFinite(pos.x, "x"),
          y: assertFinite(pos.y, "y"),
        };
      }

      t.internal.setHelperPointPosition(cpId, which, pos);
      return { trajectories: [...s.trajectories] };
    });
  },

  getHandlePosition(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    which: "in" | "out"
  ) {
    const cp = findCP(get().trajectories, trajId, cpId);
    if (!cp) return null;
    const h = which === "in" ? cp.handleIn : cp.handleOut;
    const r = clampPositive(h.r);
    const theta = normRad(h.theta);
    return {
      x: cp.x + r * Math.cos(theta),
      y: cp.y + r * Math.sin(theta),
    };
  },

  getHandlePolar(
    trajId: TrajectoryId,
    cpId: ControlPointId,
    which: "in" | "out"
  ) {
    const cp = findCP(get().trajectories, trajId, cpId);
    if (!cp) return null;
    const h = which === "in" ? cp.handleIn : cp.handleOut;
    return {
      r: clampPositive(h.r),
      theta: normRad(h.theta),
    };
  },

  /* =========================
   * Lookups & path ops
   * ========================= */
  getTrajectoryById(id) {
    return findTraj(get().trajectories, id);
  },

  getControlPoint(trajId, cpId) {
    return findCP(get().trajectories, trajId, cpId);
  },

  cutTrajectoryAt(trajId, cpId) {
    const state = get();
    const idx = findTrajIndex(state.trajectories, trajId);
    if (idx < 0) return null;

    const src = state.trajectories[idx];
    const splitIndex = src["controlPoints"].findIndex(
      (c: ControlPoint) => c.id === cpId
    );
    if (splitIndex <= 0 || splitIndex >= src.length - 1) return null; // require interior split

    const first = new Trajectory(
      src.name,
      src.controlPoints.slice(0, splitIndex + 1).map(deepCopyControlPoint),
      src.color,
      src.interpolationType,
      src.isVisible,
      src.isLocked
    );

    const second = new Trajectory(
      src.name + " (split)",
      src.controlPoints.slice(splitIndex).map(deepCopyControlPoint),
      src.color,
      src.interpolationType,
      src.isVisible,
      src.isLocked
    );

    first.setDirtyNotifier(() => {
      set((s) => ({ ...s, trajectories: s.trajectories.slice() })); // <- publish new array ref
    });
    second.setDirtyNotifier(() => {
      set((s) => ({ ...s, trajectories: s.trajectories.slice() })); // <- publish new array ref
    });

    set((s) => {
      const arr = [...s.trajectories];
      arr.splice(idx, 1, first, second);
      return { trajectories: arr };
    });

    return {
      firstId: first.id as TrajectoryId,
      secondId: second.id as TrajectoryId,
    };
  },

  getTrajectoryIdByControlPointId(cpId: ControlPointId): TrajectoryId | null {
    const traj = this.trajectories.find((t) =>
      t.controlPoints.some((cp) => cp.id === cpId)
    );
    return traj ? traj.id : null;
  },

  mergeTrajectories(firstId, secondId) {
    const state = get();
    const aIdx = findTrajIndex(state.trajectories, firstId);
    const bIdx = findTrajIndex(state.trajectories, secondId);
    if (aIdx < 0 || bIdx < 0 || aIdx === bIdx) return null;

    const a = state.trajectories[aIdx];
    const b = state.trajectories[bIdx];

    const mergedCPs = [
      ...a.controlPoints.map(deepCopyControlPoint),
      ...b.controlPoints.map(deepCopyControlPoint),
    ];

    const merged = new Trajectory(
      `${a.name} + ${b.name}`,
      mergedCPs,
      a.color,
      a.interpolationType,
      a.isVisible && b.isVisible,
      a.isLocked || b.isLocked
    );

    merged.setDirtyNotifier(() => {
      set((s) => ({ ...s, trajectories: s.trajectories.slice() })); // <- publish new array ref
    });

    set((s) => {
      const arr = [...s.trajectories];
      const i1 = Math.min(aIdx, bIdx);
      const i2 = Math.max(aIdx, bIdx);
      arr.splice(i2, 1);
      arr.splice(i1, 1, merged);
      return { trajectories: arr };
    });

    return merged.id as TrajectoryId;
  },

  touchTrajectory(trajId) {
    set((s) => {
      // Optionally assert trajId exists; either way publish a new array ref
      return { ...s, trajectories: s.trajectories.slice() };
    });
  },
}));

/* ========= Helpers ========= */

function findTraj(
  trajectories: Trajectory[],
  id: TrajectoryId
): Trajectory | undefined {
  const idx = findTrajIndex(trajectories, id);
  return idx >= 0 ? trajectories[idx] : undefined;
}

function findTrajIndex(trajectories: Trajectory[], id: TrajectoryId): number {
  return trajectories.findIndex((t) => t.id === id);
}

function findCP(
  trajectories: Trajectory[],
  trajId: TrajectoryId,
  cpId: ControlPointId
): ControlPoint | undefined {
  const t = findTraj(trajectories, trajId);
  if (!t) return undefined;
  const i = t["controlPoints"].findIndex((c: ControlPoint) => c.id === cpId);
  return i >= 0 ? (t["controlPoints"][i] as ControlPoint) : undefined;
}

function sanitizeName(name: string): string {
  if (typeof name !== "string") return "Trajectory";
  const t = name.trim();
  return t.length ? (t.length > 100 ? t.slice(0, 100) : t) : "Trajectory";
}

function normalizeColor(color: ColorHex): ColorHex {
  const s = (color || "").toString().trim();
  const hex = s.startsWith("#") ? s.slice(1) : s;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const ok = /^[0-9a-fA-F]{6}$/.test(full);
  return `#${ok ? full.toUpperCase() : "3A86FF"}` as ColorHex;
}

function clampIndex(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(Math.floor(n), max));
}

function assertFinite(n: number, label: string): number {
  if (!Number.isFinite(n)) {
    throw new Error(`${label} must be a finite number`);
  }
  return n;
}

// deep copy a ControlPoint, including HelperPoints
function deepCopyControlPoint(cp: ControlPoint): ControlPoint {
  const hin = new HelperPoint(
    cp.handleIn.r,
    cp.handleIn.theta,
    cp.handleIn.isLinear
  );
  const hout = new HelperPoint(
    cp.handleOut.r,
    cp.handleOut.theta,
    cp.handleOut.isLinear
  );
  return new ControlPoint(
    cp.name,
    cp.x,
    cp.y,
    cp.heading,
    cp.splineType,
    cp.symmetry,
    hin,
    hout,
    cp.isLocked,
    cp.isEvent
  );
}
