import "./menu.scss";
import AppIcon from "../../../assets/app-icon.svg";
import MenuPanel from "./menu-options/menu-panel";

export default function Menu() {
  return (
    <header className="menu" role="navigation" aria-label="Main Menu">
      <span className="menu-logo-wrapper">
        <img src={AppIcon} alt="Blitz Logo" className="menu-logo" />
      </span>
      <span className="menu-divider" />
      <nav
        className="menu-options-wrapper"
        role="menubar"
        aria-label="Application Menu"
      >
        <span className="menu-options">
          <MenuPanel buttonLabel="File">
            <button onClick={() => console.log("New File")}>New</button>
            <hr />
            <button onClick={() => console.log("Open File")}>Open…</button>
            <button onClick={() => console.log("Save File")}>Save</button>
          </MenuPanel>
        </span>
      </nav>
    </header>
  );
}
