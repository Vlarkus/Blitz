import "./menu.scss";
import AppIcon from "../../../assets/app-icon.svg";
import MenuOptionFile from "./menu-options/menu-option-file";

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
          <MenuOptionFile />
          <MenuOptionFile />
          <MenuOptionFile />
        </span>
      </nav>
    </header>
  );
}
