import { act } from "react";
import { useDataStore } from "../../../../../models/dataStore";
import { SPLINE_TYPES, SYMMETRY_TYPES } from "../../../../../types/types";
import { EditableLabel } from "../../../../common/editable-label";
import "./control-point-info.scss";

export default function ControlPointInfo() {
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
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);

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
                value={cp!.x ?? 0}
                onCommit={() => {
                  console.log("Commit");
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
            y:
          </label>

          {selectedControlPointId ? (
            <>
              <EditableLabel<number>
                value={cp!.y ?? 0}
                onCommit={() => {
                  console.log("Commit");
                }}
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
              <input type="checkbox" className="checkbox" />
              <EditableLabel<number>
                value={cp?.y ?? 0}
                onCommit={() => {
                  console.log("Commit");
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
            <input type="checkbox" className="checkbox" />
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
