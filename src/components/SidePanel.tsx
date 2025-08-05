import InfoPanel from "./InfoPanel";
import TrajectoriesPanel from "./TrajectoriesPanel";

export default function SidePanel() {
  return (
    <div className="side-panel bg-dark p-0">
      <InfoPanel />
      <TrajectoriesPanel />
    </div>
  );
}
