import * as Menubar from "@radix-ui/react-menubar";
import "./menu.scss";
import AppIcon from "../../../assets/app-icon.svg";
import MenuFile from "./menu-options/menu-file";

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
          <Menubar.Root>
            <MenuFile />
            <MenuFile />
            <MenuFile />
          </Menubar.Root>
        </span>
      </nav>
    </header>
  );
}
