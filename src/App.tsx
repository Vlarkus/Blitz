import "bootstrap/dist/css/bootstrap.min.css";
import "./App.sass";
import TopBar from "./components/TopBar";
import CentralPanel from "./components/CentralPanel";
import SidePanel from "./components/SidePanel";
import ToolBar from "./components/ToolBar";

function App() {
  return (
    <div className="d-flex bg-dark flex-column vh-100">
      <TopBar />
      <div className="d-flex bg-dark flex-grow-1 overflow-hidden">
        <ToolBar />
        <CentralPanel />
        <SidePanel />
      </div>
    </div>
  );
}

export default App;
