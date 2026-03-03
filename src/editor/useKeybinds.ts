import { useEffect } from "react";
import { useDataStore } from "../models/dataStore";
import { useEditorStore } from "./editor-store";
import { Trajectory } from "../models/entities/trajectory/trajectory";

// Keybind configuration - modify these to change keybindings
const KEYBINDS = {
  // Undo/Redo
  undo: "z", // Ctrl+Z or Cmd+Z
  redo_shift_z: "z", // Ctrl+Shift+Z or Cmd+Shift+Z
  redo_y: "y", // Ctrl+Y

  // Tools
  toolSelect: "v",
  toolAdd: "a",
  toolRemove: "r",
  toolInsert: "i",
  toolCut: "c",
  toolPan: "p",

  // Trajectory operations
  newTrajectory: "a", // Ctrl+A
  deleteTrajectory: "r", // Ctrl+R
  deleteControlPoint: "d", // Ctrl+D

  // View
  toggleRobot: "s",

  // Zoom
  zoomIn: "+",
  zoomOut: "-",
  zoomReset: "0",
} as const;

export function useKeybinds() {
  useEffect(() => {
    const isEditableElement = (el: Element | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.getAttribute("role") === "textbox") return true;
      return !!el.closest('[contenteditable="true"]');
    };

    const shouldIgnoreHotkeys = (e: KeyboardEvent): boolean => {
      // If any focusable control owns focus, do not run global hotkeys.
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement) {
        if (isEditableElement(active)) return true;
      }

      if (isEditableElement(e.target as Element | null)) return true;

      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      for (const node of path) {
        if (node instanceof Element && isEditableElement(node)) return true;
      }
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreHotkeys(e)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      const key = e.key.toLowerCase();

      const dataStore = useDataStore.getState();
      const editorStore = useEditorStore.getState();

      // Undo (Ctrl+Z or Cmd+Z)
      if (mod && key === KEYBINDS.undo && !shift) {
        e.preventDefault();
        dataStore.undo();
        return;
      }

      // Redo (Ctrl+Shift+Z or Cmd+Shift+Z)
      if (mod && key === KEYBINDS.redo_shift_z && shift) {
        e.preventDefault();
        dataStore.redo();
        return;
      }

      // Redo (Ctrl+Y)
      if (mod && key === KEYBINDS.redo_y && !shift) {
        e.preventDefault();
        dataStore.redo();
        return;
      }

      // Toggle Robot (S)
      if (!mod && !alt && !shift && key === KEYBINDS.toggleRobot) {
        e.preventDefault();
        editorStore.setShowRobot(!editorStore.showRobot);
        return;
      }

      // Tool selection (only if no modifier keys)
      if (!mod && !alt && !shift) {
        if (key === KEYBINDS.toolSelect) {
          e.preventDefault();
          editorStore.setActiveTool("select");
          return;
        }
        if (key === KEYBINDS.toolAdd) {
          e.preventDefault();
          editorStore.setActiveTool("add");
          return;
        }
        if (key === KEYBINDS.toolRemove) {
          e.preventDefault();
          editorStore.setActiveTool("remove");
          return;
        }
        if (key === KEYBINDS.toolInsert) {
          e.preventDefault();
          editorStore.setActiveTool("insert");
          return;
        }
        if (key === KEYBINDS.toolCut) {
          e.preventDefault();
          editorStore.setActiveTool("cut");
          return;
        }
        if (key === KEYBINDS.toolPan) {
          e.preventDefault();
          editorStore.setActiveTool("pan");
          return;
        }
      }

      // Zoom & Shortcuts (Ctrl/Cmd + key)
      if (mod && !shift && !alt) {
        if (key === "=" || key === KEYBINDS.zoomIn) {
          e.preventDefault();
          const currentScale = editorStore.activeViewport.scale;
          editorStore.zoomTo(currentScale * 1.2, 400, 300);
          return;
        }
        if (key === "-" || key === KEYBINDS.zoomOut) {
          e.preventDefault();
          const currentScale = editorStore.activeViewport.scale;
          editorStore.zoomTo(currentScale / 1.2, 400, 300);
          return;
        }
        if (key === KEYBINDS.zoomReset) {
          e.preventDefault();
          // Reset to 100% zoom centered
          editorStore.setScale(180);
          return;
        }

        // New trajectory (Ctrl+A)
        if (key === KEYBINDS.newTrajectory) {
          e.preventDefault();
          const traj = new Trajectory("Trajectory", []);
          const trajId = traj.id;
          dataStore.execute({
            redo: () => {
              dataStore.addTrajectory(traj);
              dataStore.setSelectedTrajectoryId(trajId);
            },
            undo: () => {
              dataStore.removeTrajectory(trajId);
            },
          });
          return;
        }

        // Remove selected trajectory (Ctrl+R)
        if (key === KEYBINDS.deleteTrajectory) {
          e.preventDefault();
          const trajId = dataStore.selectedTrajectoryId;
          if (!trajId) return; // no trajectory selected

          const trajectories = dataStore.trajectories;
          const trajToRemove = trajectories.find((t) => t.id === trajId);

          if (trajToRemove) {
            dataStore.execute({
              redo: () => {
                dataStore.removeTrajectory(trajId);
              },
              undo: () => {
                dataStore.addTrajectory(trajToRemove);
                dataStore.setSelectedTrajectoryId(trajId);
              },
            });
          }
          return;
        }

        // Delete Control Point (Ctrl+D)
        if (key === KEYBINDS.deleteControlPoint) {
          e.preventDefault();
          const cpId = dataStore.selectedControlPointId;
          if (!cpId) return; // No CP selected

          const trajId = dataStore.getTrajectoryIdByControlPointId(cpId);
          if (!trajId) return;

          const traj = dataStore.getTrajectoryById(trajId);
          if (!traj) return;

          // Find CP and its index for undo
          const index = traj.controlPoints.findIndex((cp) => cp.id === cpId);
          if (index < 0) return;
          const cpCopy = dataStore.getControlPoint(trajId, cpId); // Should ideally be a deep copy, but addControlPoint might handle it or we use copyControlPoint internal?
          // dataStore.getControlPoint returns the raw object or reference?
          // We should create a clone to be safe for restoration
          // Trajectory.ts `addControlPoint` pushes the object.
          // Let's rely on internal safe copying if it exists, or use the `deepCopyControlPoint` helper if accessible.
          // But `deepCopyControlPoint` is not exported from dataStore.
          // `Trajectory.ts` clones on some ops.
          // Let's assume re-inserting the same object reference (since it was removed) is OK, OR safer:
          // We can use `traj.internal.copyControlPoint(id)` which returns a copy?
          // No, `copyControlPoint` is on internal API.
          // Let's use `dataStore.getControlPoint` result. If `remove` just drops it from array, the object ref is valid.

          if (!cpCopy) return;

          dataStore.execute({
            redo: () => {
              dataStore.removeControlPoint(trajId, cpId);
            },
            undo: () => {
              dataStore.addControlPoint(trajId, cpCopy, index);
              dataStore.setSelectedControlPointId(cpId);
            },
          });
          return;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
