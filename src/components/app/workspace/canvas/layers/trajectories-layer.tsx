import TrajectoryElement from "../elements/trajectory-element";
import { useDataStore } from "../../../../../models/dataStore";

export default function TrajectoriesLayer() {
  const trajectories = useDataStore((s) => s.trajectories);
  return (
    <>
      {trajectories
        .filter((t) => t.isVisible)
        .map((t) => (
          <TrajectoryElement key={t.id} trajId={t.id} />
        ))}
    </>
  );
}
