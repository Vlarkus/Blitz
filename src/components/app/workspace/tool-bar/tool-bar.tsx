// components/app/tool-bar/tool-bar.tsx
import "./tool-bar.scss";
import ToolButton from "./tool-button/tool-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Tool } from "../../../../types/types";

import {
  faArrowPointer,
  faCirclePlus,
  faCircleMinus,
  faArrowTurnDown,
  faScissors,
  faObjectGroup,
  faPlayCircle,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { useEditorStore } from "../../../../editor/editor-store";

const toolIcons: Record<Tool, IconDefinition> = {
  select: faArrowPointer, // more modern pointer icon
  add: faCirclePlus, // add circle icon
  remove: faCircleMinus, // remove circle icon
  insert: faArrowTurnDown, // insert / down-turn arrow
  cut: faScissors, // cut
  merge: faObjectGroup, // merge/group icon
  simulate: faPlayCircle, // simulate/play
};

export default function ToolBar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);

  return (
    <div className="tool-bar">
      {Object.keys(toolIcons).map((tool) => (
        <ToolButton
          key={tool}
          isActive={activeTool === tool}
          onClick={() => setActiveTool(tool as Tool)}
        >
          <FontAwesomeIcon icon={toolIcons[tool as Tool]} />
        </ToolButton>
      ))}
    </div>
  );
}
