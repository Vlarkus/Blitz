import { generateId } from "../../../utils/utils";
import type { HelperPointInternalAPI } from "./iHelperPoint";

export class HelperPoint {
  private static readonly MIN_R = 1e-4;

  private readonly _id: string;
  private _r: number; // meters
  private _theta: number; // radians
  private _isLinear: boolean;

  /** Non-enumerable internal mutator facade (bound in constructor). */
  public readonly internal!: HelperPointInternalAPI;

  constructor(r: number, theta: number, isLinear: boolean = false) {
    this._id = generateId();
    this._r = this.clampR(r);
    this._theta = this.normTheta(theta);
    this._isLinear = isLinear;

    Object.defineProperty(this, "internal", {
      value: {
        setR: (val: number) => this.setR(val),
        setTheta: (ang: number) => this.setTheta(ang),
        setPosition: (valR: number, valTheta: number) =>
          this.setPosition(valR, valTheta),
        offsetR: (offset: number) => this.offsetR(offset),
        offsetTheta: (offset: number) => this.offsetTheta(offset),
        offsetPosition: (dR: number, dTheta: number) =>
          this.offsetPosition(dR, dTheta),
        setIsLinear: (flag: boolean) => this.setIsLinear(flag),
      } as HelperPointInternalAPI,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }

  // Getters
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
  get isLinear(): boolean {
    return this._isLinear;
  }

  // Private mutators
  private setR(r: number): void {
    this._r = this.clampR(r);
  }
  private setTheta(theta: number): void {
    this._theta = this.normTheta(theta);
  }
  private setPosition(r: number, theta: number): void {
    this._r = this.clampR(r);
    this._theta = this.normTheta(theta);
  }
  private offsetR(offset: number): void {
    this._r = this.clampR(this._r + offset);
  }
  private offsetTheta(offset: number): void {
    this._theta = this.normTheta(this._theta + offset);
  }
  private offsetPosition(dR: number, dTheta: number): void {
    this._r = this.clampR(this._r + dR);
    this._theta = this.normTheta(this._theta + dTheta);
  }
  private setIsLinear(isLinear: boolean): void {
    this._isLinear = isLinear;
  }

  // Utilities
  private clampR(r: number): number {
    if (!Number.isFinite(r)) return HelperPoint.MIN_R;
    return Math.max(r, HelperPoint.MIN_R);
  }
  private normTheta(theta: number): number {
    if (!Number.isFinite(theta)) return 0;
    return Math.atan2(Math.sin(theta), Math.cos(theta));
  }
}
