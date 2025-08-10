import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/app.scss";
import React, { useState } from "react";
import {
  EditableLabel,
  type InputRules,
} from "./components/common/editable-label";

export default function App() {
  const [trajName, setTrajName] = useState("Trajectory 1");
  const [posX, setPosX] = useState(0.0);
  const [theta, setTheta] = useState(45);

  const textRules: InputRules = {
    type: "text",
    maxLength: 20,
    allowedChars: "A-Za-z0-9 _-",
  };

  const numberRulesPosX: InputRules = {
    type: "number",
    min: -100,
    max: 100,
    decimals: 3,
    allowNegative: true,
  };

  const numberRulesTheta: InputRules = {
    type: "number",
    min: 0,
    max: 360,
    decimals: 2,
    allowNegative: false,
  };

  return (
    <div>
      <div className="dev-util-red test"></div>
      <div className="dev-util-blue test"></div>
      <div className="dev-util-green test"></div>
      <div className="dev-util-yellow test"></div>
      <div className="dev-util-purple test"></div>
      <div className="dev-util-gray test"></div>
    </div>
  );
}
