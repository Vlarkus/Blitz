import type { ControlPoint } from "../types/editorTypes";
import { useEditorStore } from "../store/editorStore";
import { FaLock, FaLockOpen } from "react-icons/fa";

interface Props {
  trajId: string;
  point: ControlPoint;
  index: number;
}

export default function ControlPointCard({ trajId, point, index }: Props) {
  const {
    updateControlPoint,
    setSelectedTrajectoryId,
    setSelectedControlPointId,
    selectedControlPointId,
  } = useEditorStore();

  const toggleLocked = () =>
    updateControlPoint(trajId, point.id, { isLocked: !point.isLocked });

  const isSelected = point.id === selectedControlPointId;

  return (
    <div
      className={`control-point-card d-flex align-items-center justify-content-between px-2 py-1 ${
        isSelected ? "selected" : ""
      }`}
      style={{ userSelect: "none", cursor: "pointer" }}
      onClick={() => {
        setSelectedTrajectoryId(trajId);
        setSelectedControlPointId(point.id);
      }}
    >
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <span className="control-point-index-badge">{index + 1}</span>
        <span
          className="text-truncate control-point-index"
          title={`Point ${index + 1}`}
        >
          Point {index + 1}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span
          className={`icon-btn lock ${point.isLocked ? "locked" : "unlocked"}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleLocked();
          }}
          title={point.isLocked ? "Unlock" : "Lock"}
        >
          {point.isLocked ? <FaLock /> : <FaLockOpen />}
        </span>
      </div>
    </div>
  );
}
