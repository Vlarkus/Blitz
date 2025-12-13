import { useEffect } from "react";
import { useDataStore } from "../models/dataStore";

export function useUndoRedoHotkeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod) return;

      // Ctrl/Cmd + Z  → Undo
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useDataStore.getState().undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z → Redo (Mac style)
      if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        useDataStore.getState().redo();
        return;
      }

      // Ctrl/Cmd + Y → Redo (Windows style)
      if (e.key === "y") {
        e.preventDefault();
        useDataStore.getState().redo();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
