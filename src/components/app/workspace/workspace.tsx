import "./workspace.scss";
import ToolBar from "./tool-bar/tool-bar";

export default function Workspace() {
  return (
    <main className="workspace">
      <ToolBar />
      <div className="central-panel">Central</div>
      <div className="side-panel">Side</div>
    </main>
  );
}
