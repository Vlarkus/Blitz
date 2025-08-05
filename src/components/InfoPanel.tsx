import { useEffect, useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { useEditorStore } from "../store/editorStore";
import type { InterpolationType } from "../types/editorTypes";

export default function InfoPanel() {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedTrajectoryId = useEditorStore((s) => s.selectedTrajectoryId);
  const selectedTrajectory = useEditorStore((s) =>
    s.trajectories.find((t) => t.id === s.selectedTrajectoryId)
  );
  const updateTrajectory = useEditorStore((s) => s.updateTrajectory);

  const color = selectedTrajectory?.color ?? "#ffffff";
  const disabled = !selectedTrajectory;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  return (
    <div className="info-panel rounded-border p-2">
      {/* Trajectory Section */}
      <div className="trajectory-info-card">
        <span className="info-panel-title-wrapper">
          <p className="info-panel-title">TRAJECTORY</p>
        </span>
        <div className="row-group">
          <div className="color-picker-wrapper" ref={pickerRef}>
            <div
              className="color-swatch"
              style={{
                backgroundColor: color,
                opacity: disabled ? 0.4 : 1,
                pointerEvents: disabled ? "none" : "auto",
              }}
              onClick={() => {
                if (!disabled) setShowPicker(!showPicker);
              }}
              title={disabled ? "No trajectory selected" : "Trajectory Color"}
            />
            {showPicker && !disabled && (
              <div className="twitter-picker-popup">
                <TwitterPicker
                  color={color}
                  onChangeComplete={(c) =>
                    selectedTrajectory &&
                    updateTrajectory(selectedTrajectory.id, {
                      color: c.hex as `#${string}`,
                    })
                  }
                  triangle="top-left"
                />
              </div>
            )}
          </div>
          <select
            className="form-select small-dropdown"
            disabled={!selectedTrajectory}
            value={selectedTrajectory?.interpolationType ?? "Equidistant"}
            onChange={(e) => {
              if (selectedTrajectory) {
                updateTrajectory(selectedTrajectory.id, {
                  interpolationType: e.target.value as InterpolationType,
                });
              }
            }}
          >
            <option value="Equidistant">Equidistant</option>
            <option value="FixedCount">Fixed Count</option>
          </select>
        </div>
      </div>

      <hr className="divider" />

      {/* Control Point Section */}
      <div className="control-point-info-card">
        <span className="info-panel-title-wrapper">
          <p className="info-panel-title">CONTROL POINT</p>
        </span>
      </div>
    </div>
  );
}
