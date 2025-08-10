export interface HelperPointInternalAPI {
  setR(r: number): void;
  setTheta(theta: number): void;
  setPosition(r: number, theta: number): void;
  offsetR(offset: number): void;
  offsetTheta(offset: number): void;
  offsetPosition(offsetR: number, offsetTheta: number): void;
  setIsLinear(isLinear: boolean): void;
}
