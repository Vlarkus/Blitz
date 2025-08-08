import { v4 as uuid } from "uuid";
import type {
  SplineType,
  InterpolationType,
  Color,
  SymmetryType,
} from "../../types/types";
import { getRandomColor } from "../../utils/utils";
import { ControlPoint } from "./controlPoint";

export class Trajectory {
  // ───── PROPERTIES ─────
  private readonly _id: string;
  private _name: string;
  private _color: Color;
  private _controlPoints: ControlPoint[];
  private _interpolationType: InterpolationType;
  private _isVisible: boolean;
  private _isLocked: boolean;

  // ───── CONSTRUCTOR ─────
  constructor(
    name: string,
    color: Color = getRandomColor(),
    controlPoints: ControlPoint[] = [],
    interpolationType: InterpolationType = "EQUIDISTANT",
    isVisible: boolean = true,
    isLocked: boolean = false
  ) {
    this._id = uuid();
    this._name = name;
    this._color = color;
    this._controlPoints = controlPoints;
    this._interpolationType = interpolationType;
    this._isVisible = isVisible;
    this._isLocked = isLocked;
  }

  // ───── GETTERS ─────

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get color(): Color {
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

  get controlPoints(): ControlPoint[] {
    return this._controlPoints;
  }

  getControlPoint(index: number): ControlPoint | undefined;
  getControlPoint(id: string): ControlPoint | undefined;
  getControlPoint(key: number | string): ControlPoint | undefined {
    if (typeof key === "number") {
      return this._controlPoints[key];
    } else {
      return this._controlPoints.find((cp) => cp.id === key);
    }
  }

  get length(): number {
    return this._controlPoints.length;
  }

  getCPIndex(id: string): number {
    return this._controlPoints.findIndex((cp) => cp.id === id);
  }

  getCPId(index: number): string | undefined {
    return this._controlPoints[index]?.id;
  }

  getCPAfter(idOrIndex: string | number): ControlPoint | undefined {
    const index =
      typeof idOrIndex === "number" ? idOrIndex : this.getCPIndex(idOrIndex);
    return this._controlPoints[index + 1];
  }

  getCPBefore(idOrIndex: string | number): ControlPoint | undefined {
    const index =
      typeof idOrIndex === "number" ? idOrIndex : this.getCPIndex(idOrIndex);
    return this._controlPoints[index - 1];
  }

  getLastCP(): ControlPoint | undefined {
    return this._controlPoints[this._controlPoints.length - 1];
  }

  getFirstCP(): ControlPoint | undefined {
    return this._controlPoints[0];
  }

  // ───── MUTATORS ─────

  appendCP(controlPoint: ControlPoint): void {
    this._controlPoints.push(controlPoint);
  }

  insertCP(controlPoint: ControlPoint, index: number): void {
    this._controlPoints.splice(index, 0, controlPoint);
  }

  insertCPBefore(controlPoint: ControlPoint, beforeId: string): void {
    const index = this.getCPIndex(beforeId);
    if (index !== -1) this.insertCP(controlPoint, index);
  }

  insertCPAfter(controlPoint: ControlPoint, afterId: string): void {
    const index = this.getCPIndex(afterId);
    if (index !== -1) this.insertCP(controlPoint, index + 1);
  }

  removeCP(key: number | string): void {
    if (typeof key === "number") {
      if (key >= 0 && key < this._controlPoints.length) {
        this._controlPoints.splice(key, 1);
      }
    } else {
      const index = this._controlPoints.findIndex((cp) => cp.id === key);
      if (index !== -1) {
        this._controlPoints.splice(index, 1);
      }
    }
  }

  copyCP(key: number | string): ControlPoint | undefined {
    const cp =
      typeof key === "number"
        ? this._controlPoints[key]
        : this._controlPoints.find((cp) => cp.id === key);

    if (!cp) return undefined;

    const copied = new ControlPoint(
      cp.name,
      cp.x,
      cp.y,
      cp.heading,
      cp.splineType,
      cp.symmetry,
      cp.handleIn, // Shallow copy; deep clone if needed
      cp.handleOut,
      cp.isLocked,
      cp.isVisible
    );
    return copied;
  }

  removeAllCPs(): void {
    this._controlPoints = [];
  }

  appendCPAfter(controlPoint: ControlPoint, afterId: string): void {
    this.insertCPAfter(controlPoint, afterId);
  }

  // ───── UTILITY ─────

  hasCP(key: string | number): boolean {
    if (typeof key === "number")
      return key >= 0 && key < this._controlPoints.length;
    return this._controlPoints.some((cp) => cp.id === key);
  }

  isLast(id: string): boolean {
    return this.getLastCP() === this.getControlPoint(id);
  }

  isFirst(id: string): boolean {
    return this.getFirstCP() === this.getControlPoint(id);
  }

  isEmpty(): boolean {
    return this._controlPoints.length === 0;
  }

  getCPIds(): string[] {
    return this._controlPoints.map((cp) => cp.id);
  }

  getCPNames(): string[] {
    return this._controlPoints.map((cp) => cp.name);
  }

  clone(): Trajectory {
    return new Trajectory(
      this._name,
      this.color,
      this._controlPoints.map((cp) => this.copyCP(cp.id)!)
    );
  }

  setCPPosition(id: string, x: number, y: number): void {
    const cp = this.getControlPoint(id);
    if (!cp) return;
    cp.internal.setPosition(x, y);
    this.enforceLinearSplineConstraint(cp);
  }

  setCPSymmetry(id: string, symmetry: SymmetryType): void {
    const cp = this.getControlPoint(id);
    if (!cp) return;

    const splineBefore = this.getCPBefore(cp.id)?.splineType;
    const splineAfter: SplineType = cp.splineType;

    if (splineBefore === undefined) {
    } else if (this.isLast(cp.id)) {
    } else if (splineBefore == "LINEAR" && splineAfter == "LINEAR") {
      symmetry = "BROKEN";
    } else if (
      symmetry === "MIRRORED" &&
      !(splineBefore == "BEZIER" && splineAfter == "BEZIER")
    ) {
      symmetry = "ALIGNED";
    }
    cp.internal.setSymmetry(symmetry);
  }

  setCPSplineType(id: string, splineType: SplineType): void {
    const cp = this.getControlPoint(id);
    if (!cp) return;

    cp.internal.setSplineType(splineType);
    if (splineType === "LINEAR") {
      cp.handleIn.internal.setIsPriority(true);
      cp.handleOut.internal.setIsPriority(true);
    } else {
      cp.handleIn.internal.setIsPriority(false);
      cp.handleOut.internal.setIsPriority(false);
    }
    this.setCPSymmetry(cp.id, cp.symmetry);
  }

  setHelperPointPosition(
    cpId: string,
    handle: "in" | "out",
    absX: number,
    absY: number
  ): void {
    const cp = this.getControlPoint(cpId);
    if (!cp) return;

    const [active, opposite] =
      handle === "in"
        ? [cp.handleIn, cp.handleOut]
        : [cp.handleOut, cp.handleIn];

    const dx = absX - cp.x;
    const dy = absY - cp.y;

    const r = Math.hypot(dx, dy);
    active.internal.setR(r);

    const theta = Math.atan2(dy, dx);
    if (!opposite.isPriority) active.internal.setTheta(theta);

    this.enforceLinearSplineConstraint(cp);
  }

  private enforceLinearSplineConstraint(
    cp: ControlPoint,
    triggeredByAdjacent: boolean = false
  ): void {
    const hip = cp.handleIn.isPriority; // Handle In Priority
    const hop = cp.handleOut.isPriority; // Handle Out Priority

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
        this.enforceLinearSplineConstraint(adjacentCP, true);
      }
    } else if (hip) {
      // Invariant: hip and hop are both true.

      const cpBefore = this.getCPBefore(cp.id);
      const cpAfter = this.getCPAfter(cp.id);
      const hin = cp.handleIn;
      const hout = cp.handleOut;

      if (cpBefore instanceof ControlPoint) {
        const dx = cpBefore.x - cp.x;
        const dy = cpBefore.y - cp.y;
        const theta = Math.atan2(dy, dx);
        hin.internal.setTheta(theta);
        this.enforceLinearSplineConstraint(cpBefore, true);
      }

      if (cpAfter instanceof ControlPoint) {
        const dx = cpAfter.x - cp.x;
        const dy = cpAfter.y - cp.y;
        const theta = Math.atan2(dy, dx);
        hout.internal.setTheta(theta);
        this.enforceLinearSplineConstraint(cpAfter, true);
      }
    }
  }

  // ───── SETTERS ─────
  setName(name: string): void {
    this._name = name;
  }

  setColor(color: Color): void {
    this._color = color;
  }

  setInterpolationType(type: InterpolationType): void {
    this._interpolationType = type;
  }

  setIsVisible(isVisible: boolean): void {
    this._isVisible = isVisible;
  }

  setIsLocked(isLocked: boolean): void {
    this._isLocked = isLocked;
  }
}
