
import { Trajectory } from "../entities/trajectory/trajectory";
import { ControlPoint } from "../entities/control-point/controlPoint";
import { HelperPoint } from "../entities/helper-point/helperPoint";
import { cartesianToPolar, normRad, getRandomColor } from "../../utils/utils";

// Inches to Meters
const INCHES_TO_METERS = 0.0254;

interface JerryIoControl {
    uid: string;
    x: number;
    y: number;
    heading?: number;
    __type: string;
}

interface JerryIoSegment {
    controls: JerryIoControl[];
}

interface JerryIoPath {
    segments: JerryIoSegment[];
    name: string;
    visible: boolean;
}

interface JerryIoData {
    paths: JerryIoPath[];
}

export function importFromJerryIO(content: string): Trajectory[] {
    const marker = "#PATH.JERRYIO-DATA";
    const index = content.indexOf(marker);

    if (index === -1) {
        throw new Error("Invalid JerryIO file: Missing data marker.");
    }

    const jsonStr = content.slice(index + marker.length).trim();
    let data: JerryIoData;

    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error("Invalid JerryIO file: Failed to parse JSON data.");
    }

    const result: Trajectory[] = [];

    for (const p of data.paths) {
        const controlPoints: ControlPoint[] = [];

        // Each 'path' in JerryIO is a collection of cubic bezier segments
        // [s1, s2, s3, ...]
        // Each segment has 4 points: [P0, P1, P2, P3]
        // P3 of s1 is P0 of s2.
        //
        // Blitz ControlPoint structure:
        // P0 is a ControlPoint. P1 is P0.handleOut. P2 is P3.handleIn. P3 is a ControlPoint.

        if (!p.segments || !Array.isArray(p.segments)) continue;

        for (let i = 0; i < p.segments.length; i++) {
            const seg = p.segments[i];
            if (!seg || !seg.controls || seg.controls.length < 4) {
                console.warn(`Skipping invalid segment ${i} in path ${p.name}`);
                continue;
            }

            const c0 = seg.controls[0];
            const c1 = seg.controls[1];
            const c2 = seg.controls[2];
            const c3 = seg.controls[3];

            // Process Start Point (P0)
            // Only if it's the very first segment. For subsequent segments, P0 is P3 of previous.
            if (i === 0) {
                // P0
                const x = c0.x * INCHES_TO_METERS;
                const y = c0.y * INCHES_TO_METERS;

                // HandleOut: Vector P0 -> P1
                // P1 relative to P0
                const dx = (c1.x - c0.x) * INCHES_TO_METERS;
                const dy = (c1.y - c0.y) * INCHES_TO_METERS;
                const hOut = cartesianToPolar(dx, dy);

                // Heading:
                // JerryIO uses degrees. Blitz uses radians.
                // If c0.heading is present, use it.
                let heading = typeof c0.heading === 'number' ? (c0.heading * Math.PI) / 180 : null;
                if (heading !== null) {
                    // Ensure heading and handle are aligned? 
                    // In Blitz, handles are relative to CP. 
                    // For now, trust the raw geometry handle.
                    heading = normRad(heading);
                }

                const cp = new ControlPoint({
                    _name: `Point 0`,
                    _x: x,
                    _y: y,
                    _heading: heading,
                    _handleOut: { _r: hOut.r, _theta: hOut.theta, _isLinear: false },
                    // HandleIn defaults to opposite or irrelevant for Start point
                    _handleIn: { _r: 0.5, _theta: Math.PI, _isLinear: false }
                });
                controlPoints.push(cp);
            }

            // Process End Point (P3)
            // P3 becomes the main control point.
            // P2 is P3.handleIn.

            const x3 = c3.x * INCHES_TO_METERS;
            const y3 = c3.y * INCHES_TO_METERS;

            // HandleIn: Vector P3 -> P2 (Note: HandleIn points AWAY from CP in Blitz?)
            // Wait, standard bezier def: P(t). 
            // Blitz HelperPoint: "handleIn" usually means the "arrival" handle.
            // Let's verify HelperPoint usage in ControlPoint.
            // Usually: HandleIn is the control point PRECEDING the knot. HandleOut is SUCCEEDING.
            // Relative coords:
            // HandleIn vector is relative to CP. So it is P2 - P3.

            const dxIn = (c2.x - c3.x) * INCHES_TO_METERS;
            const dyIn = (c2.y - c3.y) * INCHES_TO_METERS;
            const hIn = cartesianToPolar(dxIn, dyIn);

            // Does this segment have a HandleOut for the NEXT segment?
            // That comes from the NEXT segment's c1 (if it exists).
            // But we are constructing P3 right now. We don't know the next segment yet.
            // However, if we iterate segments, the P3 of this segment is the P0 of the next.
            // So we can defer handleOut? Or simpler: 
            // Construct P3 completely now, but what about its HandleOut? 
            // We need to look ahead to segment i+1.

            let hOut = { r: 0.5, theta: 0 }; // default

            // Peek at next segment to determine handleOut
            if (i < p.segments.length - 1) {
                const nextSeg = p.segments[i + 1];
                // nextSeg.P0 should match current P3.
                // nextSeg.P1 is the handle target for current P3 handleOut.
                if (nextSeg && nextSeg.controls && nextSeg.controls.length > 1) {
                    const nextC1 = nextSeg.controls[1];
                    // Vector P3 -> nextC1
                    const dxOut = (nextC1.x - c3.x) * INCHES_TO_METERS;
                    const dyOut = (nextC1.y - c3.y) * INCHES_TO_METERS;
                    const polar = cartesianToPolar(dxOut, dyOut);
                    hOut = { r: polar.r, theta: polar.theta };
                }
            }

            let heading3 = typeof c3.heading === 'number' ? (c3.heading * Math.PI) / 180 : null;
            if (heading3 !== null) heading3 = normRad(heading3);

            const cp3 = new ControlPoint({
                _name: `Point ${controlPoints.length}`,
                _x: x3,
                _y: y3,
                _heading: heading3,
                _handleIn: { _r: hIn.r, _theta: hIn.theta, _isLinear: false },
                _handleOut: { _r: hOut.r, _theta: hOut.theta, _isLinear: false },
                _splineType: "BEZIER"
            });

            controlPoints.push(cp3);
        }

        if (controlPoints.length > 0) {
            // Use random color
            const t = new Trajectory(
                p.name || "Imported Path",
                controlPoints,
                getRandomColor(),
                "CUBIC",
                true,
                false
            );
            result.push(t);
            console.log(`Imported path "${p.name}" with ${controlPoints.length} points.`);
        }
    }

    return result;
}
