import { v4 as uuid } from "uuid";
import type { ColorHex } from "../types/types";

export function getRandomColor(): ColorHex {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const hex = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}` as ColorHex;
  return hex;
}

export function generateId(): string {
  return uuid();
}

export function assertNumber(n: number, label: string): number {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`${label} must be a finite number`);
  }
  return n;
}
export function sanitizeName(name: string): string {
  if (typeof name !== "string") return "Control Point";
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Control Point";
}

export function mixColors(c1: string, c2: string, ratio: number): string {
  // ratio: 0 → c1, 1 → c2
  const hexToRgb = (hex: string) => {
    const num = parseInt(hex.slice(1), 16);
    return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;

  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return rgbToHex(r, g, b);
}

export function polarToCartesian(
  r: number,
  theta: number
): { x: number; y: number } {
  assertNumber(r, "radius");
  assertNumber(theta, "theta");
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}

export function cartesianToPolar(
  x: number,
  y: number
): { r: number; theta: number } {
  assertNumber(x, "x");
  assertNumber(y, "y");
  return {
    r: Math.sqrt(x * x + y * y),
    theta: Math.atan2(y, x),
  };
}
