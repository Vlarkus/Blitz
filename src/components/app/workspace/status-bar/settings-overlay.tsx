import { useState, useEffect, useRef } from "react";
import type { MouseEvent, FocusEvent } from "react";
import "./settings-overlay.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import CoordinatePreview from "./coordinate-preview";
import { useEditorStore } from "../../../../editor/editor-store";
import type {
  AngleUnit,
  AxisDirection,
  BuiltInDistanceUnit,
  DistanceUnit,
  RotationDirection,
} from "../../../../editor/editor-store.interface";
import {
  angleToRadians,
  distanceToMeters,
  metersToDistance,
  radiansToAngle,
} from "../../../../utils/unit-conversion";

type Section = "Defaults" | "Canvas" | "Robot" | "Keybinds";

interface Props {
  onClose: () => void;
}

interface BlurInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

function BlurInput({ value, onChange, onBlur, ...props }: BlurInputProps) {
  const [tempValue, setTempValue] = useState<string | null>(null);

  useEffect(() => {
    // Only update from props if we are NOT currently editing (tempValue is null)
    if (tempValue === null) {
      // Nothing to do, component uses prop value naturally when tempValue is null
    }
  }, [value]);

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={tempValue ?? value}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
          setTempValue(val);
        }
      }}
      onBlur={(e) => {
        if (tempValue !== null) {
          const num = parseFloat(tempValue);
          if (!isNaN(num)) {
            onChange(num);
          } else {
            // Revert or set to 0 for invalid inputs like ".", "-"
            onChange(0);
          }
          setTempValue(null);
        }
        if (onBlur) onBlur(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

import { CanvasCoordinateSystem } from "../canvas/canvas-coordinate-helper";
import { useDataStore } from "../../../../models/dataStore";

export default function SettingsOverlay({ onClose }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("Defaults");

  // Global Config
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const setCanvasConfig = useEditorStore((s) => s.setCanvasConfig);
  const robotConfig = useEditorStore((s) => s.robotConfig);
  const setRobotConfig = useEditorStore((s) => s.setRobotConfig);
  const robotDimensionUnits = useEditorStore((s) => s.robotDimensionUnits);
  const setRobotDimensionUnits = useEditorStore(
    (s) => s.setRobotDimensionUnits,
  );

  // Staged Config
  const [stagedConfig, setStagedConfig] = useState(canvasConfig);
  const robotWidthUnit = robotDimensionUnits.width;
  const robotHeightUnit = robotDimensionUnits.height;
  const customDistance = stagedConfig.units.customDistance;

  // Access to Data
  const trajectories = useDataStore((s) => s.trajectories);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const setControlPointHeading = useDataStore((s) => s.setControlPointHeading);

  const applyChanges = () => {
    const oldSys = new CanvasCoordinateSystem(canvasConfig);
    const newSys = new CanvasCoordinateSystem(stagedConfig);

    trajectories.forEach((t) => {
      t.controlPoints.forEach((cp) => {
        // 1. Position Transformation
        // Old User -> Standard Canvas
        const pCanvas = oldSys.fromUser(cp.x, cp.y);
        // Standard Canvas -> New User
        const pNew = newSys.toUser(pCanvas.x, pCanvas.y);

        // Update Position
        moveControlPoint(t.id, cp.id, pNew.x, pNew.y);

        // 2. Heading Transformation
        if (cp.heading !== null) {
          // Old User -> Screen Degrees
          const screenDeg = oldSys.mapHeadingToScreen(cp.heading);
          // Screen Degrees -> New User Radians
          const newHeading = newSys.mapHeadingFromScreen(screenDeg);

          setControlPointHeading(t.id, cp.id, newHeading);
        }
      });
    });

    setCanvasConfig(stagedConfig);
  };

  const discardChanges = () => {
    setStagedConfig(canvasConfig);
  };

  const hasChanges =
    JSON.stringify(canvasConfig) !== JSON.stringify(stagedConfig);

  // ... replace usages of canvasConfig with stagedConfig in the UI ...
  // ... insert Apply button ...

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Canvas":
        return (
          <div className="canvas-settings">
            <h2>Canvas Settings</h2>

            <div className="preview-section">
              <span className="preview-label">Coordinate Preview</span>
              <div className="preview-box">
                <CoordinatePreview config={stagedConfig.coordinateSystem} />
              </div>
            </div>

            <div className="settings-grid">
              <div className="settings-section">
                <h3>Coordinate System</h3>
                <div className="control-group">
                  <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                    <div className="control-item" style={{ flex: 1 }}>
                      <label>Positive X Direction</label>
                      <select
                        value={stagedConfig.coordinateSystem.positiveX}
                        onChange={(e) => {
                          const newX = e.target.value as AxisDirection;
                          let newY = stagedConfig.coordinateSystem.positiveY;

                          // If switching to vertical/horizontal, ensure Y is opposite axis type
                          if (["UP", "DOWN"].includes(newX)) {
                            if (["UP", "DOWN"].includes(newY)) newY = "RIGHT";
                          } else {
                            if (["LEFT", "RIGHT"].includes(newY)) newY = "UP";
                          }

                          setStagedConfig((prev) => ({
                            ...prev,
                            coordinateSystem: {
                              ...prev.coordinateSystem,
                              positiveX: newX,
                              positiveY: newY,
                            },
                          }));
                        }}
                      >
                        <option value="RIGHT">Right</option>
                        <option value="LEFT">Left</option>
                        <option value="UP">Up</option>
                        <option value="DOWN">Down</option>
                      </select>
                    </div>
                    <div className="control-item" style={{ flex: 1 }}>
                      <label>Positive Y Direction</label>
                      <select
                        value={stagedConfig.coordinateSystem.positiveY}
                        onChange={(e) => {
                          const newY = e.target.value as AxisDirection;
                          let newX = stagedConfig.coordinateSystem.positiveX;

                          if (["UP", "DOWN"].includes(newY)) {
                            if (["UP", "DOWN"].includes(newX)) newX = "RIGHT";
                          } else {
                            if (["LEFT", "RIGHT"].includes(newX)) newX = "UP";
                          }

                          setStagedConfig((prev) => ({
                            ...prev,
                            coordinateSystem: {
                              ...prev.coordinateSystem,
                              positiveY: newY,
                              positiveX: newX,
                            },
                          }));
                        }}
                      >
                        <option value="UP">Up</option>
                        <option value="DOWN">Down</option>
                        <option value="RIGHT">Right</option>
                        <option value="LEFT">Left</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Heading</h3>
                <div className="control-group">
                  <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                    <div className="control-item" style={{ flex: 1 }}>
                      <label>0 Degrees Direction</label>
                      <select
                        value={stagedConfig.coordinateSystem.zeroAngle}
                        onChange={(e) =>
                          setStagedConfig((prev) => ({
                            ...prev,
                            coordinateSystem: {
                              ...prev.coordinateSystem,
                              zeroAngle: e.target.value as AxisDirection,
                            },
                          }))
                        }
                      >
                        <option value="RIGHT">Right</option>
                        <option value="LEFT">Left</option>
                        <option value="UP">Up</option>
                        <option value="DOWN">Down</option>
                      </select>
                    </div>
                    <div className="control-item" style={{ flex: 1 }}>
                      <label>Rotation Direction</label>
                      <select
                        value={stagedConfig.coordinateSystem.rotationDirection}
                        onChange={(e) =>
                          setStagedConfig((prev) => ({
                            ...prev,
                            coordinateSystem: {
                              ...prev.coordinateSystem,
                              rotationDirection: e.target
                                .value as RotationDirection,
                            },
                          }))
                        }
                      >
                        <option value="CCW">Counter-Clockwise (CCW)</option>
                        <option value="CW">Clockwise (CW)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Heading Range</h3>
                <div className="control-group">
                  <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
                    <div className="control-item" style={{ flex: 1, minWidth: 0 }}>
                      <label>Min</label>
                      <BlurInput
                        type="number"
                        step="any"
                        value={radiansToAngle(
                          stagedConfig.headingRange?.minRad ?? -Math.PI,
                          stagedConfig.units.angle
                        )}
                        onChange={(val) => {
                          const rad = angleToRadians(
                            val,
                            stagedConfig.units.angle
                          );
                          const currentMax =
                            stagedConfig.headingRange?.maxRad ?? Math.PI;
                          const oneRot = 2 * Math.PI;

                          let newMax = currentMax;
                          if (currentMax - rad < oneRot - 1e-6) {
                            newMax = rad + oneRot;
                          }

                          setStagedConfig((prev) => ({
                            ...prev,
                            headingRange: {
                              ...(prev.headingRange || {
                                minRad: -Math.PI,
                                maxRad: Math.PI,
                              }),
                              minRad: rad,
                              maxRad: newMax,
                            },
                          }));
                        }}
                      />
                    </div>
                    <div className="control-item" style={{ flex: 1, minWidth: 0 }}>
                      <label>Max</label>
                      <BlurInput
                        type="number"
                        step="any"
                        value={radiansToAngle(
                          stagedConfig.headingRange?.maxRad ?? Math.PI,
                          stagedConfig.units.angle
                        )}
                        onChange={(val) => {
                          const rad = angleToRadians(
                            val,
                            stagedConfig.units.angle
                          );
                          const currentMin =
                            stagedConfig.headingRange?.minRad ?? -Math.PI;
                          const oneRot = 2 * Math.PI;

                          let newMin = currentMin;
                          if (rad - currentMin < oneRot - 1e-6) {
                            newMin = rad - oneRot;
                          }

                          setStagedConfig((prev) => ({
                            ...prev,
                            headingRange: {
                              ...(prev.headingRange || {
                                minRad: -Math.PI,
                                maxRad: Math.PI,
                              }),
                              maxRad: rad,
                              minRad: newMin,
                            },
                          }));
                        }}
                      />
                    </div>
                    <div className="control-item" style={{ flex: 1, minWidth: 0 }}>
                      <label>Units</label>
                      <select
                        value={stagedConfig.units.angle}
                        onChange={(e) =>
                          setStagedConfig((prev) => ({
                            ...prev,
                            units: {
                              ...prev.units,
                              angle: e.target.value as AngleUnit,
                            },
                          }))
                        }
                      >
                        <option value="DEGREES">Degrees</option>
                        <option value="RADIANS">Radians</option>
                        <option value="ROTATIONS">Rotations</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Keybinds":
        return (
          <div>
            <h2>Keybinds</h2>
            <p className="placeholder-text">
              Keybind customization coming soon...
            </p>
          </div>
        );
      case "Defaults":
        return (
          <div>
            <h2>Defaults</h2>

            <div className="settings-section">
              <h3>Units</h3>
              <div className="control-group">
                <div className="control-item">
                  <label>Distance Units</label>
                  <select
                    value={stagedConfig.units.distance}
                    onChange={(e) =>
                      setStagedConfig((prev) => ({
                        ...prev,
                        units: {
                          ...prev.units,
                          distance: e.target.value as DistanceUnit,
                        },
                      }))
                    }
                  >
                    <option value="INCHES">Inches</option>
                    <option value="METERS">Meters</option>
                    <option value="FEET">Feet</option>
                    <option value="CUSTOM">
                      {customDistance.name?.trim()
                        ? `Custom (${customDistance.name.trim()})`
                        : "Custom"}
                    </option>
                  </select>
                  {stagedConfig.units.distance === "CUSTOM" && (
                    <div className="custom-distance-section">
                      <div className="control-item">
                        <label>Custom Conversion</label>
                        <div className="custom-distance-row">
                          <span>1 custom unit =</span>
                          <input
                            type="number"
                            min="0.000001"
                            step="0.01"
                            value={customDistance.factor}
                            onChange={(e) =>
                              setStagedConfig((prev) => ({
                                ...prev,
                                units: {
                                  ...prev.units,
                                  customDistance: {
                                    ...prev.units.customDistance,
                                    factor: Math.max(
                                      0.000001,
                                      parseFloat(e.target.value) || 0,
                                    ),
                                  },
                                },
                              }))
                            }
                          />
                          <select
                            value={customDistance.baseUnit}
                            onChange={(e) =>
                              setStagedConfig((prev) => ({
                                ...prev,
                                units: {
                                  ...prev.units,
                                  customDistance: {
                                    ...prev.units.customDistance,
                                    baseUnit: e.target
                                      .value as BuiltInDistanceUnit,
                                  },
                                },
                              }))
                            }
                          >
                            <option value="INCHES">Inches</option>
                            <option value="METERS">Meters</option>
                            <option value="FEET">Feet</option>
                          </select>
                        </div>
                      </div>
                      <div className="control-item">
                        <label>Custom Unit Name</label>
                        <input
                          type="text"
                          value={customDistance.name}
                          onChange={(e) =>
                            setStagedConfig((prev) => ({
                              ...prev,
                              units: {
                                ...prev.units,
                                customDistance: {
                                  ...prev.units.customDistance,
                                  name: e.target.value,
                                },
                              },
                            }))
                          }
                          placeholder="e.g. tiles"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="control-item">
                  <label>Angle Units</label>
                  <select
                    value={stagedConfig.units.angle}
                    onChange={(e) =>
                      setStagedConfig((prev) => ({
                        ...prev,
                        units: {
                          ...prev.units,
                          angle: e.target.value as AngleUnit,
                        },
                      }))
                    }
                  >
                    <option value="DEGREES">Degrees</option>
                    <option value="RADIANS">Radians</option>
                    <option value="ROTATIONS">Rotations</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case "Robot":
        return (
          <div>
            <h2>Robot</h2>

            <div className="settings-section">
              <h3>Robot Dimensions</h3>
              <div className="control-group">
                <div className="control-item">
                  <label>Robot Width</label>
                  <div className="dimension-input-row">
                    <BlurInput
                      type="number"
                      step="0.01"
                      value={metersToDistance(
                        robotConfig.widthM,
                        robotWidthUnit,
                        stagedConfig.units,
                      )}
                      onChange={(val) =>
                        setRobotConfig({
                          widthM: distanceToMeters(
                            val || 0,
                            robotWidthUnit,
                            stagedConfig.units,
                          ),
                        })
                      }
                    />
                    <select
                      value={robotWidthUnit}
                      onChange={(e) =>
                        setRobotDimensionUnits({
                          width: e.target.value as DistanceUnit,
                        })
                      }
                    >
                      <option value="INCHES">Inches</option>
                      <option value="METERS">Meters</option>
                      <option value="FEET">Feet</option>
                      <option value="CUSTOM">
                        {customDistance.name?.trim()
                          ? `Custom (${customDistance.name.trim()})`
                          : "Custom"}
                      </option>
                    </select>
                  </div>
                </div>
                <div className="control-item">
                  <label>Robot Length</label>
                  <div className="dimension-input-row">
                    <BlurInput
                      type="number"
                      step="0.01"
                      value={metersToDistance(
                        robotConfig.heightM,
                        robotHeightUnit,
                        stagedConfig.units,
                      )}
                      onChange={(val) =>
                        setRobotConfig({
                          heightM: distanceToMeters(
                            val || 0,
                            robotHeightUnit,
                            stagedConfig.units,
                          ),
                        })
                      }
                    />
                    <select
                      value={robotHeightUnit}
                      onChange={(e) =>
                        setRobotDimensionUnits({
                          height: e.target.value as DistanceUnit,
                        })
                      }
                    >
                      <option value="INCHES">Inches</option>
                      <option value="METERS">Meters</option>
                      <option value="FEET">Feet</option>
                      <option value="CUSTOM">
                        {customDistance.name?.trim()
                          ? `Custom (${customDistance.name.trim()})`
                          : "Custom"}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Robot Behavior</h3>
              <div className="control-group">
                <div className="control-item checkbox-item">
                  <label>
                    Independent Heading (Heading separate from movement):
                  </label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={robotConfig.independentHeading}
                    onChange={(e) => {
                      const nextIndependentHeading = e.target.checked;
                      setRobotConfig({
                        independentHeading: nextIndependentHeading,
                      });

                      trajectories.forEach((t) => {
                        t.controlPoints.forEach((cp) => {
                          const nextHeading = nextIndependentHeading
                            ? (cp.heading ?? 0)
                            : null;
                          if (cp.heading !== nextHeading) {
                            setControlPointHeading(t.id, cp.id, nextHeading);
                          }
                        });
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-overlay-backdrop" onClick={handleBackdropClick}>
      <div className="settings-overlay">
        <div className="settings-sidebar">
          <div className="sidebar-header">Settings</div>
          {["Defaults", "Canvas", "Robot"].map((section) => (
            <button
              key={section}
              className={activeSection === section ? "active" : ""}
              onClick={() => setActiveSection(section as Section)}
            >
              {section}
            </button>
          ))}
        </div>
        <div className="settings-main">
          <div className="settings-topbar">
            {hasChanges && (
              <div className="settings-topbar-actions">
                <button className="apply-button" onClick={applyChanges}>
                  Apply
                </button>
                <button className="discard-button" onClick={discardChanges}>
                  Cancel
                </button>
              </div>
            )}
            <button className="close-button" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="settings-content">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
