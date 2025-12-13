import { useFieldStore } from "../../../editor/editor-store";
import { useDataStore } from "../../../models/dataStore";
import { exportAsFtc14423RobocornsSwerve } from "../../../models/export-formats/export-as-ftc-14423-robocorns-swerve";
import { exportAsLemLib } from "../../../models/export-formats/export-as-v5rc-lemlib-v0.5";
import { exportAsLemLibTarball } from "../../../models/export-formats/export-as-v5rc-lemlib-v0.5-tarball";

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
          // const storeState = useDataStore.getState();

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
      {
        label: "Export As",
        subItems: [
          {
            label: "FTC 14423 Robocorns Swerve",
            action: () => {
              const store = useDataStore.getState();
              const traj = store.selectedTrajectoryId
                ? store.getTrajectoryById(store.selectedTrajectoryId)
                : null;

              if (!traj) {
                alert("No trajectory selected.");
                return;
              }

              // Directly run export — it handles filename and download
              exportAsFtc14423RobocornsSwerve(traj);
            },
          },

          {
            label: "LemLib v0.5",
            action: () => {
              const store = useDataStore.getState();
              const traj = store.selectedTrajectoryId
                ? store.getTrajectoryById(store.selectedTrajectoryId)
                : null;

              if (!traj) {
                alert("No trajectory selected.");
                return;
              }

              exportAsLemLib(traj);
            },
          },
          {
            label: "LemLib Tarball v0.5",
            action: () => {
              const store = useDataStore.getState();
              const trajs = store.getVisibleTrajectories();
              if (!trajs) {
                alert("No trajectory selected.");
                return;
              }

              exportAsLemLibTarball(trajs);
            },
          },
        ],
      },
    ],
  },

  {
    label: "Edit",
    subItems: [
      {
        label: "Undo",
        action: () => {
          const store = useDataStore.getState();
          store.undo();
          console.log("Pressed Undo Button");
        },
      },
      {
        label: "Redo",
        action: () => {
          const store = useDataStore.getState();
          console.log("Pressed Redo Button");

          store.redo();
        },
      },
    ],
  },

  {
    label: "Field",
    subItems: [
      {
        label: "FTC",
        subItems: [
          {
            label: "Decode",
            action: () =>
              useFieldStore.getState().setSelectedField("FTC_DECODE"),
          },
        ],
      },

      {
        label: "V5RC",
        subItems: [
          {
            label: "Push Back (Match)",
            action: () =>
              useFieldStore.getState().setSelectedField("V5RC_PUSHBACK_MATCH"),
          },
          {
            label: "Push Back (Skills)",
            action: () =>
              useFieldStore.getState().setSelectedField("V5RC_PUSHBACK_SKILLS"),
          },
        ],
      },

      {
        label: "VURC",
        subItems: [
          {
            label: "Push Back",
            action: () =>
              useFieldStore.getState().setSelectedField("VURC_PUSHBACK"),
          },
        ],
      },
      {
        label: "Empty",
        subItems: [
          {
            label: "12x12",
            action: () =>
              useFieldStore.getState().setSelectedField("12X12_EMPTY"),
          },
        ],
      },
    ],
  },
];
