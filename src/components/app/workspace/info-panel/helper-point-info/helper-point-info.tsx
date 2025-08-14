import React from "react";
import { useDataStore } from "../../../../../models/dataStore";
import { EditableLabel } from "../../../../common/editable-label";
import "./helper-point-info.scss";
import RadioButtonGroup from "./RadioButtonGroup/radio-button-group";

export default function HelperPointInfo() {
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

  // DEMO

  const [val, setVal] = React.useState("polar");

  return (
    <div className="helper-point-info">
      <RadioButtonGroup
        name="demo"
        options={[
          { label: "Polar", value: "polar" },
          { label: "Relative", value: "relative" },
          { label: "Absolute", value: "absolute" },
        ]}
        value={val}
        onChange={setVal}
      />

      {/* Selector */}
      <div className="hp-selector-wrapper">
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            x:
          </label>
          <EditableLabel<number>
            value={cp?.y ?? 0}
            onCommit={() => {
              console.log("Commit");
            }}
          />
        </div>
        <div className="half-width">
          <label
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            y:
          </label>
          <EditableLabel<number>
            value={cp?.y ?? 0}
            onCommit={() => {
              console.log("Commit");
            }}
          />
        </div>
      </div>
    </div>
  );
}
