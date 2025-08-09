import { v4 as uuid } from "uuid";
import type { ColorHex } from "../types/Types";

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
