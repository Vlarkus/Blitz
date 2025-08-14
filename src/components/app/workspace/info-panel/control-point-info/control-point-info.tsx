import { useDataStore } from "../../../../../models/dataStore";
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
          <p
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            x:
          </p>
          <EditableLabel<number>
            value={cp?.y ?? 0}
            onCommit={() => {
              console.log("Commit");
            }}
          />
        </div>
        <div className="half-width">
          <p
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            y:
          </p>
          <EditableLabel<number>
            value={cp?.y ?? 0}
            onCommit={() => {
              console.log("Commit");
            }}
          />
        </div>
      </div>

      <div className="cp-selector-wrapper">
        <div className="half-width">
          <p
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            ϑ:
          </p>
          <input type="checkbox" />
          <EditableLabel<number>
            value="0"
            onCommit={() => {
              console.log("Commit");
            }}
          />
        </div>
        <div className="half-width">
          <p
            className={
              selectedControlPointId ? "label-active" : "label-disabled"
            }
          >
            Event:
          </p>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}
