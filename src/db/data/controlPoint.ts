import type { SplineType, SymmetryType } from "../../types/types";
import { v4 as uuid } from "uuid";
import { HelperPoint } from "./helperPoint";
import type { HelperPointInternalAPI } from "./helperPoint";

// ───── INTERNAL API ─────
export interface ControlPointInternalAPI {
  setName(name: string): void;
  setX(x: number): void;
  setY(y: number): void;
  setPosition(x: number, y: number): void;
  offsetX(offset: number): void;
  offsetY(offset: number): void;
  offsetPosition(offsetX: number, offsetY: number): void;
  setHeading(heading: number | null): void;
  setSplineType(splineType: SplineType): void;
  setSymmetry(symmetry: SymmetryType): void;
  setHandleIn(handle: HelperPoint): void;
  setHandleOut(handle: HelperPoint): void;
  setIsLocked(isLocked: boolean): void;
  setIsVisible(isVisible: boolean): void;
}

export class ControlPoint {
  // ───── CONSTANTS ─────
  private static readonly DEFAULT_HANDLE_OFFSET_X = 20;
  private static readonly DEFAULT_HANDLE_OFFSET_Y = 0;

  // ───── PROPERTIES ─────
  private readonly _id: string;
  private _name: string;
  private _x: number;
  private _y: number;
  private _heading: number | null;
  private _splineType: SplineType;
  private _symmetry: SymmetryType;
  private _handleIn: HelperPoint;
  private _handleOut: HelperPoint;
  private _isLocked: boolean;
  private _isVisible: boolean;

  // ───── CONSTRUCTOR ─────
  constructor(
    name: string = "Control Point",
    x: number,
    y: number,
    heading: number | null = null,
    splineType: SplineType = "BEZIER",
    symmetry: SymmetryType = "ALIGNED",
    handleIn: HelperPoint = new HelperPoint(
      x - ControlPoint.DEFAULT_HANDLE_OFFSET_X,
      y - ControlPoint.DEFAULT_HANDLE_OFFSET_Y
    ),
    handleOut: HelperPoint = new HelperPoint(
      x + ControlPoint.DEFAULT_HANDLE_OFFSET_X,
      y + ControlPoint.DEFAULT_HANDLE_OFFSET_Y
    ),
    isLocked: boolean = false,
    isVisible: boolean = true
  ) {
    this._id = uuid();
    this._name = name;
    this._x = x;
    this._y = y;
    this._heading = heading;
    this._splineType = splineType;
    this._symmetry = symmetry;
    this._handleIn = handleIn;
    this._handleOut = handleOut;
    this._isLocked = isLocked;
    this._isVisible = isVisible;
  }

  // ───── GETTERS ─────
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get position(): { x: number; y: number } {
    return { x: this._x, y: this._y };
  }

  get heading(): number | null {
    return this._heading;
  }

  get splineType(): SplineType {
    return this._splineType;
  }

  get symmetry(): SymmetryType {
    return this._symmetry;
  }

  get handleIn(): HelperPoint {
    return this._handleIn;
  }

  get handleOut(): HelperPoint {
    return this._handleOut;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  // ───── SETTERS ─────
  private setName(name: string): void {
    this._name = name;
  }

  private setX(x: number): void {
    this._x = x;
  }

  private setY(y: number): void {
    this._y = y;
  }

  private setPosition(x: number, y: number): void {
    this.setX(x);
    this.setY(y);
  }

  private offsetX(offset: number): void {
    this.setX(this._x + offset);
  }

  private offsetY(offset: number): void {
    this.setY(this._y + offset);
  }

  private offsetPosition(offsetX: number, offsetY: number): void {
    this.setPosition(this._x + offsetX, this._y + offsetY);
  }

  private setHeading(heading: number | null): void {
    this._heading = heading;
  }

  private setSplineType(splineType: SplineType): void {
    this._splineType = splineType;
  }

  private setSymmetry(symmetry: SymmetryType): void {
    this._symmetry = symmetry;
  }

  private setHandleIn(handle: HelperPoint): void {
    this._handleIn = handle;
  }

  private setHandleOut(handle: HelperPoint): void {
    this._handleOut = handle;
  }

  private setIsLocked(isLocked: boolean): void {
    this._isLocked = isLocked;
  }

  private setIsVisible(isVisible: boolean): void {
    this._isVisible = isVisible;
  }

  // ───── INTERNAL ─────
  public readonly internal: ControlPointInternalAPI = {
    setName: this.setName.bind(this),
    setX: this.setX.bind(this),
    setY: this.setY.bind(this),
    setPosition: this.setPosition.bind(this),
    offsetX: this.offsetX.bind(this),
    offsetY: this.offsetY.bind(this),
    offsetPosition: this.offsetPosition.bind(this),
    setHeading: this.setHeading.bind(this),
    setSplineType: this.setSplineType.bind(this),
    setSymmetry: this.setSymmetry.bind(this),
    setHandleIn: this.setHandleIn.bind(this),
    setHandleOut: this.setHandleOut.bind(this),
    setIsLocked: this.setIsLocked.bind(this),
    setIsVisible: this.setIsVisible.bind(this),
  };
}
