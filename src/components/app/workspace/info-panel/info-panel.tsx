import "./info-panel.scss";

import TrajectoryInfo from "./trajectory-info/trajectory-info";
import ControlPointInfo from "./control-point-info/control-point-info";
import HelperPointInfo from "./helper-point-info/helper-point-info";

export default function InfoPanel() {
  return (
    <div className="side-panel-element">
      <TrajectoryInfo />
      <hr className="divider" />
      <ControlPointInfo />
      <hr className="divider" />
      <HelperPointInfo />
    </div>
  );
}
