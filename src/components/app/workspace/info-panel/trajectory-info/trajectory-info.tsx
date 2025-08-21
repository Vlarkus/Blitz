import { useDataStore } from "../../../../../models/dataStore";
import {
  INTERPOLATION_TYPES,
  type InterpolationType,
  type TrajectoryId,
} from "../../../../../types/types";
import ColorPicker from "../../../../common/color-picker/color-picker";
import "./trajectory-info.scss";

export default function TrajectoryInfo() {
  const selectedTrajectoryId = useDataStore(
    (state) => state.selectedTrajectoryId
  );

  const selectedControlPointId = useDataStore(
    (state) => state.selectedControlPointId
  );

  const setTrajectoryColor = useDataStore((state) => state.setTrajectoryColor);
  const color = useDataStore((s) => {
    const id = s.selectedTrajectoryId;
    return id ? s.getTrajectoryById(id)?.color ?? "#000000" : "#000000";
  });

  const interpolation = useDataStore((s) => {
    const id = s.selectedTrajectoryId;
    return id ? s.getTrajectoryById(id)?.interpolationType ?? "" : "";
  });

  const setTrajectoryInterpolation = useDataStore(
    (state) => state.setTrajectoryInterpolation
  );

  return (
    <div className="tr-info">
      <ColorPicker
        onClick={(value) => {
          if (!selectedTrajectoryId) return;
          const color = (
            value.startsWith("#") ? value : `#${value}`
          ) as `#${string}`;
          setTrajectoryColor(selectedTrajectoryId, color);
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
            setTrajectoryInterpolation(
              selectedTrajectoryId,
              e.target.value as InterpolationType
            );
          }}
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
