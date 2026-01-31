import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** All selectable field types */
export type FieldType =
  | "NONE"
  | "FTC_DECODE"
  | "V5RC_PUSHBACK_MATCH"
  | "V5RC_PUSHBACK_SKILLS"
  | "VURC_PUSHBACK"
  | "12X12_EMPTY"
  | "CUSTOM";

/** Field store for managing current background image */
interface FieldState {
  selectedField: FieldType;
  setSelectedField: (field: FieldType) => void;
}

/** Zustand store for field selection */
export const useFieldStore = create<FieldState>()(
  persist(
    (set) => ({
      selectedField: "NONE",
      setSelectedField: (field) => set({ selectedField: field }),
    }),
    {
      name: "blitz:field",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedField: state.selectedField }),
      version: 1,
    },
  ),
);

// src/editor/editorStore.ts
import type { IEditorStore, Viewport } from "./editor-store.interface";
import type { Tool } from "../types/types";

const MIN_SCALE = 10; // px per meter
const MAX_SCALE = 500; // px per meter
const MIN_SNAP = 1e-4; // meters
export const SCALE_COEFF = 180; // user scale 1 (100%) = 180 px per meter

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const useEditorStore = create<IEditorStore>()(
  persist(
    (set, get) => ({
  // State
  activeTool: "select" as Tool,
  activeViewport: {
    scale: SCALE_COEFF, // trueScale = 1 * SCALE_COEFF
    originX: 400, // center of 800px wide canvas
    originY: 300, // center of 600px tall canvas
    stageWidth: 800,
    stageHeight: 600,
    snappingEnabled: true,
    snapGridM: 0.1,
  } as Viewport,

  // --- state ---
  hoverWorld: null,

  // --- actions ---
  setHoverFromScreen(xPx, yPx) {
    const { xM, yM } = get().screenToWorld(xPx, yPx);
    set({ hoverWorld: { xM, yM } });
  },
  clearHover() {
    set({ hoverWorld: null });
  },

  // Tool
  setActiveTool(tool) {
    set({ activeTool: tool });
  },

  // Stage sizing
  setStageSize(width, height) {
    set((s) => ({
      activeViewport: {
        ...s.activeViewport,
        stageWidth: width,
        stageHeight: height,
        originX: width / 2, // keep world (0,0) centered
        originY: height / 2, // keep world (0,0) centered
      },
    }));
  },

  // Pan/zoom
  panBy(dxPx, dyPx) {
    set((s) => ({
      activeViewport: {
        ...s.activeViewport,
        originX: s.activeViewport.originX + dxPx,
        originY: s.activeViewport.originY + dyPx,
      },
    }));
  },

  panTo(originXPx, originYPx) {
    set((s) => ({
      activeViewport: {
        ...s.activeViewport,
        originX: originXPx,
        originY: originYPx,
      },
    }));
  },

  zoomTo(scale, centerScreenX, centerScreenY) {
    set((s) => {
      const vp = s.activeViewport;
      const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);

      // World point under the given screen point before zoom
      const wx = (centerScreenX - vp.originX) / vp.scale;
      const wy = (centerScreenY - vp.originY) / vp.scale;

      // Keep that world point fixed on screen after zoom
      const nextOriginX = centerScreenX - wx * nextScale;
      const nextOriginY = centerScreenY - wy * nextScale;

      return {
        activeViewport: {
          ...vp,
          scale: nextScale,
          originX: nextOriginX,
          originY: nextOriginY,
        },
      };
    });
  },

  zoomBy(factor, centerScreenX, centerScreenY) {
    const { activeViewport } = get();
    const targetScale = activeViewport.scale * factor;
    get().zoomTo(targetScale, centerScreenX, centerScreenY);
  },

  setScale(scale) {
    set((s) => ({
      activeViewport: {
        ...s.activeViewport,
        scale: clamp(scale, MIN_SCALE, MAX_SCALE),
      },
    }));
  },

  // Snapping
  setSnappingEnabled(enabled) {
    set((s) => ({
      activeViewport: { ...s.activeViewport, snappingEnabled: !!enabled },
    }));
  },

  setSnapGridMeters(meters) {
    const m = Math.max(meters, MIN_SNAP);
    set((s) => ({ activeViewport: { ...s.activeViewport, snapGridM: m } }));
  },

  // Transforms
  worldToScreen(xM, yM) {
    const { scale, originX, originY } = get().activeViewport;
    return { xPx: xM * scale + originX, yPx: yM * scale + originY };
    // Note: y-axis direction is conventional; invert here if your canvas uses a different origin.
  },

  screenToWorld(xPx, yPx) {
    const { scale, originX, originY } = get().activeViewport;
    return { xM: (xPx - originX) / scale, yM: (yPx - originY) / scale };
  },

  // Settings
  robotConfig: {
    widthM: 0.4572, // 18 inches
    heightM: 0.4572, // 18 inches
  },
  setRobotConfig(config) {
    set((s) => ({
      robotConfig: { ...s.robotConfig, ...config },
    }));
  },

  canvasConfig: {
    coordinateSystem: {
      positiveX: "RIGHT",
      positiveY: "UP",
      zeroAngle: "RIGHT",
      rotationDirection: "CCW",
    },
    units: {
      angle: "DEGREES",
      distance: "INCHES",
    },
  },
  setCanvasConfig(config) {
    set((s) => {
      const newConfig =
        typeof config === "function" ? config(s.canvasConfig) : config;

      // Deep merge for nested objects
      return {
        canvasConfig: {
          ...s.canvasConfig,
          ...newConfig,
          coordinateSystem: {
            ...s.canvasConfig.coordinateSystem,
            ...(newConfig.coordinateSystem || {}),
          },
          units: {
            ...s.canvasConfig.units,
            ...(newConfig.units || {}),
          },
        },
      };
    });
  },
    }),
    {
      name: "blitz:settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        canvasConfig: state.canvasConfig,
        robotConfig: state.robotConfig,
      }),
      version: 1,
    },
  ),
);
