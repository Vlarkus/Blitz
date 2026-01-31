import React from "react";
import { useDataStore } from "../../../../../models/dataStore";
import { EditableLabel } from "../../../../common/editable-label";
import "./helper-point-info.scss";
import RadioButtonGroup from "./coord-mode-radio-selector/coord-mode-radio-selector";
import CoordLabel from "./coord-label/coord-label";
import { polarToCartesian } from "../../../../../utils/utils";
import {
  angleToRadians,
  distanceToMeters,
  metersToDistance,
  radiansToAngle,
} from "../../../../../utils/unit-conversion";
import { useEditorStore } from "../../../../../editor/editor-store";

type CoordMode = "polar" | "relative" | "absolute";

export default function HelperPointInfo() {
  const selectedTrajectoryId = useDataStore((s) => s.selectedTrajectoryId);
  const selectedControlPointId = useDataStore((s) => s.selectedControlPointId);
  const hasSel = !!(selectedTrajectoryId && selectedControlPointId);
  const distanceUnit = useEditorStore((s) => s.canvasConfig.units.distance);
  const angleUnit = useEditorStore((s) => s.canvasConfig.units.angle);

  // ---- Subscribe to primitives only (avoid new object snapshots) ----
  const baseX = useDataStore((s) =>
    hasSel
      ? s.getControlPoint(selectedTrajectoryId!, selectedControlPointId!)?.x ??
        0
      : 0
  );
  const baseY = useDataStore((s) =>
    hasSel
      ? s.getControlPoint(selectedTrajectoryId!, selectedControlPointId!)?.y ??
        0
      : 0
  );

  const rIn = useDataStore((s) =>
    hasSel
      ? s.getHandlePolar(selectedTrajectoryId!, selectedControlPointId!, "in")
          ?.r ?? 0
      : 0
  );

  const thIn = useDataStore((s) =>
    hasSel
      ? s.getHandlePolar(selectedTrajectoryId!, selectedControlPointId!, "in")
          ?.theta ?? 0
      : 0
  );

  const rOut = useDataStore((s) =>
    hasSel
      ? s.getHandlePolar(selectedTrajectoryId!, selectedControlPointId!, "out")
          ?.r ?? 0
      : 0
  );

  const thOut = useDataStore((s) =>
    hasSel
      ? s.getHandlePolar(
          selectedTrajectoryId!,
          selectedControlPointId!,
          "out"
        )?.theta ?? 0
      : 0
  );

  const xInAbs = useDataStore((s) =>
    hasSel
      ? s.getHandlePosition(
          selectedTrajectoryId!,
          selectedControlPointId!,
          "in"
        )?.x ?? baseX
      : 0
  );
  const yInAbs = useDataStore((s) =>
    hasSel
      ? s.getHandlePosition(
          selectedTrajectoryId!,
          selectedControlPointId!,
          "in"
        )?.y ?? baseY
      : 0
  );
  const xOutAbs = useDataStore((s) =>
    hasSel
      ? s.getHandlePosition(
          selectedTrajectoryId!,
          selectedControlPointId!,
          "out"
        )?.x ?? baseX
      : 0
  );
  const yOutAbs = useDataStore((s) =>
    hasSel
      ? s.getHandlePosition(
          selectedTrajectoryId!,
          selectedControlPointId!,
          "out"
        )?.y ?? baseY
      : 0
  );

  // setters (stable)
  const setHandlePosition = useDataStore((s) => s.setHandlePosition);
  const execute = useDataStore((s) => s.execute);

  // UI mode
  const [coordMode, setCoordMode] = React.useState<CoordMode>("polar");
  const handleModeChange = React.useCallback((v: string) => {
    setCoordMode(v as CoordMode);
  }, []);

  // ---- Derived (dx, dy) from polar (computed locally; primitives as deps) ----
  const { x: dxIn, y: dyIn } = React.useMemo(
    () => polarToCartesian(rIn, thIn),
    [rIn, thIn]
  );
  const { x: dxOut, y: dyOut } = React.useMemo(
    () => polarToCartesian(rOut, thOut),
    [rOut, thOut]
  );

  // ---- Get current value for display (returns primitive only) ----
  const getHandleValue = (
    which: "in" | "out",
    part: "primary" | "secondary",
    mode: CoordMode
  ): number => {
    if (!hasSel) return 0;

    const r = which === "in" ? rIn : rOut;
    const th = which === "in" ? thIn : thOut;
    const dx = which === "in" ? dxIn : dxOut;
    const dy = which === "in" ? dyIn : dyOut;

    if (mode === "polar") {
      return part === "primary"
        ? metersToDistance(r, distanceUnit)
        : radiansToAngle(th, angleUnit);
    }
    if (mode === "relative") {
      return part === "primary"
        ? metersToDistance(dx, distanceUnit)
        : metersToDistance(dy, distanceUnit);
    }
    // absolute
    return part === "primary"
      ? metersToDistance(which === "in" ? baseX + dxIn : baseX + dxOut, distanceUnit)
      : metersToDistance(which === "in" ? baseY + dyIn : baseY + dyOut, distanceUnit);
  };

  // ---- Write updates back via store (no objects returned) ----
  const setHandleValueFn = (
    which: "in" | "out",
    part: "primary" | "secondary",
    mode: CoordMode,
    val: number
  ) => {
    if (!hasSel) return;
    const trajId = selectedTrajectoryId!;
    const cpId = selectedControlPointId!;

    if (mode === "polar") {
      // UI shows the selected angle unit; convert to radians before sending.
      const curR = which === "in" ? rIn : rOut;
      const curTheta = which === "in" ? thIn : thOut;
      const r = part === "primary" ? distanceToMeters(val, distanceUnit) : curR;
      const theta = angleToRadians(
        part === "secondary" ? val : curTheta,
        angleUnit
      );
      const prevPos = {
        type: "polar" as const,
        r: curR,
        theta: curTheta,
      };
      execute({
        redo: () => {
          setHandlePosition(trajId, cpId, which, { type: "polar", r, theta });
        },
        undo: () => {
          setHandlePosition(trajId, cpId, which, prevPos);
        },
      });
      return;
    }

    if (mode === "relative") {
      // dx/dy relative to CP
      const curDx = which === "in" ? dxIn : dxOut;
      const curDy = which === "in" ? dyIn : dyOut;
      const dx =
        part === "primary" ? distanceToMeters(val, distanceUnit) : curDx;
      const dy =
        part === "secondary" ? distanceToMeters(val, distanceUnit) : curDy;
      const prevPos = { type: "relative" as const, dx: curDx, dy: curDy };
      execute({
        redo: () => {
          setHandlePosition(trajId, cpId, which, { type: "relative", dx, dy });
        },
        undo: () => {
          setHandlePosition(trajId, cpId, which, prevPos);
        },
      });
      return;
    }

    // absolute
    const curX = which === "in" ? xInAbs : xOutAbs;
    const curY = which === "in" ? yInAbs : yOutAbs;
    const x =
      part === "primary" ? distanceToMeters(val, distanceUnit) : curX;
    const y =
      part === "secondary" ? distanceToMeters(val, distanceUnit) : curY;
    const prevPos = { type: "absolute" as const, x: curX, y: curY };
    execute({
      redo: () => {
        setHandlePosition(trajId, cpId, which, { type: "absolute", x, y });
      },
      undo: () => {
        setHandlePosition(trajId, cpId, which, prevPos);
      },
    });
  };

  return (
    <div className="helper-point-info">
      <RadioButtonGroup
        name="demo"
        options={[
          { label: "Polar", value: "polar" },
          { label: "Relative", value: "relative" },
          { label: "Absolute", value: "absolute" },
        ]}
        value={coordMode}
        onChange={handleModeChange}
      />

      {/* Handle In */}
      <div className="hp-selector-wrapper">
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{ polar: "r:", relative: "dx:", absolute: "x:" }}
          />
          {selectedControlPointId ? (
            <EditableLabel<number>
              inputRules={{ type: "number" }}
              maxIntegerDigits={4}
              maxDecimalDigits={3}
              value={getHandleValue("in", "primary", coordMode)}
              onCommit={(v: number) =>
                setHandleValueFn("in", "primary", coordMode, v)
              }
            />
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{ polar: "ϑ:", relative: "dy:", absolute: "y:" }}
          />
          {selectedControlPointId ? (
            <EditableLabel<number>
              inputRules={{ type: "number", decimals: 3, allowNegative: true }}
              value={getHandleValue("in", "secondary", coordMode)}
              maxIntegerDigits={4}
              maxDecimalDigits={3}
              onCommit={(v: number) =>
                setHandleValueFn("in", "secondary", coordMode, v)
              }
            />
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
      </div>

      {/* Handle Out */}
      <div className="hp-selector-wrapper">
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{ polar: "r:", relative: "dx:", absolute: "x:" }}
          />
          {selectedControlPointId ? (
            <EditableLabel<number>
              inputRules={{ type: "number" }}
              value={getHandleValue("out", "primary", coordMode)}
              maxIntegerDigits={4}
              maxDecimalDigits={3}
              onCommit={(v: number) =>
                setHandleValueFn("out", "primary", coordMode, v)
              }
            />
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
        <div className="half-width">
          <CoordLabel
            coordMode={coordMode}
            selectedControlPointId={selectedControlPointId}
            labelMap={{ polar: "ϑ:", relative: "dy:", absolute: "y:" }}
          />
          {selectedControlPointId ? (
            <EditableLabel<number>
              inputRules={{ type: "number", decimals: 3, allowNegative: true }}
              value={getHandleValue("out", "secondary", coordMode)}
              maxIntegerDigits={4}
              maxDecimalDigits={3}
              onCommit={(v: number) =>
                setHandleValueFn("out", "secondary", coordMode, v)
              }
            />
          ) : (
            <label className="disabled-element">-</label>
          )}
        </div>
      </div>
    </div>
  );
}
