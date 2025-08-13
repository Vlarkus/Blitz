import "./color-picker.scss";
import ColorOption from "./color-option/color-option";
import ColorInput from "./color-input/color-input";

export default function ColorPicker() {
  return (
    <div className="color-picker" role="group" aria-label="Color picker">
      <ColorOption
        color="#FF6900"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#FCB900"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#7BDCB5"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#00D084"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#8ED1FC"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#0693E3"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#ABB8C3"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#EB144C"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#F78DA7"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />
      <ColorOption
        color="#9900EF"
        onClick={(color) => console.log(`Selected color: ${color}`)}
      />

      <ColorInput
        value="#ff8800"
        onChange={(hex) => console.log(`Changed color to: ${hex}`)}
        className="color-input"
        disabled={false}
      />
    </div>
  );
}
