import "./menu.scss";
import AppIcon from "../../../assets/app-icon.svg";

const MENU_OPTIONS = ["File", "Edit", "About", "Help"];

export default function Menu() {
  return (
    <header className="menu" role="navigation" aria-label="Main Menu">
      <span className="menu-logo-wrapper">
        <img src={AppIcon} alt="Blitz Logo" className="menu-logo" />
      </span>
      <span className="menu-divider"></span>
      <nav className="menu-options-list-wrapper">
        <ul className="menu-options-list">
          {MENU_OPTIONS.map((option) => (
            <li key={option} className="menu-option">
              {option}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
