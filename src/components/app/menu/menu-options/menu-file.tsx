import * as Menubar from "@radix-ui/react-menubar";

export default function MenuFile() {
  return (
    <Menubar.Menu>
      <Menubar.Trigger className="menu-option">File</Menubar.Trigger>

      <Menubar.Portal>
        <Menubar.Content
          align="start"
          sideOffset={6}
          className="radix-menubar-content"
        >
          <Menubar.Item className="radix-menubar-item">
            Example option 1
          </Menubar.Item>
          <Menubar.Item className="radix-menubar-item">
            Example option 2
          </Menubar.Item>

          <Menubar.Separator className="radix-menubar-separator" />

          <Menubar.Sub>
            <Menubar.SubTrigger className="radix-menubar-item has-sub">
              {" "}
              <span>Example option 3</span>
              <span className="submenu-arrow">›</span> {/* NEW */}
            </Menubar.SubTrigger>
            <Menubar.Portal>
              <Menubar.SubContent
                className="radix-menubar-content"
                alignOffset={-4}
                sideOffset={6}
              >
                <Menubar.Item className="radix-menubar-item">
                  Example option 4
                </Menubar.Item>
                <Menubar.Item className="radix-menubar-item">
                  Example option 5
                </Menubar.Item>
              </Menubar.SubContent>
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Item className="radix-menubar-item">
            Example option 6
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Portal>
    </Menubar.Menu>
  );
}
