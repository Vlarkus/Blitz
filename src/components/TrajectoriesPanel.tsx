import { useEditorStore } from "../store/editorStore";
import TrajectoryCard from "./TrajectoryCard";

export default function TrajectoriesPanel() {
  const { trajectories } = useEditorStore();

  return (
    <div className="trajectories-panel bg-dark d-flex flex-column h-100">
      {/* Top: Scrollable list */}
      <div className="trajectories-list rounded-border bg-dark flex-grow-1 overflow-auto p-2">
        {trajectories.map((t, i) => (
          <TrajectoryCard key={t.id} traj={t} index={i} />
        ))}
      </div>

      {/* Bottom: Button bar */}
      <div className="trajectory-panel-footer bg-dark d-flex justify-content-center align-items-center gap-2">
        <button className="btn btn-sm btn-outline-light square-btn">1</button>
        <button className="btn btn-sm btn-outline-light square-btn">2</button>
      </div>
    </div>
  );
}
