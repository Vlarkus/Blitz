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
import MergeOverlay from "./merge-overlay";
import { useDataStore } from "../../../../models/dataStore";
import { CanvasCoordinateSystem } from "../canvas/canvas-coordinate-helper";

const toolIcons: Record<Tool, IconProp> = {
  select: faArrowPointer, // more modern pointer icon
  add: faCirclePlus, // add circle icon
  remove: faCircleMinus, // remove circle icon
  insert: faChevronCircleDown, // insert / down-turn arrow
  cut: faScissors, // cut
  pan: faHand, // pan/grab hand
};

export default function ToolBar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const [showSettings, setShowSettings] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const selectedControlPointIds = useDataStore(
    (s) => s.selectedControlPointIds
  );
  const trajectories = useDataStore((s) => s.trajectories);
  const moveControlPoint = useDataStore((s) => s.moveControlPoint);
  const setControlPointHeading = useDataStore((s) => s.setControlPointHeading);
  const setHandlePosition = useDataStore((s) => s.setHandlePosition);
  const execute = useDataStore((s) => s.execute);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const showRobot = useEditorStore((s) => s.showRobot);
  const setShowRobot = useEditorStore((s) => s.setShowRobot);

  const actionsEnabled = selectedControlPointIds.length > 1;

  const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;

  const applyTransform = (
    kind: "mirror-x" | "mirror-y" | "rotate-cw" | "rotate-ccw"
  ) => {
    if (!actionsEnabled) return;

    const coordSys = new CanvasCoordinateSystem(canvasConfig);

    const selected: {
      trajId: string;
      cpId: string;
      x: number;
      y: number;
      heading: number | null;
      inAbs: { x: number; y: number };
      outAbs: { x: number; y: number };
      canvasPos: { x: number; y: number };
      canvasIn: { x: number; y: number };
      canvasOut: { x: number; y: number };
      headingScreenDeg: number | null;
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
          const canvasPos = coordSys.fromUser(cp.x, cp.y);
          const canvasIn = coordSys.fromUser(inAbs.x, inAbs.y);
          const canvasOut = coordSys.fromUser(outAbs.x, outAbs.y);
          selected.push({
            trajId: traj.id,
            cpId: cp.id,
            x: cp.x,
            y: cp.y,
            heading: cp.heading,
            inAbs,
            outAbs,
            canvasPos,
            canvasIn,
            canvasOut,
            canvasIn,
            canvasOut,
            headingScreenDeg:
              cp.heading !== null ? coordSys.mapHeadingToScreen(cp.heading) : null,
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
      if (cp.canvasPos.x < minX) minX = cp.canvasPos.x;
      if (cp.canvasPos.x > maxX) maxX = cp.canvasPos.x;
      if (cp.canvasPos.y < minY) minY = cp.canvasPos.y;
      if (cp.canvasPos.y > maxY) maxY = cp.canvasPos.y;
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
          return { x: cx - dy, y: cy + dx };
        case "rotate-ccw":
          return { x: cx + dy, y: cy - dx };
      }
    };

    const transformHeading = (headingScreenDeg: number) => {
      switch (kind) {
        case "mirror-x":
          return normalizeDeg(180 - headingScreenDeg);
        case "mirror-y":
          return normalizeDeg(-headingScreenDeg);
        case "rotate-cw":
          return normalizeDeg(headingScreenDeg - 90);
        case "rotate-ccw":
          return normalizeDeg(headingScreenDeg + 90);
      }
    };

    const next = selected.map((cp) => {
      const nextPosCanvas = transformPoint(cp.canvasPos.x, cp.canvasPos.y);
      const nextInCanvas = transformPoint(cp.canvasIn.x, cp.canvasIn.y);
      const nextOutCanvas = transformPoint(cp.canvasOut.x, cp.canvasOut.y);
      const nextPos = coordSys.toUser(nextPosCanvas.x, nextPosCanvas.y);
      const nextIn = coordSys.toUser(nextInCanvas.x, nextInCanvas.y);
      const nextOut = coordSys.toUser(nextOutCanvas.x, nextOutCanvas.y);
      return {
        ...cp,
        x: nextPos.x,
        y: nextPos.y,
        heading:
          cp.headingScreenDeg !== null
            ? coordSys.mapHeadingFromScreen(
              transformHeading(cp.headingScreenDeg)
            )
            : null,
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
            className={`tool-bar-action-btn ${showMerge ? "active" : ""}`}
            onClick={() => setShowMerge(true)}
            title="Merge Trajectories"
            disabled={!actionsEnabled}
          >
            <FontAwesomeIcon icon={faObjectGroup} />
          </button>
          <button
            className={`tool-bar-action-btn ${showRobot ? "active" : ""}`}
            onClick={() => setShowRobot(!showRobot)}
            title="Toggle Robot Overlay"
          >
            <svg
              width="1.2em"
              height="1.2em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                strokeDasharray="4 4"
              />
              <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="currentColor"
                stroke="none"
              >
                R
              </text>
            </svg>
          </button>

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
      {showMerge && <MergeOverlay onClose={() => setShowMerge(false)} />}
    </>
  );
}
