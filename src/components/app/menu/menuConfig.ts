import { useDataStore } from "../../../models/dataStore";

// src/components/Menu/menuConfig.ts
export interface MenuItem {
  label: string;
  action?: () => void;
  subItems?: MenuItem[];
}

export const MENU_STRUCTURE: MenuItem[] = [
  {
    label: "File",
    subItems: [
      { label: "New", action: () => console.log("New File") },
      { label: "Open", action: () => console.log("Open File") },
      {
        label: "Save As",
        action: () => {
          // Prompt the user for filename
          const input = window.prompt("Enter file name:", "trajectories");
          if (!input) return; // user cancelled

          // Call the store method with given name
          const store = useDataStore.getState();
          store.saveToJSON(input);
        },
      },
      { label: "Export As", action: () => console.log("Export As") },
    ],
  },
  {
    label: "Field",
    subItems: [
      {
        label: "FTC",
        subItems: [
          { label: "Decode", action: () => console.log("FTC Decode") },
        ],
      },
      {
        label: "VEX V5",
        subItems: [
          { label: "Push Back", action: () => console.log("VEX Push Back") },
          {
            label: "High Stakes",
            action: () => console.log("VEX High Stakes"),
          },
        ],
      },
      { label: "Load Custom", action: () => console.log("Load Custom") },
    ],
  },
];
