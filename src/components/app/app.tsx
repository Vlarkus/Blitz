import "./app.scss";
import Menu from "./menu/menu";
import Workspace from "./workspace/workspace";

export default function App() {
  return (
    <div className="app">
      <Menu />
      <Workspace />
    </div>
  );
}
