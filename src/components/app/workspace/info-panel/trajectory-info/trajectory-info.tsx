import { useState, useEffect } from "react";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useDataStore } from "../../../../../models/dataStore";
import {
  INTERPOLATION_TYPES,
  type InterpolationType,
} from "../../../../../types/types";
import type { DistanceUnit } from "../../../../../editor/editor-store.interface";
import { EditableLabel } from "../../../../common/editable-label";
import ColorPicker from "../../../../common/color-picker/color-picker";
import { distanceToMeters, metersToDistance } from "../../../../../utils/unit-conversion";
import "./trajectory-info.scss";


export default function TrajectoryInfo() {
  const canvasConfig = useEditorStore((state) => state.canvasConfig);
  const [displayUnit, setDisplayUnit] = useState<DistanceUnit>(canvasConfig.units.distance);

  // Sync display unit if global config changes (optional, but good UX)
  useEffect(() => {
    setDisplayUnit(canvasConfig.units.distance);
  }, [canvasConfig.units.distance]);

  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );

  const interpolationDistanceMeters = useDataStore((s) => {
    const id = s.selectedTrajectoryId;
    return id
      ? s.getTrajectoryById(id)?.interpolationDistance ?? 0.1524
      : 0.1524;
  });

  const setTrajectoryColor = useDataStore((state) => state.setTrajectoryColor);
  const setTrajectoryInterpolation = useDataStore(
    (state) => state.setTrajectoryInterpolation
  );
  const setTrajectoryInterpolationDistance = useDataStore(
    (state) => state.setTrajectoryInterpolationDistance
  );
  const execute = useDataStore((state) => state.execute);
  const color = useDataStore((s) => {
    const id = s.selectedTrajectoryId;
    return id ? s.getTrajectoryById(id)?.color ?? "#000000" : "#000000";
  });

  const interpolation = useDataStore((s) => {
    const id = s.selectedTrajectoryId;
    return id ? s.getTrajectoryById(id)?.interpolationType ?? "" : "";
  });



  return (
    <div className="tr-info">
      <ColorPicker
        onClick={(value) => {
          if (!selectedTrajectoryId) return;
          const newColor = (
            value.startsWith("#") ? value : `#${value}`
          ) as `#${string}`;
          const prevColor = color;
          execute({
            redo: () => {
              setTrajectoryColor(selectedTrajectoryId, newColor);
            },
            undo: () => {
              setTrajectoryColor(selectedTrajectoryId, prevColor);
            },
          });
        }}
        value={color}
      />
      <div className="tr-selector-wrapper">
        <label
          className={selectedTrajectoryId ? "label-active" : "label-disabled"}
        >
          Interpolation:
        </label>
        <select
          className="dropdown"
          name="interpolation-types"
          disabled={!selectedTrajectoryId}
          value={interpolation}
          onChange={(e) => {
            if (!selectedTrajectoryId) return;
            const prevInterpolation = interpolation;
            const newInterpolation = e.target.value as InterpolationType;
            execute({
              redo: () => {
                setTrajectoryInterpolation(
                  selectedTrajectoryId,
                  newInterpolation
                );
              },
              undo: () => {
                setTrajectoryInterpolation(
                  selectedTrajectoryId,
                  prevInterpolation as InterpolationType
                );
              },
            });
          }}
        >
          {INTERPOLATION_TYPES.map((option) => {
            const label = option.charAt(0) + option.slice(1).toLowerCase();
            return (
              <option key={option} value={option}>
                {label}
              </option>
            );
          })}
        </select>
      </div>
      <div className="tr-selector-wrapper">
        <label
          className={
            selectedTrajectoryId && interpolation === "EQUIDISTANT"
              ? "label-active"
              : "label-disabled"
          }
        >
          Distance:
        </label>
        <span className="tr-half">
          {selectedTrajectoryId && interpolation === "EQUIDISTANT" ? (
            <EditableLabel<number>
              value={metersToDistance(
                interpolationDistanceMeters,
                displayUnit,
                canvasConfig.units
              )}
              maxIntegerDigits={3}
              maxDecimalDigits={4}
              onCommit={(val) => {
                if (!selectedTrajectoryId) return;
                const checked = Math.max(
                  0,
                  typeof val === "number" ? val : parseFloat(val as string)
                );
                const meters = distanceToMeters(
                  checked,
                  displayUnit,
                  canvasConfig.units
                );
                const oldMeters = interpolationDistanceMeters;

                if (Math.abs(meters - oldMeters) < 1e-6) return;

                execute({
                  redo: () =>
                    setTrajectoryInterpolationDistance(
                      selectedTrajectoryId,
                      meters
                    ),
                  undo: () =>
                    setTrajectoryInterpolationDistance(
                      selectedTrajectoryId,
                      oldMeters
                    ),
                });
              }}
              inputRules={{ type: "number", min: 0 }}
              ariaLabel="Distance"
            />
          ) : (
            <label className="label-disabled">-</label>
          )}
        </span>
        <label
          className={
            selectedTrajectoryId && interpolation === "EQUIDISTANT"
              ? "label-active"
              : "label-disabled"
          }
        >
          Units:
        </label>
        <span className="tr-half">
          <select
            className="dropdown"
            disabled={!selectedTrajectoryId || interpolation !== "EQUIDISTANT"}
            value={displayUnit}
            onChange={(e) => {
              const val = e.target.value as DistanceUnit;
              setDisplayUnit(val);
            }}
          >
            <option value="INCHES">Inches</option>
            <option value="METERS">Meters</option>
            <option value="FEET">Feet</option>
            <option value="CUSTOM">
              {canvasConfig.units.customDistance.name?.trim()
                ? `${canvasConfig.units.customDistance.name.trim()}`
                : "Custom"}
            </option>
          </select>
        </span>
      </div>
    </div>
  );
}
