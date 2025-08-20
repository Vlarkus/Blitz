import React from "react";
import { Group, Path } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";
import { useDataStore } from "../../../../../models/dataStore";
import ControlPointElement from "./control-point-element";
import buildPath from "../util/build-path";
import HandleElement from "./handle-element";

type Props = { trajId: string };

export default function TrajectoryElement({ trajId }: Props) {
  const traj = useDataStore((s) => s.getTrajectoryById(trajId));
  const scale = useEditorStore((s) => s.activeViewport.scale);

  if (!traj) return null;

  const getHandlePosition = useDataStore((s) => s.getHandlePosition);

  const d = buildPath(traj, getHandlePosition);
  //   const d = React.useMemo(
  //     () => buildPath(traj, getHandlePosition),
  //     [traj, getHandlePosition]
  //   ); // Optimization that stops rendering paths on every frame.

  return (
    <Group name={`traj:${traj.id}`} listening>
      <Path
        name={`trajectory:${traj.id}`}
        data={d}
        stroke={traj.color}
        // strokeWidth={(1 / scale) * 3} // screen-constant stroke
        strokeWidth={2 / scale} // world-constant stroke
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
