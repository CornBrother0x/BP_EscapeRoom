# M.A.Z.E.

A first-person browser escape room set inside a Windows 95-era AI containment
sandbox.

**[Play M.A.Z.E.](https://bp-escape-room.vercel.app/)**

Desktop browser required. Tested in Chrome. A full run takes about 5 to 10
minutes, and sound is recommended.

The game contains four sequential puzzles built around observation, logic,
spatial interaction, and clues collected in the maze. In-world hints are
available.

## Run Locally

Requires Node.js 22 and npm. The repository includes an `.nvmrc`.

```bash
git clone https://github.com/CornBrother0x/BP_EscapeRoom.git
cd BP_EscapeRoom
nvm install
npm ci
npm run dev
```

Open `http://localhost:5173`.

```bash
npm run check    # typecheck, lint, tests, and production build
npm run build    # build to dist/
npm run preview  # serve the production build locally
```

## Controls

- `WASD`: move
- Mouse: look
- `E`: interact
- `Tab`: view collected clues
- `H`: ask for a hint when available
- `M`: mute
- `Esc`: pause

## Technical Approach

The project uses vanilla Three.js, TypeScript, and Vite. Avoiding a UI or game
framework kept the render loop, raycasting, collision, and scene graph explicit.

- The maze is an ASCII grid parsed into scene geometry, collision bounds,
  stations, and gates.
- A typed state store owns progression and input modes. Invalid transitions are
  rejected.
- Puzzle rules are isolated from DOM rendering so their logic can be tested
  without WebGL.
- Windows-style interfaces use DOM overlays and 98.css; the 3D scene remains
  focused on navigation and interaction.

Source is organized by responsibility:

| Path           | Responsibility                                           |
| -------------- | -------------------------------------------------------- |
| `src/engine/`  | Rendering, input, movement, collision, audio, raycasting |
| `src/world/`   | Maze parsing and Three.js scene construction             |
| `src/game/`    | Progression, validation, and game orchestration          |
| `src/puzzles/` | Independent puzzle components and rules                  |
| `src/ui/`      | Boot, dialogs, hints, and finale                         |
| `src/data/`    | Maze layout and player-facing copy                       |

## Verification

`npm run check` is the same gate used by CI. Unit tests cover state transitions,
answer validation, collision behavior, maze reachability and gating, and puzzle
rules. The complete browser flow is verified manually.

## AI Use

AI assisted with initial Three.js and WebAudio scaffolding, reference research,
first-pass narrative copy, and an isolated minigame component. I retained
product direction, puzzle contracts, architecture, integration, review, and
playtesting.

It accelerated work with unfamiliar browser APIs. It was less useful for level
design and interaction feedback; those required repeated playtests and manual
revision.

## Third-Party Assets

Asset provenance is recorded in [`docs/assets.md`](docs/assets.md). Several
Windows-era media files are third-party material and are not covered by a
license for this project's original source code.
