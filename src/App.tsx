import "./styles/app.scss";
import React, { useState } from "react";
import {
  EditableLabel,
  type InputRules,
} from "./components/common/editable-label";
import Menu from "./components/app/menu/menu";

export default function App() {
  return (
    <>
      <Menu />
    </>
  );
}
