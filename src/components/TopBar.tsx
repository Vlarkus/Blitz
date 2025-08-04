import { NavDropdown } from "react-bootstrap";
import logo from "../assets/logo.svg";

const menuLabels = ["File", "Edit", "Select", "View", "Window", "Help"];

export default function TopBar() {
  return (
    <nav className="navbar navbar-dark bg-dark px-3 py-2">
      <div className="d-flex align-items-center gap-3">
        {/* Logo */}
        <img src={logo} alt="Logo" style={{ width: 32, height: 32 }} />

        {/* Menus */}
        <div className="d-flex">
          {menuLabels.map((label) => (
            <NavDropdown
              title={<span className="custom-dropdown-toggle">{label}</span>}
              key={label}
              className="custom-dropdown"
            >
              <NavDropdown.Item>Option 1</NavDropdown.Item>
              <NavDropdown.Item>Option 2</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item>Another</NavDropdown.Item>
            </NavDropdown>
          ))}
        </div>
      </div>
    </nav>
  );
}
