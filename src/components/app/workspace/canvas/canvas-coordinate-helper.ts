import type { CanvasConfig } from "../../../../editor/editor-store.interface";

// Types for the hook return
interface CanvasTransform {
    groupProps: {
        rotation: number;
        scaleX: number;
        scaleY: number;
    };
    mapHeading: (userHeadingRad: number) => number; // Returns degrees for Konva
    screenToUser: (stageX: number, stageY: number, viewport: { originX: number; originY: number; scale: number }) => { x: number; y: number };
}

export class CanvasCoordinateSystem {
    private scaleY: number;
    private groupRotation: number;
    private zeroAng: number;
    private dirMult: number;

    constructor(config: CanvasConfig) {
        const { positiveX, positiveY, zeroAngle, rotationDirection } = config.coordinateSystem;

        // 1. Calculate Group Transform
        // We align Group +X with User +X.
        // Screen Angles: R=0, D=90, L=180, U=270
        let groupRotation = 0;
        switch (positiveX) {
            case "RIGHT": groupRotation = 0; break;
            case "DOWN": groupRotation = 90; break;
            case "LEFT": groupRotation = 180; break;
            case "UP": groupRotation = 270; break;
        }

        // Determine scaleY
        let scaleY = 1;
        const xAng = this.dirToAngle(positiveX);
        const yAng = this.dirToAngle(positiveY);

        // Relative angle of Y from X
        const relY = (yAng - xAng + 360) % 360;
        if (relY === 90) {
            scaleY = 1; // Normal (Y is 90 deg "down" from X if X is 0)
        } else {
            scaleY = -1; // Flip
        }

        this.groupRotation = groupRotation;
        this.scaleY = scaleY;
        this.zeroAng = this.dirToAngle(zeroAngle);
        this.dirMult = rotationDirection === "CW" ? 1 : -1;
    }

    private dirToAngle(dir: string): number {
        switch (dir) {
            case "RIGHT": return 0;
            case "DOWN": return 90;
            case "LEFT": return 180;
            case "UP": return 270;
            default: return 0;
        }
    }

    public getGroupProps() {
        return {
            rotation: this.groupRotation,
            scaleX: 1,
            scaleY: this.scaleY
        };
    }

    // World (User) Heading (Radians) -> Screen Heading (Degrees)
    public mapHeadingToScreen(userHeadingRad: number): number {
        const userHeadingDeg = (userHeadingRad * 180) / Math.PI;
        // User visual angle = Zero + (Dir * Heading)
        const targetVisualDeg = this.zeroAng + (this.dirMult * userHeadingDeg);

        // Group visual angle = GroupRot + (ScaleY * ObjectRot)
        // ObjectRot = (Visual - Group) * ScaleY 
        // (Divide by ScaleY is same as Multiply since ScaleY is +/-1)
        return (targetVisualDeg - this.groupRotation) * this.scaleY;
    }

    // Screen Heading (Degrees) -> World (User) Heading (Radians)
    public mapHeadingFromScreen(objectRotDeg: number): number {
        // Reverse:
        // Visual = GroupRot + (ScaleY * ObjectRot)
        const visualDeg = this.groupRotation + (this.scaleY * objectRotDeg);

        // Visual = Zero + (Dir * UserHeading)
        // UserHeading = (Visual - Zero) * Dir  (Dir is +/-1)
        const userHeadingDeg = (visualDeg - this.zeroAng) * this.dirMult;

        return (userHeadingDeg * Math.PI) / 180;
    }

    // Screen (Stage/Pixel relative to origin/scale) -> User (Meters)
    // "stageX, stageY" here refers to "Canvas Space" (meters, centered at viewport origin) 
    // NOT raw pointer pixels. We assume viewport transform is already handled or passed in.
    // Wait, the previous hook took raw pixels and viewport. Let's separate concerns.
    // This class should handle mapping from "Standard Canvas Space (Meters, Right/Down)" to "User Space".

    public toUser(canvasX: number, canvasY: number): { x: number, y: number } {
        // canvasX/Y are in the "Group" parent space (Standard definition).

        // Inverse Group Transform:
        // 1. ScaleY
        const cy = canvasY * this.scaleY;

        // 2. Rotation (-groupRotation)
        const rad = (-this.groupRotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const ux = canvasX * cos - cy * sin;
        const uy = canvasX * sin + cy * cos;

        return { x: ux, y: uy };
    }

    public fromUser(userX: number, userY: number): { x: number, y: number } {
        // User -> standard canvas

        // 1. Rotation (+groupRotation)
        const rad = (this.groupRotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const cx = userX * cos - userY * sin;
        let cy = userX * sin + userY * cos;

        // 2. ScaleY
        cy = cy * this.scaleY;

        return { x: cx, y: cy };
    }
}

export function useCanvasCoordinates(config: CanvasConfig): CanvasTransform {
    const sys = new CanvasCoordinateSystem(config);

    const groupProps = sys.getGroupProps();
    const mapHeading = (r: number) => sys.mapHeadingToScreen(r);

    // Legacy support for the pixel-based helper
    const screenToUser = (stageX: number, stageY: number, viewport: { originX: number; originY: number; scale: number }) => {
        // To "Standard Canvas Meters"
        const cx = (stageX - viewport.originX) / viewport.scale;
        const cy = (stageY - viewport.originY) / viewport.scale;

        return sys.toUser(cx, cy);
    };

    return {
        groupProps,
        mapHeading,
        screenToUser
    };
}
