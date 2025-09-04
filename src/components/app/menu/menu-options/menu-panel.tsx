import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type MenuProps = {
  buttonLabel: string;
  children: ReactNode;
};

export default function ({ buttonLabel, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Position panel
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const update = () => {
      const r = buttonRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Outside click
  // Close when clicking inside (but not on panel container itself)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!layerRef.current) return;
      if (layerRef.current === e.target) return; // clicked the panel background itself
      if (layerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`menu-option-button${open ? " is-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {buttonLabel}
      </button>

      {open &&
        createPortal(
          <div
            ref={layerRef}
            className="menu-panel"
            style={{ top: pos.top, left: pos.left }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}
