import React from "react";
import { Circle } from "react-konva";
import { useEditorStore } from "../../../../../editor/editor-store";

interface Props {
    x: number;
    y: number;
    color: string;
}

const FollowPointElement = React.memo(({ x, y, color }: Props) => {
    const scale = useEditorStore((s) => s.activeViewport.scale);

    return (
        <Circle
            x={x}
            y={y}
            radius={3 / scale}
            fill={color}
            perfectDrawEnabled={false}
            listening={false}
        />
    );
});

export default FollowPointElement;
