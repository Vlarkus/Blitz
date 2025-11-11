import type { SplineType, SymmetryType } from "../../../types/types";
import { assertNumber, generateId, sanitizeName } from "../../../utils/utils";
import { HelperPoint } from "../helper-point/helperPoint";
import type { ControlPointInternalAPI } from "./control-point.interface";

export class ControlPoint {
  private static readonly DEFAULT_HANDLE_IN_R = 10;
  private static readonly DEFAULT_HANDLE_IN_THETA = -Math.PI / 2;
  private static readonly DEFAULT_HANDLE_OUT_R = 10;
  private static readonly DEFAULT_HANDLE_OUT_THETA = Math.PI / 2;

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
  private _isEvent: boolean;

  public readonly internal!: ControlPointInternalAPI;

  // --- Overloaded constructors ---
  constructor(
    name: string,
    x: number,
    y: number,
    heading?: number | null,
    splineType?: SplineType,
    symmetry?: SymmetryType,
    handleIn?: HelperPoint,
    handleOut?: HelperPoint,
    isLocked?: boolean,
    isEvent?: boolean
  );
  constructor(obj: {
    _name?: string;
    _x?: number;
    _y?: number;
    _heading?: number | null;
    _splineType?: SplineType;
    _symmetry?: SymmetryType;
    _handleIn?: { _r: number; _theta: number; _isLinear?: boolean };
    _handleOut?: { _r: number; _theta: number; _isLinear?: boolean };
    _isLocked?: boolean;
    _isEvent?: boolean;
  });

  // --- Implementation ---
  constructor(
    arg1:
      | string
      | {
          _name?: string;
          _x?: number;
          _y?: number;
          _heading?: number | null;
          _splineType?: SplineType;
          _symmetry?: SymmetryType;
          _handleIn?: { _r: number; _theta: number; _isLinear?: boolean };
          _handleOut?: { _r: number; _theta: number; _isLinear?: boolean };
          _isLocked?: boolean;
          _isEvent?: boolean;
        },
    x?: number,
    y?: number,
    heading: number | null = null,
    splineType: SplineType = "BEZIER",
    symmetry: SymmetryType = "ALIGNED",
    handleIn: HelperPoint = new HelperPoint(
      ControlPoint.DEFAULT_HANDLE_IN_R,
      ControlPoint.DEFAULT_HANDLE_IN_THETA
    ),
    handleOut: HelperPoint = new HelperPoint(
      ControlPoint.DEFAULT_HANDLE_OUT_R,
      ControlPoint.DEFAULT_HANDLE_OUT_THETA
    ),
    isLocked: boolean = false,
    isEvent: boolean = false
  ) {
    this._id = generateId();

    if (typeof arg1 === "object" && arg1 !== null) {
      const obj = arg1;

      // Use underscored keys only
      this._name = sanitizeName(obj._name ?? "Control Point");
      this._x = assertNumber(obj._x ?? 0, "x");
      this._y = assertNumber(obj._y ?? 0, "y");
      this._heading = obj._heading ?? null;
      this._splineType = obj._splineType ?? "BEZIER";
      this._symmetry = obj._symmetry ?? "ALIGNED";

      // Helper points
      this._handleIn = obj._handleIn
        ? new HelperPoint(
            obj._handleIn._r,
            obj._handleIn._theta,
            obj._handleIn._isLinear ?? false
          )
        : new HelperPoint(
            ControlPoint.DEFAULT_HANDLE_IN_R,
            ControlPoint.DEFAULT_HANDLE_IN_THETA
          );

      this._handleOut = obj._handleOut
        ? new HelperPoint(
            obj._handleOut._r,
            obj._handleOut._theta,
            obj._handleOut._isLinear ?? false
          )
        : new HelperPoint(
            ControlPoint.DEFAULT_HANDLE_OUT_R,
            ControlPoint.DEFAULT_HANDLE_OUT_THETA
          );

      this._isLocked = obj._isLocked ?? false;
      this._isEvent = obj._isEvent ?? false;
    } else {
      // Standard creation path
      this._name = sanitizeName(arg1);
      this._x = assertNumber(x!, "x");
      this._y = assertNumber(y!, "y");
      this._heading = heading;
      this._splineType = splineType;
      this._symmetry = symmetry;
      this._handleIn = handleIn;
      this._handleOut = handleOut;
      this._isLocked = isLocked;
      this._isEvent = isEvent;
    }

    Object.defineProperty(this, "internal", {
      value: {
        setName: (n: string) => this.setName(n),
        setX: (val: number) => this.setX(val),
        setY: (val: number) => this.setY(val),
        setPosition: (nx: number, ny: number) => this.setPosition(nx, ny),
        offsetX: (dx: number) => this.offsetX(dx),
        offsetY: (dy: number) => this.offsetY(dy),
        offsetPosition: (dx: number, dy: number) => this.offsetPosition(dx, dy),
        setHeading: (hdg: number | null) => this.setHeading(hdg),
        setSplineType: (st: SplineType) => this.setSplineType(st),
        setSymmetry: (sym: SymmetryType) => this.setSymmetry(sym),
        setHandleIn: (h: HelperPoint) => this.setHandleIn(h),
        setHandleOut: (h: HelperPoint) => this.setHandleOut(h),
        setIsLocked: (flag: boolean) => this.setIsLocked(flag),
        setIsEvent: (flag: boolean) => this.setIsEvent(flag),
      } as ControlPointInternalAPI,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }

  // Getters
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
  get isEvent(): boolean {
    return this._isEvent;
  }

  // Private mutators
  private setName(name: string): void {
    this._name = sanitizeName(name);
  }
  private setX(x: number): void {
    this._x = assertNumber(x, "x");
  }
  private setY(y: number): void {
    this._y = assertNumber(y, "y");
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
  private setIsEvent(isEvent: boolean): void {
    this._isEvent = isEvent;
  }
}
