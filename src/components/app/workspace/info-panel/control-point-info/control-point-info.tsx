import { act } from "react";
import { useDataStore } from "../../../../../models/dataStore";
import {
  SPLINE_TYPES,
  SYMMETRY_TYPES,
  type SplineType,
  type SymmetryType,
} from "../../../../../types/types";
import { EditableLabel } from "../../../../common/editable-label";
import "./control-point-info.scss";

export default function ControlPointInfo() {
  // ALL HOOKS AT THE TOP LEVEL
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );
  const selectedControlPointId = useDataStore(
    (state) => state.selectedControlPointId
  );
  const cp = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
      : undefined
  );

  // Individual property selectors
  const cpX = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)?.x ?? 0
      : 0
  );
  const cpY = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)?.y ?? 0
      : 0
  );
  const cpHeading = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
          ?.heading ?? null
      : null
  );

  const cpSymmetry = useDataStore((s) => {
    if (!selectedTrajectoryId || !selectedControlPointId) return "";
    return (
      s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
        ?.symmetry ?? ""
    ).toLowerCase();
  });
  const cpSplineType = useDataStore((s) => {
    if (!selectedTrajectoryId || !selectedControlPointId) return "";
    return (
      s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
        ?.splineType ?? ""
    ).toLowerCase();
  });

  const cpIsEvent = useDataStore((s) =>
    selectedTrajectoryId && selectedControlPointId
      ? s.getControlPoint(selectedTrajectoryId, selectedControlPointId)
          ?.isEvent ?? false
      : false
  );

  // setters
  const setControlPointSymmetry = useDataStore(
    (s) => s.setControlPointSymmetry
  );
  const setControlPointSplineType = useDataStore(
    (s) => s.setControlPointSplineType
  );

  return (
    <div className="control-point-info">
      <div className="cp-selector-wrapper">
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            x:
          </label>
          {selectedControlPointId ? (
            <>
              <EditableLabel<number>
                value={cpX}
                maxIntegerDigits={4}
                maxDecimalDigits={3}
                onCommit={(nextX) => {
                  if (!selectedTrajectoryId || !cp) return;

                  // Coerce to number, guard against NaN/undefined
                  const x = typeof nextX === "number" ? nextX : Number(nextX);
                  if (!Number.isFinite(x)) return; // ignore invalid commits

                  useDataStore.getState().moveControlPoint(
                    selectedTrajectoryId,
                    cp.id, // prefer the cp you already have
                    x,
                    Number.isFinite(cp.y) ? cp.y : 0 // keep current Y
                  );
                }}
                inputRules={{ type: "number" }} // helps prevent invalid text
                ariaLabel="X position"
              />
            </>
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            y:
          </label>

          {selectedControlPointId ? (
            <>
              <EditableLabel<number>
                value={cpY}
                maxIntegerDigits={4}
                maxDecimalDigits={3}
                onCommit={(nextY) => {
                  if (!selectedTrajectoryId || !cp) return;

                  // Coerce to number, guard against NaN/undefined
                  const y = typeof nextY === "number" ? nextY : Number(nextY);
                  if (!Number.isFinite(y)) return; // ignore invalid commits

                  useDataStore.getState().moveControlPoint(
                    selectedTrajectoryId,
                    cp.id, // prefer the cp you already have
                    Number.isFinite(cp.x) ? cp.x : 0, // keep current Y
                    y
                  );
                }}
                inputRules={{ type: "number" }} // helps prevent invalid text
                ariaLabel="Y position"
              />
            </>
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
      </div>

      <div className="cp-selector-wrapper">
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            ϑ:
          </label>
          {selectedControlPointId ? (
            <>
              <input
                type="checkbox"
                className="checkbox"
                checked={cpHeading !== null}
                onChange={(e) => {
                  if (!selectedTrajectoryId || !selectedControlPointId) return;

                  useDataStore
                    .getState()
                    .setControlPointHeading(
                      selectedTrajectoryId,
                      selectedControlPointId,
                      e.target.checked ? 0 : null
                    );
                }}
              />
              <EditableLabel<number>
                value={cpHeading !== null ? cpHeading : 0}
                maxIntegerDigits={3}
                maxDecimalDigits={2}
                inputRules={{ type: "number" }}
                ariaLabel="Heading"
                className={cpHeading === null ? "label-disabled" : undefined}
                onCommit={(nextHeading) => {
                  const heading =
                    typeof nextHeading === "number"
                      ? nextHeading
                      : Number(nextHeading);
                  if (!Number.isFinite(heading)) return;

                  useDataStore
                    .getState()
                    .setControlPointHeading(
                      selectedTrajectoryId!,
                      selectedControlPointId,
                      Number(heading)
                    );
                }}
              />
            </>
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            Event:
          </label>

          {selectedControlPointId ? (
            <input
              type="checkbox"
              className="checkbox"
              checked={cpIsEvent} // ✅ use actual store value
              onChange={(e) => {
                if (!selectedTrajectoryId || !selectedControlPointId) return;
                useDataStore
                  .getState()
                  .setControlPointEvent(
                    selectedTrajectoryId,
                    selectedControlPointId,
                    e.target.checked
                  );
              }}
            />
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
      </div>

      <div className="cp-selector-wrapper">
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            Symmetry:
          </label>
        </div>
        <div className="half-width">
          <select
            className="dropdown"
            name="symmetry-types"
            disabled={!selectedControlPointId}
            value={cpSymmetry}
            onChange={(e) => {
              if (!selectedTrajectoryId || !selectedControlPointId) return;
              setControlPointSymmetry(
                selectedTrajectoryId,
                selectedControlPointId,
                e.target.value.toUpperCase() as SymmetryType
              );
            }}
          >
            {SYMMETRY_TYPES.map((option) => {
              const label = option.charAt(0) + option.slice(1).toLowerCase();
              return (
                <option key={option.toLowerCase()} value={option.toLowerCase()}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="cp-selector-wrapper">
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "active-element" : "disabled-element"
            }
          >
            Spline:
          </label>
        </div>
        <div className="half-width">
          <select
            className="dropdown"
            name="spline-types"
            disabled={!selectedControlPointId}
            value={cpSplineType}
            onChange={(e) => {
              if (!selectedTrajectoryId || !selectedControlPointId) return;
              setControlPointSplineType(
                selectedTrajectoryId,
                selectedControlPointId,
                e.target.value.toUpperCase() as SplineType
              );
            }}
          >
            {SPLINE_TYPES.map((option) => {
              const label = option.charAt(0) + option.slice(1).toLowerCase();
              return (
                <option key={option.toLowerCase()} value={option.toLowerCase()}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
