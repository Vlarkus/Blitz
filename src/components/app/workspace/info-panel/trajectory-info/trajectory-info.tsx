import { useDataStore } from "../../../../../models/dataStore";
import { INTERPOLATION_TYPES } from "../../../../../types/types";
import ColorPicker from "../../../../common/color-picker/color-picker";
import "./trajectory-info.scss";

export default function TrajectoryInfo() {
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );
  const selectedControlPointId = useDataStore(
    (state) => state.selectedControlPointId
  );
  return (
    <div className="tr-info">
      <ColorPicker />
      <div className="tr-selector-wrapper">
        <p className={selectedTrajectoryId ? "label-active" : "label-disabled"}>
          Interpolation:
        </p>
        <select
          className="dropdown"
          name="interpolation-types"
          disabled={!selectedTrajectoryId}
        >
          {INTERPOLATION_TYPES.map((option) => {
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
  );
}
