import "./workspace.scss";
import ToolBar from "./tool-bar/tool-bar";
import Canvas from "./canvas/canvas";

export default function Workspace() {
  return (
    <main className="workspace">
      <ToolBar />
      <div className="central-panel">
        <Canvas />
      </div>
      <div className="side-panel">Side</div>
    </main>
  );
}
