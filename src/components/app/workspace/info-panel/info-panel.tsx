import { INTERPOLATION_TYPES } from "../../../../types/types";
import ColorPicker from "../../../common/color-picker/color-picker";
import { useDataStore } from "../../../../models/dataStore";
import "./info-panel.scss";

export default function InfoPanel() {
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );

  return (
    <div className="info-panel">
      <div className="tr-info">
        <ColorPicker />
        <div className="selector-wrapper">
          <p
            className={selectedTrajectoryId ? "label-active" : "label-disabled"}
          >
            Interpolation:
          </p>
          <select
            className="interpolation-types-dropdown"
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
      <div className="cp-info">cp</div>
    </div>
  );
}
