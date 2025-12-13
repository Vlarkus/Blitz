// components/app/tool-bar/tool-bar.tsx
import "./tool-bar.scss";
import ToolButton from "./tool-button/tool-button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Tool } from "../../../../types/types";

import {
  faArrowPointer,
  faCirclePlus,
  faCircleMinus,
  faChevronCircleDown,
  faScissors,
  faObjectGroup,
  faHand,
} from "@fortawesome/free-solid-svg-icons";
import { useEditorStore } from "../../../../editor/editor-store";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

const toolIcons: Record<Tool, IconProp> = {
  select: faArrowPointer, // more modern pointer icon
  add: faCirclePlus, // add circle icon
  remove: faCircleMinus, // remove circle icon
  insert: faChevronCircleDown, // insert / down-turn arrow
  cut: faScissors, // cut
  show_robot: faObjectGroup,
  pan: faHand, // pan/grab hand
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
