import type { AngleUnit, DistanceUnit } from "../editor/editor-store.interface";

const DISTANCE_TO_METERS: Record<DistanceUnit, number> = {
  METERS: 1,
  INCHES: 0.0254,
  FEET: 0.3048,
};

const ANGLE_TO_RADIANS: Record<AngleUnit, number> = {
  RADIANS: 1,
  DEGREES: Math.PI / 180,
  ROTATIONS: Math.PI * 2,
};

export function metersToDistance(valueM: number, unit: DistanceUnit): number {
  return valueM / DISTANCE_TO_METERS[unit];
}

export function distanceToMeters(value: number, unit: DistanceUnit): number {
  return value * DISTANCE_TO_METERS[unit];
}

export function radiansToAngle(valueRad: number, unit: AngleUnit): number {
  return valueRad / ANGLE_TO_RADIANS[unit];
}

export function angleToRadians(value: number, unit: AngleUnit): number {
  return value * ANGLE_TO_RADIANS[unit];
}
