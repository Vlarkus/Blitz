import ColorPicker from "../../../common/color-picker/color-picker";
import "./info-panel.scss";

export default function InfoPanel() {
  return (
    <div className="info-panel">
      <div className="tr-info">
        <ColorPicker />
        <select
          className="interpolation-types"
          name="interpolation-types"
        ></select>
      </div>
      <div className="cp-info">cp</div>
    </div>
  );
}
