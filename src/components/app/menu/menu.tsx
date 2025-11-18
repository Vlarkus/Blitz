// src/components/Menu/Menu.tsx
import * as Menubar from "@radix-ui/react-menubar";
import { MENU_STRUCTURE, type MenuItem } from "./menuConfig";
import AppIcon from "../../../assets/app-icon.svg";
import "./menu.scss";

function renderMenuItems(items: MenuItem[]) {
  return items.map((item) => {
    if (item.subItems) {
      // Nested submenu
      return (
        <Menubar.Sub key={item.label}>
          <Menubar.SubTrigger className="menu-item has-submenu">
            {item.label}
          </Menubar.SubTrigger>
          <Menubar.Portal>
            <Menubar.SubContent className="menu-content" alignOffset={-4}>
              {renderMenuItems(item.subItems)}
            </Menubar.SubContent>
          </Menubar.Portal>
        </Menubar.Sub>
      );
    }

    // Regular clickable item
    return (
      <Menubar.Item
        key={item.label}
        className="menu-item"
        onSelect={() => item.action?.()}
      >
        {item.label}
      </Menubar.Item>
    );
  });
}

export default function Menu() {
  return (
    <header className="menu" role="navigation" aria-label="Main Menu">
      <div className="menu-logo-wrapper">
        <img src={AppIcon} alt="Blitz Logo" className="menu-logo" />
      </div>
      <div className="menu-divider" />
      <Menubar.Root className="menu-bar">
        {MENU_STRUCTURE.map((section) => (
          <Menubar.Menu key={section.label}>
            <Menubar.Trigger className="menu-trigger">
              {section.label}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content
                className="menu-content"
                align="start"
                sideOffset={4}
              >
                {renderMenuItems(section.subItems ?? [])}
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
      </Menubar.Root>
    </header>
  );
}
