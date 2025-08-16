// src/domain/Trajectory/trajectory.ts
import { ControlPoint } from "../control-point/controlPoint";
import type {
  ColorHex,
  InterpolationType,
  SplineType,
  SymmetryType,
} from "../../../types/types";
import { generateId, getRandomColor } from "../../../utils/utils";
import type { TrajectoryInternalAPI } from "./trajectory.interface";

export class Trajectory {
  // properties
  private readonly _id: string;
  private _name: string;
  private _controlPoints: ControlPoint[];
  private _color: ColorHex;
  private _interpolationType: InterpolationType;
  private _isVisible: boolean;
  private _isLocked: boolean;

  // non-enumerable internal facade
  public readonly internal!: TrajectoryInternalAPI;

  // constructor
  constructor(
    name: string,
    controlPoints: ControlPoint[] = [],
    color: ColorHex = getRandomColor(),
    interpolationType: InterpolationType = "EQUIDISTANT",
    isVisible: boolean = true,
    isLocked: boolean = false
  ) {
    this._id = generateId();
    this._name = sanitizeName(name);
    this._color = normalizeColor(color);
    this._controlPoints = [...controlPoints];
    this._interpolationType = interpolationType;
    this._isVisible = isVisible;
    this._isLocked = isLocked;

    Object.defineProperty(this, "internal", {
      value: {
        // meta
        setName: (n: string) => this.setName(n),
        setColor: (c: ColorHex) => this.setColor(c),
        setInterpolationType: (t: InterpolationType) =>
          this.setInterpolationType(t),
        setIsVisible: (v: boolean) => this.setIsVisible(v),
        setIsLocked: (v: boolean) => this.setIsLocked(v),

        // CP ops
        addControlPoint: (cp: ControlPoint) => this.addControlPoint(cp),
        insertControlPoint: (cp: ControlPoint, index: number) =>
          this.insertControlPoint(cp, index),
        insertControlPointBefore: (cp: ControlPoint, beforeId: string) =>
          this.insertControlPointBefore(cp, beforeId),
        insertControlPointAfter: (cp: ControlPoint, afterId: string) =>
          this.insertControlPointAfter(cp, afterId),
        removeControlPoint: (id: string) => this.removeControlPoint(id),
        removeAllControlPoints: () => this.removeAllControlPoints(),
        copyControlPoint: (id: string) => this.copyControlPoint(id),

        // neighbor-aware ops (class-level for now)
        setControlPointPosition: (id: string, x: number, y: number) =>
          this.setControlPointPosition(id, x, y),

        // TODO: Revisit symmetry enforcement rules; align with trajectory-level ops later
        setControlPointSymmetry: (id: string, symmetry: SymmetryType) =>
          this.setControlPointSymmetry(id, symmetry),

        // TODO: Verify shared state issues when changing spline type
        setControlPointSplineType: (id: string, splineType: SplineType) =>
          this.setControlPointSplineType(id, splineType),

        setHelperPointPosition: (
          cpId: string,
          handle: "in" | "out",
          absX: number,
          absY: number
        ) => this.setHelperPointPosition(cpId, handle, absX, absY),
      } as TrajectoryInternalAPI,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }

  // getters
  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get color(): ColorHex {
    return this._color;
  }
  get interpolationType(): InterpolationType {
    return this._interpolationType;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  get isLocked(): boolean {
    return this._isLocked;
  }
  get controlPoints(): ReadonlyArray<ControlPoint> {
    return this._controlPoints.slice(); // read-only view
  }
  get length(): number {
    return this._controlPoints.length;
  }

  private getControlPointById(id: string): ControlPoint | undefined {
    const idx = this.getCPIndex(id);
    return idx >= 0 ? this._controlPoints[idx] : undefined;
  }

  // basic info helpers
  private getFirstCP(): ControlPoint | undefined {
    return this._controlPoints[0];
  }
  private getLastCP(): ControlPoint | undefined {
    return this._controlPoints[this._controlPoints.length - 1];
  }
  private getCPAfter(id: string): ControlPoint | undefined {
    const i = this.getCPIndex(id);
    return i >= 0 ? this._controlPoints[i + 1] : undefined;
  }
  private getCPBefore(id: string): ControlPoint | undefined {
    const i = this.getCPIndex(id);
    return i > 0 ? this._controlPoints[i - 1] : undefined;
  }
  private getCPIndex(id: string): number {
    return this._controlPoints.findIndex((cp) => cp.id === id);
  }
  private isFirst(id: string): boolean {
    const first = this.getFirstCP();
    return !!first && first.id === id;
  }
  private isLast(id: string): boolean {
    const last = this.getLastCP();
    return !!last && last.id === id;
  }

  // mutators (no lock semantics here per your directive)

  private addControlPoint(cp: ControlPoint): void {
    this._controlPoints.push(cp);
  }

  private insertControlPoint(cp: ControlPoint, index: number): void {
    const idx = clampIndex(index, 0, this._controlPoints.length);
    this._controlPoints.splice(idx, 0, cp);
  }

  private insertControlPointBefore(cp: ControlPoint, beforeId: string): void {
    const idx = this.getCPIndex(beforeId);
    if (idx >= 0) this._controlPoints.splice(idx, 0, cp);
  }

  private insertControlPointAfter(cp: ControlPoint, afterId: string): void {
    const idx = this.getCPIndex(afterId);
    if (idx >= 0) this._controlPoints.splice(idx + 1, 0, cp);
  }

  private removeControlPoint(id: string): void {
    const idx = this.getCPIndex(id);
    if (idx >= 0) this._controlPoints.splice(idx, 1);
  }

  private copyControlPoint(id: string): ControlPoint | undefined {
    const cp = this.getControlPointById(id);
    if (!cp) return undefined;
    const hin = deepCopyHandle(cp.handleIn);
    const hout = deepCopyHandle(cp.handleOut);
    return new ControlPoint(
      cp.name,
      cp.x,
      cp.y,
      cp.heading,
      cp.splineType,
      cp.symmetry,
      hin,
      hout,
      cp.isLocked,
      cp.isEvent
    );
  }

  private removeAllControlPoints(): void {
    this._controlPoints = [];
  }

  // neighbor-aware ops kept here for now

  private setControlPointPosition(id: string, x: number, y: number): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;
    cp.internal.setPosition(assertFinite(x, "x"), assertFinite(y, "y"));
    this.enforceLinearSplineConstraint(cp);
  }

  // TODO: Revisit symmetry enforcement rules; align with trajectory-level ops later
  private setControlPointSymmetry(id: string, symmetry: SymmetryType): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;

    const splineBefore = this.getCPBefore(cp.id)?.splineType;
    const splineAfter: SplineType = cp.splineType;

    if (splineBefore === undefined) {
      // first point
    } else if (this.isLast(cp.id)) {
      // last point
    } else if (splineBefore === "LINEAR" && splineAfter === "LINEAR") {
      symmetry = "BROKEN";
    } else if (
      symmetry === "MIRRORED" &&
      !(splineBefore === "BEZIER" && splineAfter === "BEZIER")
    ) {
      symmetry = "ALIGNED";
    }
    cp.internal.setSymmetry(symmetry);
  }

  // TODO: Verify shared state issues when changing spline type
  private setControlPointSplineType(id: string, splineType: SplineType): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;

    cp.internal.setSplineType(splineType);
    if (splineType === "LINEAR") {
      cp.handleIn.internal.setIsLinear(true);
      cp.handleOut.internal.setIsLinear(true);
    } else {
      cp.handleIn.internal.setIsLinear(false);
      cp.handleOut.internal.setIsLinear(false);
    }
    this.setControlPointSymmetry(cp.id, cp.symmetry);
  }

  private setHelperPointPosition(
    cpId: string,
    handle: "in" | "out",
    absX: number,
    absY: number
  ): void {
    const cp = this.getControlPointById(cpId);
    if (!cp) return;

    const [active, opposite] =
      handle === "in"
        ? [cp.handleIn, cp.handleOut]
        : [cp.handleOut, cp.handleIn];

    const dx = assertFinite(absX, "x") - cp.x;
    const dy = assertFinite(absY, "y") - cp.y;

    const r = Math.hypot(dx, dy);
    active.internal.setR(r);

    const theta = Math.atan2(dy, dx);
    if (!opposite.isLinear) active.internal.setTheta(theta);

    this.enforceLinearSplineConstraint(cp);
  }

  private enforceLinearSplineConstraint(
    cp: ControlPoint,
    triggeredByAdjacent: boolean = false
  ): void {
    const hip = cp.handleIn.isLinear;
    const hop = cp.handleOut.isLinear;

    if (hip !== hop) {
      const [priority, secondary, adjacentCP] = hip
        ? [cp.handleIn, cp.handleOut, this.getCPBefore(cp.id)]
        : [cp.handleOut, cp.handleIn, this.getCPAfter(cp.id)];

      if (!adjacentCP) return;

      const dx = adjacentCP.x - cp.x;
      const dy = adjacentCP.y - cp.y;
      const theta = Math.atan2(dy, dx);
      priority.internal.setTheta(theta);

      if (cp.symmetry === "ALIGNED") {
        secondary.internal.setTheta(theta + Math.PI);
      }

      if (!triggeredByAdjacent) {
        // NOTE: Recursive neighbor propagation; consider a visited set or depth guard in the future
        this.enforceLinearSplineConstraint(adjacentCP, true);
      }
    } else if (hip) {
      // Invariant: both handles are linear
      const cpBefore = this.getCPBefore(cp.id);
      const cpAfter = this.getCPAfter(cp.id);

      if (cpBefore) {
        const dx = cpBefore.x - cp.x;
        const dy = cpBefore.y - cp.y;
        const theta = Math.atan2(dy, dx);
        cp.handleIn.internal.setTheta(theta);
        this.enforceLinearSplineConstraint(cpBefore, true);
      }

      if (cpAfter) {
        const dx = cpAfter.x - cp.x;
        const dy = cpAfter.y - cp.y;
        const theta = Math.atan2(dy, dx);
        cp.handleOut.internal.setTheta(theta);
        this.enforceLinearSplineConstraint(cpAfter, true);
      }
    }
  }

  // meta setters
  private setName(name: string): void {
    this._name = sanitizeName(name);
  }
  private setColor(color: ColorHex): void {
    this._color = normalizeColor(color);
  }
  private setInterpolationType(type: InterpolationType): void {
    this._interpolationType = type;
  }
  private setIsVisible(isVisible: boolean): void {
    this._isVisible = isVisible;
  }
  private setIsLocked(isLocked: boolean): void {
    this._isLocked = isLocked;
  }
}

/* ===== Helpers (validation, cloning, bounds) ===== */

function sanitizeName(name: string): string {
  if (typeof name !== "string") return "Trajectory";
  const t = name.trim();
  return t.length ? (t.length > 100 ? t.slice(0, 100) : t) : "Trajectory";
}

function normalizeColor(color: ColorHex): ColorHex {
  const s = (color || "").toString().trim();
  const hex = s.startsWith("#") ? s.slice(1) : s;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const ok = /^[0-9a-fA-F]{6}$/.test(full);
  return `#${ok ? full.toUpperCase() : "FF0000"}` as ColorHex;
}

function assertFinite(n: number, label: string): number {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${label} must be a finite number`);
  }
  return n;
}

function clampIndex(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(Math.floor(n), max));
}

function deepCopyHandle(h: ControlPoint["handleIn"]): ControlPoint["handleIn"] {
  // HelperPoint has constructor (r, theta, isLinear)
  // Accessors: r, theta, isLinear
  // @ts-expect-error runtime class import cycle is okay; shape matches HelperPoint
  const { HelperPoint } = require("../HelperPoint/helperPoint");
  // eslint-disable-next-line new-cap
  return new HelperPoint(h.r, h.theta, h.isLinear);
}
