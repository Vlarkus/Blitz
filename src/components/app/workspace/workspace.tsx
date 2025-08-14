import "./workspace.scss";
import ToolBar from "./tool-bar/tool-bar";
import Canvas from "./canvas/canvas";
import StatusBar from "./status-bar/status-bar";
import InfoPanel from "./info-panel/info-panel";
import TrajectoriesPanel from "./trajectories-panel/trajectories-panel";

export default function Workspace() {
  return (
    <main className="workspace">
      <ToolBar />
      <div className="central-panel">
        <Canvas />
        <StatusBar />
      </div>
      <div className="side-panel">
        <InfoPanel />
        <TrajectoriesPanel />
      </div>
    </main>
  );
}
