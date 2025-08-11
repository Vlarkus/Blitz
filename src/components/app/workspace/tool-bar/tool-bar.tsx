// components/app/tool-bar/tool-bar.tsx
import "./tool-bar.scss";
import ToolButton from "./tool-button/tool-button";
import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

const toolIcons: Record<Tool, any> = {
  select: faArrowPointer, // more modern pointer icon
  add: faCirclePlus, // add circle icon
  remove: faCircleMinus, // remove circle icon
  insert: faArrowTurnDown, // insert / down-turn arrow
  cut: faScissors, // cut
  merge: faObjectGroup, // merge/group icon
  simulate: faPlayCircle, // simulate/play
};

export default function ToolBar() {
  const [activeTool, setActiveTool] = useState<Tool>("select");

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
