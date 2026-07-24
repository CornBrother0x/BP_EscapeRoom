# M.A.Z.E.

A first-person browser escape room set inside a Windows 95-era AI containment
sandbox.

**[Play M.A.Z.E.](https://bp-escape-room.vercel.app/)**

Desktop browser required. A full run takes about 5 to 10 minutes. Sound on!

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
npm run check    # format check, typecheck, lint, unit tests, and production build
npm run e2e      # Playwright smoke test: boots the built app in real Chromium
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

`npm run check` is the same gate used by CI (Prettier format check, typecheck,
lint, tests, build). Unit and jsdom tests cover state transitions, answer
validation, collision behavior, maze reachability and gating, the persuasion
state machine, and the defrag puzzle. A separate Playwright job (`npm run e2e`)
boots the production bundle in real headless Chromium and asserts it reaches a
playable state with no uncaught errors. Both run on every push.

## AI Use

AI assisted with initial Three.js and WebAudio scaffolding, reference research,
and an isolated minigame component. I retained product direction, puzzle design,
architecture, integration, testing, review, and playtesting.

Where the AI's output fell short I went in and wrote the code myself. Two simple
examples: the flip mechanic needed walls that collide only within a vertical
band, so an upside-down player passes through a high doorway the AI kept making
solid; and the boot sequence had to be gated behind a keypress to unlock the
browser's audio context, or no sound played at all.

It accelerated work with unfamiliar browser APIs. It was less useful for level
design and interaction feedback; those required repeated playtests and manual
revision.

For a preview of how the lore and aesthetic came together before any code, see
`docs/lore.md`, `docs/assets.md`, or the `docs/` folder generally.

## Third-Party Assets

Asset provenance is recorded in [`docs/assets.md`](docs/assets.md). Several
Windows-era media files are third-party material and are not covered by a
license for this project's original source code.
