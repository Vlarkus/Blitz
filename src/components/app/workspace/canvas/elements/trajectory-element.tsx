import React from "react";
import { Group, Path } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useDataStore } from "../../../../../models/dataStore";
import ControlPointElement from "./control-point-element";
import buildPath from "../util/build-path";
import HandleElement from "./handle-element";

type Props = { trajId: string };

export default function TrajectoryElement({ trajId }: Props) {
  // ✅ Call hooks unconditionally at the top
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const getHandlePosition = useDataStore((s) => s.getHandlePosition);
  const scale = useEditorStore((s) => s.activeViewport.scale);

  // Only branch after all hooks have been called
  if (!traj) return null;

  const d = buildPath(traj, getHandlePosition);
  // const d = React.useMemo(() => buildPath(traj, getHandlePosition), [traj, getHandlePosition]);

  return (
    <Group name={`traj:${traj.id}`} listening>
      <Path
        name={`trajectory:${traj.id}`}
        data={d}
        stroke={traj.color}
        strokeWidth={2 / scale}
        hitStrokeWidth={5 / scale}
        listening
        onMouseDown={() =>
          useDataStore.getState().setSelectedTrajectoryId(traj.id)
        }
        onTouchStart={() =>
          useDataStore.getState().setSelectedTrajectoryId(traj.id)
        }
      />
      {traj.controlPoints.map((cp) => (
        <React.Fragment key={cp.id}>
          <HandleElement trajId={traj.id} cpId={cp.id} which="in" />
          <HandleElement trajId={traj.id} cpId={cp.id} which="out" />
          <ControlPointElement trajId={traj.id} cpId={cp.id} />
        </React.Fragment>
      ))}
    </Group>
  );
}
