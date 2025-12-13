import { useMemo } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import {
  // useEditorStore,
  useFieldStore,
  // type FieldType,
} from "../../../../../editor/editor-store";

/**
 * Renders the currently selected field background image
 * underneath all trajectories.
 */
export default function FieldImage() {
  const selectedField = useFieldStore((s) => s.selectedField);
  // const activeViewport = useEditorStore((s) => s.activeViewport);

  // Select field image source based on state
  const fieldSrc = useMemo(() => {
    switch (selectedField) {
      case "FTC_DECODE":
        return "/assets/fields/ftc/decode/ftc-decode.jpg";
      case "V5RC_PUSHBACK_MATCH":
        return "/assets/fields/vex/v5/pushover/V5RC-PushBack-H2H-TopDownHighlighted-TileColor66_71@0.1+2000px.png";
      case "V5RC_PUSHBACK_SKILLS":
        return "/assets/fields/vex/v5/pushover/V5RC-PushBack-Skills-TopDownHighlighted-TileColor66_71@0.1+2000px.png";
      case "VURC_PUSHBACK":
        return "/assets/fields/vex/u/pushover/VURC-PushBack-H2H-TopDownHighlighted-TileColor66_71@0.1+2000px.png";
      case "12X12_EMPTY":
        return "/assets/fields/other/V5RC-FieldPerimeter-12ft12ft-TopDown-TileColor66_71@1.0.png";
      case "NONE":
        return null;
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
