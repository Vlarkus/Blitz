import { useEffect, useRef, useState } from "react";
import { TwitterPicker } from "react-color";
import { useEditorStore } from "../store/editorStore";
import type { InterpolationType } from "../types/editorTypes";

export default function InfoPanel() {
  const selectedPoint = useEditorStore((s) =>
    s.trajectories
      .find((t) => t.id === s.selectedTrajectoryId)
      ?.controlPoints.find((p) => p.id === s.selectedControlPointId)
  );

  const updateSelectedControlPoint = useEditorStore(
    (s) => s.updateControlPoint
  );

  const [editingX, setEditingX] = useState(false);
  const [xDraft, setXDraft] = useState(selectedPoint?.x ?? 0);
  const [editingY, setEditingY] = useState(false);
  const [yDraft, setYDraft] = useState(selectedPoint?.y ?? 0);

  const [editingTheta, setEditingTheta] = useState(false);
  const [thetaDraft, setThetaDraft] = useState(selectedPoint?.theta ?? 0);
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
    setThetaDraft(selectedPoint?.theta ?? 0);
  }, [selectedPoint]);

  useEffect(() => {
    setYDraft(selectedPoint?.y ?? 0);
  }, [selectedPoint]);

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
        {/* Section title */}
        <span className="info-panel-title-wrapper">
          <p className="info-panel-title">CONTROL POINT</p>
        </span>

        {/* Wrapper for all control point detail rows */}
        <div className="control-point-details-group">
          {/* Section 1: Position and Heading */}
          <div className="row-group vertical">
            {/* X Position */}
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0">X:</p>
              {selectedPoint ? (
                editingX ? (
                  <input
                    autoFocus
                    type="number"
                    className="name-edit-input"
                    value={xDraft}
                    onChange={(e) => setXDraft(parseFloat(e.target.value))}
                    onBlur={() => {
                      if (selectedTrajectoryId) {
                        updateSelectedControlPoint(
                          selectedTrajectoryId!,
                          selectedPoint.id,
                          { x: xDraft }
                        );
                      }

                      setEditingX(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateSelectedControlPoint(
                          selectedTrajectoryId!,
                          selectedPoint.id,
                          {
                            x: xDraft,
                          }
                        );
                        setEditingX(false);
                      } else if (e.key === "Escape") {
                        setXDraft(selectedPoint.x);
                        setEditingX(false);
                      }
                    }}
                    style={{ maxWidth: "80px" }}
                  />
                ) : (
                  <span
                    className="text-truncate"
                    onDoubleClick={() => setEditingX(true)}
                    title="Double-click to edit"
                    style={{ cursor: "pointer" }}
                  >
                    {selectedPoint.x.toFixed(2)}
                  </span>
                )
              ) : (
                <span className="text-muted">none</span>
              )}
            </div>

            {/* Theta (Heading Angle) */}
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0">θ:</p>
              {selectedPoint ? (
                editingTheta ? (
                  <input
                    autoFocus
                    type="number"
                    className="name-edit-input"
                    value={thetaDraft}
                    onChange={(e) => setThetaDraft(parseFloat(e.target.value))}
                    onBlur={() => {
                      if (selectedTrajectoryId) {
                        updateSelectedControlPoint(
                          selectedTrajectoryId,
                          selectedPoint.id,
                          {
                            theta: thetaDraft,
                          }
                        );
                      }
                      setEditingTheta(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateSelectedControlPoint(
                          selectedTrajectoryId!,
                          selectedPoint.id,
                          {
                            theta: thetaDraft,
                          }
                        );
                        setEditingTheta(false);
                      } else if (e.key === "Escape") {
                        setThetaDraft(selectedPoint.theta ?? 0);
                        setEditingTheta(false);
                      }
                    }}
                    style={{ maxWidth: "80px" }}
                  />
                ) : (
                  <span
                    className="text-truncate"
                    onDoubleClick={() => setEditingTheta(true)}
                    title="Double-click to edit"
                    style={{ cursor: "pointer" }}
                  >
                    {(selectedPoint.theta ?? 0).toFixed(2)}
                  </span>
                )
              ) : (
                <span className="text-muted">none</span>
              )}

              {/* Literal checkbox (disabled for now) */}
              <input type="checkbox" disabled />
            </div>
          </div>

          {/* Section 2: Y Position and Event */}
          <div className="row-group vertical">
            {/* Y Position */}
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0">Y:</p>
              {selectedPoint ? (
                editingY ? (
                  <input
                    autoFocus
                    type="number"
                    className="name-edit-input"
                    value={yDraft}
                    onChange={(e) => setYDraft(parseFloat(e.target.value))}
                    onBlur={() => {
                      if (selectedTrajectoryId) {
                        updateSelectedControlPoint(
                          selectedTrajectoryId,
                          selectedPoint.id,
                          {
                            y: yDraft,
                          }
                        );
                      }
                      setEditingY(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (selectedTrajectoryId) {
                          updateSelectedControlPoint(
                            selectedTrajectoryId,
                            selectedPoint.id,
                            {
                              y: yDraft,
                            }
                          );
                        }
                        setEditingY(false);
                      } else if (e.key === "Escape") {
                        setYDraft(selectedPoint.y);
                        setEditingY(false);
                      }
                    }}
                    style={{ maxWidth: "80px" }}
                  />
                ) : (
                  <span
                    className="text-truncate"
                    onDoubleClick={() => setEditingY(true)}
                    title="Double-click to edit"
                    style={{ cursor: "pointer" }}
                  >
                    {selectedPoint.y.toFixed(2)}
                  </span>
                )
              ) : (
                <span className="text-muted">none</span>
              )}
            </div>

            {/* Placeholder for Event label */}
            <span>Event</span>
          </div>

          {/* Section 3: Custom Section */}
          <div className="row-group vertical">
            {/* Placeholder Title */}
            <span>Section 3</span>
            {/* Placeholder Subitem */}
            <span>Subitem</span>
          </div>
        </div>
      </div>
    </div>
  );
}
