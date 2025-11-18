// src/domain/Trajectory/trajectory.ts
import { ControlPoint } from "../control-point/controlPoint";
import type {
  ColorHex,
  HandlePosInput,
  InterpolationType,
  SplineType,
  SymmetryType,
} from "../../../types/types";
import {
  clampPositive,
  generateId,
  getRandomColor,
  normRad,
} from "../../../utils/utils";
import type { TrajectoryInternalAPI } from "./trajectory.interface";
import type { HelperPoint } from "../helper-point/helperPoint";

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

  private _notifyDirty?: () => void;

  /** Store wires this once when the Trajectory is created/loaded */
  setDirtyNotifier(fn: () => void) {
    this._notifyDirty = fn;
  }

  /** Call at the end of any mutator to publish a store update */
  private _dirty() {
    this._notifyDirty?.();
  }

  // --- Overloaded constructors ---
  constructor(
    name: string,
    controlPoints?: ControlPoint[],
    color?: ColorHex,
    interpolationType?: InterpolationType,
    isVisible?: boolean,
    isLocked?: boolean
  );
  constructor(obj: {
    _name?: string;
    _controlPoints?: ControlPoint[];
    _color?: ColorHex;
    _interpolationType?: InterpolationType;
    _isVisible?: boolean;
    _isLocked?: boolean;
  });

  // --- Implementation ---
  constructor(
    arg1:
      | string
      | {
          _name?: string;
          _controlPoints?: ControlPoint[];
          _color?: ColorHex;
          _interpolationType?: InterpolationType;
          _isVisible?: boolean;
          _isLocked?: boolean;
        },
    controlPoints: ControlPoint[] = [],
    color: ColorHex = getRandomColor(),
    interpolationType: InterpolationType = "EQUIDISTANT",
    isVisible: boolean = true,
    isLocked: boolean = false
  ) {
    this._id = generateId();

    if (typeof arg1 === "object" && arg1 !== null) {
      const obj = arg1;

      // --- Only use underscored JSON fields ---
      this._name = sanitizeName(obj._name ?? "Trajectory Default Name");
      this._color = normalizeColor(obj._color ?? getRandomColor());
      this._interpolationType = obj._interpolationType ?? "EQUIDISTANT";
      this._isVisible = obj._isVisible ?? true;
      this._isLocked = obj._isLocked ?? false;

      // Map control points (each is also underscored)
      this._controlPoints = (obj._controlPoints ?? []).map((cpObj: any) => {
        return new ControlPoint({
          _name: cpObj._name,
          _x: cpObj._x,
          _y: cpObj._y,
          _heading: cpObj._heading,
          _splineType: cpObj._splineType,
          _symmetry: cpObj._symmetry,
          _handleIn: {
            _r: cpObj._handleIn?._r,
            _theta: cpObj._handleIn?._theta,
            _isLinear: cpObj._handleIn?._isLinear,
          },
          _handleOut: {
            _r: cpObj._handleOut?._r,
            _theta: cpObj._handleOut?._theta,
            _isLinear: cpObj._handleOut?._isLinear,
          },
          _isLocked: cpObj._isLocked,
          _isEvent: cpObj._isEvent,
        });
      });
    } else {
      // --- Standard creation path ---
      this._name = sanitizeName(arg1);
      this._color = normalizeColor(color);
      this._interpolationType = interpolationType;
      this._isVisible = isVisible;
      this._isLocked = isLocked;
      this._controlPoints = [...controlPoints];
    }

    // Keep your internal facade unchanged
    Object.defineProperty(this, "internal", {
      value: {
        setName: (n: string) => this.setName(n),
        setColor: (c: ColorHex) => this.setColor(c),
        setInterpolationType: (t: InterpolationType) =>
          this.setInterpolationType(t),
        setIsVisible: (v: boolean) => this.setIsVisible(v),
        setIsLocked: (v: boolean) => this.setIsLocked(v),
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
        setControlPointPosition: (id: string, x: number, y: number) =>
          this.setControlPointPosition(id, x, y),
        setControlPointSymmetry: (id: string, symmetry: SymmetryType) =>
          this.setControlPointSymmetry(id, symmetry),
        setControlPointSplineType: (id: string, splineType: SplineType) =>
          this.setControlPointSplineType(id, splineType),
        setControlPointLock: (trajId: string, cpId: string, locked: boolean) =>
          this.setControlPointLock(cpId, locked),
        setHelperPointPosition: (
          cpId: string,
          handle: "in" | "out",
          pos: HandlePosInput
        ) => this.setHelperPointPosition(cpId, handle, pos),
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

  private removeAllControlPoints(): void {
    this._controlPoints = [];
    this._dirty();
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

  // mutators (no lock semantics here per your directive)
  //
  //
  //
  //

  private addControlPoint(cp: ControlPoint): void {
    this._controlPoints.push(cp);
    this.enforceRules(cp);
    this._dirty();
  }

  private insertControlPoint(cp: ControlPoint, index: number): void {
    const idx = clampIndex(index, 0, this._controlPoints.length);
    this._controlPoints.splice(idx, 0, cp);
    this.enforceRules(cp);
    this._dirty();
  }

  private insertControlPointBefore(cp: ControlPoint, beforeId: string): void {
    const idx = this.getCPIndex(beforeId);
    if (idx >= 0) this._controlPoints.splice(idx, 0, cp);
    this.enforceRules(cp);
    this._dirty();
  }

  private insertControlPointAfter(cp: ControlPoint, afterId: string): void {
    const idx = this.getCPIndex(afterId);
    if (idx >= 0) this._controlPoints.splice(idx + 1, 0, cp);
    this.enforceRules(cp);
    this._dirty();
  }

  private removeControlPoint(id: string): void {
    const idx = this.getCPIndex(id);
    if (idx < 0) return;

    // Capture neighbors before removal
    const prevCP = idx > 0 ? this._controlPoints[idx - 1] : undefined;
    const nextCP =
      idx + 1 < this._controlPoints.length
        ? this._controlPoints[idx + 1]
        : undefined;

    // Remove the CP
    this._controlPoints.splice(idx, 1);

    // Re-enforce rules around the junction created by the removal
    if (prevCP) this.enforceRules(prevCP, true);
    if (nextCP) this.enforceRules(nextCP, true);

    this._dirty();
  }

  // neighbor-aware ops kept here for now

  private setControlPointPosition(id: string, x: number, y: number): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;
    cp.internal.setPosition(assertFinite(x, "x"), assertFinite(y, "y"));
    this.enforceRules(cp);
    this._dirty();
  }

  // TODO: Revisit symmetry enforcement rules; align with trajectory-level ops later
  private setControlPointSymmetry(id: string, symmetry: SymmetryType): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;

    cp.internal.setSymmetry(symmetry);
    this.enforceRules(cp, true);

    this._dirty();
  }

  private setControlPointSplineType(id: string, splineType: SplineType): void {
    const cp = this.getControlPointById(id);
    if (!cp) return;

    cp.internal.setSplineType(splineType);
    this.enforceRules(cp);
    this._dirty();
  }

  private setControlPointLock(cpId: string, locked: boolean): void {
    const cp = this.getControlPointById(cpId);
    if (!cp) return;

    cp.internal.setIsLocked(locked);
  }

  private setHelperPointPosition(
    cpId: string,
    handle: "in" | "out",
    pos: HandlePosInput
  ): void {
    const cp = this.getControlPointById(cpId);
    if (!cp) return;

    const active = handle === "in" ? cp.handleIn : cp.handleOut;
    const other = handle === "in" ? cp.handleOut : cp.handleIn;

    // --- Normalize input to (r, theta) relative to CP ---
    let r: number;
    let theta: number;

    if (pos.type === "absolute") {
      const dx = assertFinite(pos.x, "x") - cp.x;
      const dy = assertFinite(pos.y, "y") - cp.y;
      r = clampPositive(Math.hypot(dx, dy));
      theta = Math.atan2(dy, dx);
    } else if (pos.type === "relative") {
      const dx = assertFinite(pos.dx, "dx");
      const dy = assertFinite(pos.dy, "dy");
      r = clampPositive(Math.hypot(dx, dy));
      theta = Math.atan2(dy, dx);
    } else {
      // polar (default)
      r = clampPositive(assertFinite(pos.r, "r"));
      theta = normRad(assertFinite(pos.theta, "theta"));
    }

    // apply to active
    active.internal.setR(r);
    if (!active.isLinear) active.internal.setTheta(theta);

    // symmetry for non-linear pair
    if (!active.isLinear && !other.isLinear) {
      if (cp.symmetry === "ALIGNED" || cp.symmetry === "MIRRORED") {
        const thetaOpp = Math.atan2(
          Math.sin(theta + Math.PI),
          Math.cos(theta + Math.PI)
        );
        other.internal.setTheta(thetaOpp);
        if (cp.symmetry === "MIRRORED") other.internal.setR(r);
      }
    }

    this.enforceRules(cp, true);
    this._dirty();
  }

  private enforceRules(thisCP: ControlPoint, isFirstCall: boolean = true) {
    this.enforceSymmetryRule(thisCP);
    this.enforceLinearSplineRule(thisCP);

    if (isFirstCall) {
      const prev = this.getCPBefore(thisCP.id);
      if (prev) this.enforceRules(prev, false);

      const next = this.getCPAfter(thisCP.id);
      if (next) this.enforceRules(next, false);
    }
  }

  private enforceLinearSplineRule(thisCP: ControlPoint) {
    const prevCP = this.getCPBefore(thisCP.id);
    const nextCP = this.getCPAfter(thisCP.id);

    const prevLinear = !!prevCP && prevCP.splineType === "LINEAR"; // (prevCP → thisCP)
    const thisLinear = thisCP.splineType === "LINEAR"; // (thisCP → nextCP)

    // Helper: θ from thisCP toward neighbor; null if coincident/none
    const thetaToward = (neighbor?: ControlPoint): number | null => {
      if (!neighbor) return null;
      const dx = neighbor.x - thisCP.x;
      const dy = neighbor.y - thisCP.y;
      if (dx === 0 && dy === 0) return null;
      return Math.atan2(dy, dx);
    };

    // Exactly one side is linear
    if (prevLinear !== thisLinear) {
      if (prevLinear) {
        // IN side linear → align IN, set isLinear flags
        const th = thetaToward(prevCP);
        thisCP.handleIn.internal.setIsLinear(true);
        thisCP.handleOut.internal.setIsLinear(false);

        if (th != null) {
          thisCP.handleIn.internal.setTheta(th);
          // If ALIGNED, mirror angle on the non-linear side (angle only)
          if (thisCP.symmetry === "ALIGNED" && !thisCP.handleOut.isLinear) {
            const opp = Math.atan2(
              Math.sin(th + Math.PI),
              Math.cos(th + Math.PI)
            );
            thisCP.handleOut.internal.setTheta(opp);
          }
        }
      } else {
        // OUT side linear → align OUT, set isLinear flags
        const th = thetaToward(nextCP);
        thisCP.handleOut.internal.setIsLinear(true);
        thisCP.handleIn.internal.setIsLinear(false);

        if (th != null) {
          thisCP.handleOut.internal.setTheta(th);
          if (thisCP.symmetry === "ALIGNED" && !thisCP.handleIn.isLinear) {
            const opp = Math.atan2(
              Math.sin(th + Math.PI),
              Math.cos(th + Math.PI)
            );
            thisCP.handleIn.internal.setTheta(opp);
          }
        }
      }
      return;
    }

    // Both sides linear
    if (prevLinear && thisLinear) {
      thisCP.handleIn.internal.setIsLinear(true);
      thisCP.handleOut.internal.setIsLinear(true);

      const thIn = thetaToward(prevCP);
      if (thIn != null) thisCP.handleIn.internal.setTheta(thIn);

      const thOut = thetaToward(nextCP);
      if (thOut != null) thisCP.handleOut.internal.setTheta(thOut);

      // Optional: symmetry cannot be maintained when both are linear
      if (thisCP.symmetry !== "BROKEN") thisCP.internal.setSymmetry("BROKEN");
      return;
    }

    // Neither side linear → ensure flags are unset; leave angles as-is
    thisCP.handleIn.internal.setIsLinear(false);
    thisCP.handleOut.internal.setIsLinear(false);
  }

  private enforceSymmetryRule(thisCP: ControlPoint) {
    const prevCP = this.getCPBefore(thisCP.id);
    const prevIsLinear = prevCP?.splineType === "LINEAR";
    const thisIsLinear = thisCP.splineType === "LINEAR";

    if ((prevIsLinear || thisIsLinear) && thisCP.symmetry === "MIRRORED") {
      thisCP.internal.setSymmetry("ALIGNED");
    }
  }

  // meta setters
  //
  //
  //
  //

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
  // eslint-disable-next-line new-cap
  return new HelperPoint(h.r, h.theta);
}
