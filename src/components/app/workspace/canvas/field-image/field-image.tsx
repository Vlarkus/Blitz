import React, { useMemo } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import {
  useEditorStore,
  useFieldStore,
} from "../../../../../editor/editor-store";

/**
 * Renders the currently selected field background image
 * underneath all trajectories.
 */
export default function FieldImage() {
  const selectedField = useFieldStore((s) => s.selectedField);
  const activeViewport = useEditorStore((s) => s.activeViewport);

  // Select field image source based on state
  const fieldSrc = useMemo(() => {
    switch (selectedField) {
      case "FTC_DECODE":
        return "/assets/fields/ftc/decode/ftc-decode.jpg";
      case "VEX_PUSHBACK":
        return "/assets/fields/vex/pushback/vex-pushback.png";
      case "VEX_HIGHSTAKES":
        return "/assets/fields/vex/highstakes/vex-highstakes.png";
      case "CUSTOM":
        return "/assets/fields/custom/custom_field.png";
      default:
        return null;
    }
  }, [selectedField]);

  const [image] = useImage(fieldSrc ?? "");

  if (!fieldSrc || !image) return null;

  // World-to-screen scaling — adjust as needed for your field units
  const FIELD_SIZE_METERS = 3.66; // FTC field size

  return (
    <KonvaImage
      image={image}
      x={-FIELD_SIZE_METERS / 2}
      y={-FIELD_SIZE_METERS / 2}
      width={FIELD_SIZE_METERS}
      height={FIELD_SIZE_METERS}
      listening={false}
    />
  );
}
