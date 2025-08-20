export type HitKind = "empty" | "trajectory" | "control-point" | "handle";

export function parseName(name?: string) {
  if (!name) return { kind: "empty" as HitKind };
  const [kind, a, b, c] = name.split(":");
  if (kind === "cp")
    return { kind: "control-point" as HitKind, trajId: a, cpId: b };
  if (kind === "trajectory")
    return { kind: "trajectory" as HitKind, trajId: a };
  if (kind === "handle")
    return {
      kind: "handle" as HitKind,
      trajId: a,
      cpId: b,
      which: c as "in" | "out",
    };
  return { kind: "empty" as HitKind };
}
