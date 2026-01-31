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
  faGear,
  faArrowsLeftRight,
  faArrowsUpDown,
  faRotateRight,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useEditorStore } from "../../../../editor/editor-store";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useState } from "react";
import SettingsOverlay from "../status-bar/settings-overlay";
import { useDataStore } from "../../../../models/dataStore";

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
  const [showSettings, setShowSettings] = useState(false);
  const selectedControlPointIds = useDataStore(
    (s) => s.selectedControlPointIds
  );
  const trajectories = useDataStore((s) => s.trajectories);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const setControlPointHeading = useDataStore((s) => s.setControlPointHeading);
  const setHandlePosition = useDataStore((s) => s.setHandlePosition);
  const execute = useDataStore((s) => s.execute);

  const actionsEnabled = selectedControlPointIds.length > 1;

  const normalizeRad = (theta: number) =>
    Math.atan2(Math.sin(theta), Math.cos(theta));

  const applyTransform = (
    kind: "mirror-x" | "mirror-y" | "rotate-cw" | "rotate-ccw"
  ) => {
    if (!actionsEnabled) return;

    const selected: {
      trajId: string;
      cpId: string;
      x: number;
      y: number;
      heading: number | null;
      inAbs: { x: number; y: number };
      outAbs: { x: number; y: number };
    }[] = [];
    trajectories.forEach((traj) => {
      traj.controlPoints.forEach((cp) => {
        if (selectedControlPointIds.includes(cp.id)) {
          const inAbs = {
            x: cp.x + cp.handleIn.r * Math.cos(cp.handleIn.theta),
            y: cp.y + cp.handleIn.r * Math.sin(cp.handleIn.theta),
          };
          const outAbs = {
            x: cp.x + cp.handleOut.r * Math.cos(cp.handleOut.theta),
            y: cp.y + cp.handleOut.r * Math.sin(cp.handleOut.theta),
          };
          selected.push({
            trajId: traj.id,
            cpId: cp.id,
            x: cp.x,
            y: cp.y,
            heading: cp.heading,
            inAbs,
            outAbs,
          });
        }
      });
    });

    if (selected.length < 2) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    selected.forEach((cp) => {
      if (cp.x < minX) minX = cp.x;
      if (cp.x > maxX) maxX = cp.x;
      if (cp.y < minY) minY = cp.y;
      if (cp.y > maxY) maxY = cp.y;
    });
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const transformPoint = (x: number, y: number) => {
      const dx = x - cx;
      const dy = y - cy;
      switch (kind) {
        case "mirror-x":
          return { x: cx - dx, y };
        case "mirror-y":
          return { x, y: cy - dy };
        case "rotate-cw":
          return { x: cx + dy, y: cy - dx };
        case "rotate-ccw":
          return { x: cx - dy, y: cy + dx };
      }
    };

    const transformHeading = (heading: number) => {
      switch (kind) {
        case "mirror-x":
          return normalizeRad(Math.PI - heading);
        case "mirror-y":
          return normalizeRad(-heading);
        case "rotate-cw":
          return normalizeRad(heading - Math.PI / 2);
        case "rotate-ccw":
          return normalizeRad(heading + Math.PI / 2);
      }
    };

    const next = selected.map((cp) => {
      const nextPos = transformPoint(cp.x, cp.y);
      const nextIn = transformPoint(cp.inAbs.x, cp.inAbs.y);
      const nextOut = transformPoint(cp.outAbs.x, cp.outAbs.y);
      return {
        ...cp,
        x: nextPos.x,
        y: nextPos.y,
        heading: cp.heading !== null ? transformHeading(cp.heading) : null,
        inAbs: nextIn,
        outAbs: nextOut,
      };
    });

    execute({
      redo: () => {
        next.forEach((cp) => {
          moveControlPoint(cp.trajId, cp.cpId, cp.x, cp.y);
        });
        next.forEach((cp) => {
          setHandlePosition(cp.trajId, cp.cpId, "in", {
            type: "absolute",
            x: cp.inAbs.x,
            y: cp.inAbs.y,
          });
          setHandlePosition(cp.trajId, cp.cpId, "out", {
            type: "absolute",
            x: cp.outAbs.x,
            y: cp.outAbs.y,
          });
          if (cp.heading !== null) {
            setControlPointHeading(cp.trajId, cp.cpId, cp.heading);
          }
        });
      },
      undo: () => {
        selected.forEach((cp) => {
          moveControlPoint(cp.trajId, cp.cpId, cp.x, cp.y);
        });
        selected.forEach((cp) => {
          setHandlePosition(cp.trajId, cp.cpId, "in", {
            type: "absolute",
            x: cp.inAbs.x,
            y: cp.inAbs.y,
          });
          setHandlePosition(cp.trajId, cp.cpId, "out", {
            type: "absolute",
            x: cp.outAbs.x,
            y: cp.outAbs.y,
          });
          if (cp.heading !== null) {
            setControlPointHeading(cp.trajId, cp.cpId, cp.heading);
          }
        });
      },
    });
  };

  return (
    <>
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
        <div className="tool-bar-spacer" />
        <div className="tool-bar-actions">
          <button
            className="tool-bar-action-btn"
            onClick={() => applyTransform("rotate-ccw")}
            title="Rotate 90° CCW"
            disabled={!actionsEnabled}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
          <button
            className="tool-bar-action-btn"
            onClick={() => applyTransform("rotate-cw")}
            title="Rotate 90° CW"
            disabled={!actionsEnabled}
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
          <button
            className="tool-bar-action-btn"
            onClick={() => applyTransform("mirror-y")}
            title="Mirror Vertically"
            disabled={!actionsEnabled}
          >
            <FontAwesomeIcon icon={faArrowsUpDown} />
          </button>
          <button
            className="tool-bar-action-btn"
            onClick={() => applyTransform("mirror-x")}
            title="Mirror Horizontally"
            disabled={!actionsEnabled}
          >
            <FontAwesomeIcon icon={faArrowsLeftRight} />
          </button>
        </div>
        <div className="tool-bar-divider" />
        <button
          className="tool-bar-settings-btn"
          onClick={() => setShowSettings(true)}
          title="Canvas Settings"
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
      {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
    </>
  );
}
