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
      {
        label: "New",
        action: () => {
          const storeState = useDataStore.getState();

          const confirmed = window.confirm(
            "Are you sure you want to start a new file?\n\n" +
              "All unsaved trajectories will be lost. Make sure to save first."
          );

          if (!confirmed) return;

          // Clear all trajectories and reset selection using the store setter
          useDataStore.setState({
            trajectories: [],
            selectedTrajectoryId: null,
            selectedControlPointId: null,
          });
        },
      },

      {
        label: "Open",
        action: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".txt,.json,application/json,text/plain";

          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
              const text = await file.text();
              const store = useDataStore.getState();
              store.loadFromJSON(text);
            } catch (err) {
              console.error("Failed to open file:", err);
            }
          };

          input.click();
        },
      },
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
