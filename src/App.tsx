import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import React, { useState } from "react";
import {
  EditableLabel,
  type InputRules,
} from "./components/common/editableLabel";

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
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>EditableLabel Test</h2>

      <div>
        <strong>Name: </strong>
        <EditableLabel
          value={trajName}
          onCommit={(val) => setTrajName(val)}
          inputRules={textRules}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <strong>Position X: </strong>
        <EditableLabel
          value={posX}
          onCommit={(val) => setPosX(val)}
          inputRules={numberRulesPosX}
          className="test"
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <strong>Heading θ: </strong>
        <EditableLabel
          value={theta}
          onCommit={(val) => setTheta(val)}
          inputRules={numberRulesTheta}
        />
      </div>
    </div>
  );
}
