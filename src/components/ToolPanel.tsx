import { useEditorStore } from "../editor/editorStore";
import { CgInsertAfter, CgArrowsMergeAltH } from "react-icons/cg";
import { FaExpand } from "react-icons/fa6";
import { MdContentCut } from "react-icons/md";
import { FaMousePointer, FaPlus, FaTrash } from "react-icons/fa";

const tools = [
  { id: "move", label: <FaMousePointer />, title: "Move (Select & Drag)" },
  { id: "add", label: <FaPlus />, title: "Add Control Point" },
  { id: "insert", label: <CgInsertAfter />, title: "Insert Between Points" },
  { id: "delete", label: <FaTrash />, title: "Delete Control Point" },
  { id: "cut", label: <MdContentCut />, title: "Cut Trajectory" },
  { id: "merge", label: <CgArrowsMergeAltH />, title: "Merge Trajectories" },
  { id: "simulate", label: <FaExpand />, title: "Simulate Path" },
] as const;

export default function ToolBar() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div
      className="bg-dark d-flex flex-column align-items-center p-2 gap-2 h-100"
      style={{ width: "56px" }}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`btn btn-sm p-0 d-flex align-items-center justify-content-center ${
            activeTool === tool.id ? "btn-light" : "btn-outline-light"
          }`}
          style={{ width: "40px", height: "40px" }}
          onClick={() => {
            setActiveTool(tool.id);
            console.log(`Active tool set to: ${tool.id}`);
          }}
          title={tool.title}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
