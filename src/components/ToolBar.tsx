import { useEditorStore } from "../store/editorStore";

const tools = [
  { id: "select", label: "1" },
  { id: "add", label: "2" },
  { id: "insert", label: "3" },
  { id: "remove", label: "4" },
  { id: "pan", label: "5" },
  { id: "zoom", label: "6" },
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
          onClick={() => setActiveTool(tool.id)}
          title={tool.id}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
