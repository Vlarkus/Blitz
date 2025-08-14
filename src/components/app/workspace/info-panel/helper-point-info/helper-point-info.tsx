import React from "react";
import { useDataStore } from "../../../../../models/dataStore";
import { EditableLabel } from "../../../../common/editable-label";
import "./helper-point-info.scss";
import RadioButtonGroup from "./coord-mode-radio-selector/coord-mode-radio-selector";
import CoordLabel from "./coord-label/coord-label";

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

  const [coordMode, setCoordMode] = React.useState("polar");

  return (
    <div className="helper-point-info">
      <RadioButtonGroup
        name="demo"
        options={[
          { label: "Polar", value: "polar" },
          { label: "Relative", value: "relative" },
          { label: "Absolute", value: "absolute" },
        ]}
        value={coordMode}
        onChange={setCoordMode}
      />

      {/* Handle In */}
      <div className="hp-selector-wrapper">
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{
              polar: "r:",
              relative: "dx:",
              absolute: "x:",
            }}
          />
          {selectedControlPointId ? (
            <>
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
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{
              polar: "ϑ:",
              relative: "dy:",
              absolute: "y:",
            }}
          />
          {selectedControlPointId ? (
            <>
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
      </div>

      {/* Handle Out */}
      <div className="hp-selector-wrapper">
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{
              polar: "r:",
              relative: "dx:",
              absolute: "x:",
            }}
          />
          {selectedControlPointId ? (
            <>
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
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{
              polar: "ϑ:",
              relative: "dy:",
              absolute: "y:",
            }}
          />
          {selectedControlPointId ? (
            <>
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
      </div>
    </div>
  );
}
