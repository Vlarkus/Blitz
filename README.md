<div align="center">
  <img src="src/assets/app-icon.svg" alt="Blitz Logo" width="128" height="128">
  <h1>Blitz</h1>
  <h2>Easier Autonomous Trajectories</h2>
</div>

---

## Introduction

Blitz is a **desktop-only** web editor for designing and refining autonomous robot trajectories. Built to reduce friction on complex tasks, it emphasizes **customizability**, **ease of use**, and **accessibility across skill levels**.

---

## Key Features

Blitz takes inspiration from Adobe Illustrator:
- **Tool-driven interactions** determine how elements respond to clicks and drags.
- A **canvas** as the primary area for graphical interaction.
- An **info panel** for **discrete** numeric editing.
- A **trajectories (layers) panel** for managing paths.

Together, these enable **high-precision** trajectory editing.

---

## Tech Stack

- **Frontend:** React + Vite + TypeScript  
- **Canvas:** Konva / react-konva  
- **State:** Zustand (editor store + data store)  
- **Tooling:** ESLint, Prettier (optional)  
- **Paradigm:** Partial OOP *(Java influence)*  

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18 (recommended)

### Install
```sh
# pick one
pnpm install
# or
npm install
# or
yarn install
```

### Run (Local)
```sh
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open the printed local URL (commonly http://localhost:5173).

### Build
```sh
pnpm build
# or npm run build / yarn build
```

---

## Tools — Current Semantics

- **Select:** Click a control point to select it (and its trajectory). Drag to move if unlocked. Click a path to select its trajectory.
- **Add:** With a trajectory selected, click the canvas to add a control point at that world position; the new point becomes active.
- **Remove:** Click a control point to delete it; the parent trajectory becomes selected.
- **Insert:** Click on a trajectory path to insert a control point projected onto the nearest segment at the clicked position.
- **Cut:** Click a control point to split its trajectory into two; the trajectories panel will display both halves.

---

## Tutorials

Guides and videos are coming soon.

---

## Reporting Issues

1. **Open an issue:** https://github.com/Vlarkus/Blitz/issues  
2. **Please include:**
   - What happened vs. what you expected  
   - Reproduction steps (numbered)  
   - Console logs / screenshots (if relevant)  
   - Environment details (OS, browser, Node version)

---

## Join the [Discord](https://discord.gg/mytSnb7t)

---

## Contributing

1. Fork the repo  
2. Create a branch:
   ```sh
   git checkout -b feat/your-feature
   ```
3. Commit with a clear message:
   ```sh
   git commit -m "feat: add XYZ"
   ```
4. Push and open a Pull Request

---

## License

MIT © Valery Rabchanka (Vlarkus)
