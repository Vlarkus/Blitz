import type { CanvasConfig } from "../../../../editor/editor-store.interface";

interface Props {
    config: CanvasConfig["coordinateSystem"];
}

export default function CoordinatePreview({ config }: Props) {
    const { positiveX, positiveY, zeroAngle, rotationDirection } = config;

    // Helper to get rotation in degrees for a direction (Right = 0)
    const getDirAngle = (dir: string) => {
        switch (dir) {
            case "RIGHT":
                return 0;
            case "DOWN":
                return 90;
            case "LEFT":
                return 180;
            case "UP":
                return 270;
            default:
                return 0;
        }
    };

    const xAngle = getDirAngle(positiveX);
    const yAngle = getDirAngle(positiveY);
    const zeroAngleDeg = getDirAngle(zeroAngle);

    // Center of 250x250 box
    const cx = 125;
    const cy = 125;

    // Axes length
    const length = 40;
    // Labels are offset from the end of the line
    const labelOffset = 15;

    // Rotation arc logic
    // Radius for the rotation arc
    const arcRadius = 75;

    const isCCW = rotationDirection === "CCW";
    const arcStartAngle = zeroAngleDeg;
    // 25% of full circle = 90 degrees
    const arcSweep = isCCW ? -90 : 90;

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const arcEndAngle = arcStartAngle + arcSweep;

    const startX = cx + arcRadius * Math.cos(toRad(arcStartAngle));
    const startY = cy + arcRadius * Math.sin(toRad(arcStartAngle));

    const endX = cx + arcRadius * Math.cos(toRad(arcEndAngle));
    const endY = cy + arcRadius * Math.sin(toRad(arcEndAngle));

    const sweepFlag = arcSweep > 0 ? 1 : 0;
    const largeArcFlag = Math.abs(arcSweep) > 180 ? 1 : 0;

    const arcPath = `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;

    // Helper to calculate label position based on angle
    const getLabelPos = (angleDeg: number, dist: number) => {
        const rad = toRad(angleDeg);
        return {
            x: cx + dist * Math.cos(rad),
            y: cy + dist * Math.sin(rad)
        };
    };

    const xLabelPos = getLabelPos(xAngle, length + labelOffset);
    const yLabelPos = getLabelPos(yAngle, length + labelOffset);

    return (
        <svg width="250" height="250" viewBox="0 0 250 250">
            {/* Rotation Direction Arrow (Arc) */}
            <path
                d={arcPath}
                fill="none"
                stroke="#666"
                strokeWidth="2"
            // No arrowhead for now as requested "arrow going CW or CCW" but "arrow does not have triangle" - usually implies simple line or chevron? 
            // "The arrow does not have triangle" -> maybe a simple open chevron at the end?
            // Let's draw a simple chevron at `endX, endY` manually
            />
            {/* Chevron at end of arc */}
            {/* We need tangent angle at end of arc for proper rotation */}
            {/* Tangent of circle at angle theta is theta + 90 (or -90 depending on direction) */}
            <g transform={`translate(${endX}, ${endY}) rotate(${arcEndAngle + (isCCW ? -90 : 90)})`}>
                <polyline points="-4,-4 0,0 -4,4" fill="none" stroke="#666" strokeWidth="2" />
            </g>


            {/* Label for 0 degrees */}
            {/* <text
                x={getXLabelPos(zeroAngleDeg, arcRadius - 15).x} // Put it nicely inside or near start
                y={getXLabelPos(zeroAngleDeg, arcRadius - 15).y}
                // Actually user said: "text saying '0' in the direction of 0 angle measure"
                // Maybe further out? 
            /> */}
            <text
                x={cx + (arcRadius + 10) * Math.cos(toRad(zeroAngleDeg))}
                y={cy + (arcRadius + 10) * Math.sin(toRad(zeroAngleDeg))}
                fill="#888"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
            >
                0
            </text>


            {/* X Axis Stick */}
            <line
                x1={cx}
                y1={cy}
                x2={cx + length * Math.cos(toRad(xAngle))}
                y2={cy + length * Math.sin(toRad(xAngle))}
                stroke="#ff5555"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <text
                x={xLabelPos.x}
                y={xLabelPos.y}
                fill="#ff5555"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
            >
                X
            </text>

            {/* Y Axis Stick */}
            <line
                x1={cx}
                y1={cy}
                x2={cx + length * Math.cos(toRad(yAngle))}
                y2={cy + length * Math.sin(toRad(yAngle))}
                stroke="#55ff55"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <text
                x={yLabelPos.x}
                y={yLabelPos.y}
                fill="#55ff55"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
            >
                Y
            </text>

            {/* Origin Dot */}
            <circle cx={cx} cy={cy} r="3" fill="#fff" />
        </svg>
    );
}
