import { v4 as uuid } from "uuid";

// ───── INTERNAL API ─────
export interface HelperPointInternalAPI {
  setR(r: number): void;
  setTheta(theta: number): void;
  setPosition(r: number, theta: number): void;
  offsetR(offset: number): void;
  offsetTheta(offset: number): void;
  offsetPosition(offsetR: number, offsetTheta: number): void;
  setIsPriority(isPriority: boolean): void;
}

export class HelperPoint {
  // ───── PROPERTIES ─────
  private readonly _id: string;
  private _r: number;
  private _theta: number; // (rad)
  private _isPriority: boolean; // Tells whether this point is within a linear path. If true, should be hidden.

  // ───── CONSTRUCTOR ─────
  constructor(
    r: number,
    theta: number,
    isVisible: boolean = true,
    isPriority: boolean = false
  ) {
    this._id = uuid();
    this._r = r;
    this._theta = theta;
    this._isPriority = isPriority;
  }

  // ───── GETTERS ─────
  get id(): string {
    return this._id;
  }

  get r(): number {
    return this._r;
  }

  get theta(): number {
    return this._theta;
  }

  get position(): { r: number; theta: number } {
    return { r: this._r, theta: this._theta };
  }

  get isPriority(): boolean {
    return this._isPriority;
  }

  // ───── INTERNAL API ─────
  public readonly internal: HelperPointInternalAPI = {
    setR: (r: number) => {
      this._r = Math.max(r, 1e-4);
    },
    setTheta: (theta: number) => {
      this._theta = theta;
    },
    setPosition: (r: number, theta: number) => {
      this._r = r;
      this._theta = theta;
    },
    offsetR: (offset: number) => {
      this._r += offset;
    },
    offsetTheta: (offset: number) => {
      this._theta += offset;
    },
    offsetPosition: (dr: number, dt: number) => {
      this._r += dr;
      this._theta += dt;
    },

    setIsPriority: (isPriority: boolean) => {
      this._isPriority = isPriority;
    },
  };
}
