import type { ControlPoint } from "../types/editorTypes";
import { useEditorStore } from "../store/editorStore";
import { FaEye, FaEyeSlash, FaLock, FaLockOpen } from "react-icons/fa";

interface Props {
  trajId: string;
  point: ControlPoint;
  index: number; // 0-based
}

export default function AnchorCard({ trajId, point, index }: Props) {
  const { updateControlPoint } = useEditorStore();

  const toggleLocked = () =>
    updateControlPoint(trajId, point.id, { isLocked: !point.isLocked });

  return (
    <div
      className="anchor-card d-flex align-items-center justify-content-between px-2 py-1"
      style={{ userSelect: "none" }}
    >
      {/* Left: index badge + label (simple text for now) */}
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <span className="anchor-index-badge">{index + 1}</span>
        <span
          className="text-truncate anchor-index"
          title={`Point ${index + 1}`}
        >
          Point {index + 1}
        </span>
      </div>

      {/* Right: eye + lock */}
      <div className="d-flex align-items-center gap-2">
        <span
          className={`icon-btn lock ${point.isLocked ? "locked" : "unlocked"}`}
          onClick={toggleLocked}
          title={point.isLocked ? "Unlock" : "Lock"}
        >
          {point.isLocked ? <FaLock /> : <FaLockOpen />}
        </span>
      </div>
    </div>
  );
}
