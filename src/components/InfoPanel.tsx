import { TwitterPicker } from "react-color";
import { useState } from "react";

export default function InfoPanel() {
  const [color, setColor] = useState("#ffffff");
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="info-panel rounded-border p-2">
      {/* Trajectory Section */}
      <div className="trajectory-info-card">
        <p className="info-panel-title">TRAJECTORY</p>
        <div className="row-group">
          <div className="color-picker-wrapper">
            <div
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => setShowPicker(!showPicker)}
              title="Trajectory Color"
            />
            {showPicker && (
              <div className="twitter-picker-popup">
                <TwitterPicker
                  color={color}
                  onChangeComplete={(c) => setColor(c.hex)}
                  triangle="top-left"
                />
              </div>
            )}
          </div>
          <select className="form-select small-dropdown">
            <option value="equidistant">Equidistant</option>
            <option value="fixed">Fixed Count</option>
          </select>
        </div>
      </div>

      <hr className="divider" />

      {/* Control Point Section */}
      <div className="control-point-info-card">
        <p className="info-panel-title">CONTROL POINT</p>
        {/* Layout for control point fields to follow here */}
      </div>
    </div>
  );
}
