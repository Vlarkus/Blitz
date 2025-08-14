interface Props {
  coordMode: string;
  selectedControlPointId: string | null;
  labelMap: Record<string, string>; // e.g. { polar: "r:", relative: "dx:", absolute: "x:" }
}

export default function CoordLabel({
  coordMode,
  selectedControlPointId,
  labelMap,
}: Props) {
  const modes = Object.keys(labelMap);
  const defaultLabel = labelMap[modes[modes.length - 1]]; // last one is default
  const labelText = labelMap[coordMode] ?? defaultLabel;

  return (
    <label
      className={selectedControlPointId ? "active-element" : "disabled-element"}
    >
      {labelText}
    </label>
  );
}
