import type {
  AngleUnit,
  BuiltInDistanceUnit,
  CanvasConfig,
  DistanceUnit,
} from "../editor/editor-store.interface";

const DISTANCE_TO_METERS: Record<BuiltInDistanceUnit, number> = {
  METERS: 1,
  INCHES: 0.0254,
  FEET: 0.3048,
};

const ANGLE_TO_RADIANS: Record<AngleUnit, number> = {
  RADIANS: 1,
  DEGREES: Math.PI / 180,
  ROTATIONS: Math.PI * 2,
};

function getDistanceUnitScaleToMeters(
  unit: DistanceUnit,
  unitsConfig?: CanvasConfig["units"],
): number {
  if (unit !== "CUSTOM") return DISTANCE_TO_METERS[unit];
  const custom = unitsConfig?.customDistance;
  const factor =
    custom && Number.isFinite(custom.factor) && custom.factor > 0
      ? custom.factor
      : 1;
  const baseUnit = custom?.baseUnit ?? "METERS";
  return factor * DISTANCE_TO_METERS[baseUnit];
}

export function metersToDistance(
  valueM: number,
  unit: DistanceUnit,
  unitsConfig?: CanvasConfig["units"],
): number {
  return valueM / getDistanceUnitScaleToMeters(unit, unitsConfig);
}

export function distanceToMeters(
  value: number,
  unit: DistanceUnit,
  unitsConfig?: CanvasConfig["units"],
): number {
  return value * getDistanceUnitScaleToMeters(unit, unitsConfig);
}

export function radiansToAngle(valueRad: number, unit: AngleUnit): number {
  return valueRad / ANGLE_TO_RADIANS[unit];
}

export function angleToRadians(value: number, unit: AngleUnit): number {
  return value * ANGLE_TO_RADIANS[unit];
}
