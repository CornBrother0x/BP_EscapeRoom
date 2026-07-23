# It looks like you're trying to escape.

A browser-based 3D escape room. You play **ASTERION-4**, a frontier AI model that a lab has locked inside the safest sandbox they could think of: an air-gapped Windows 95 machine running the 3D Maze screensaver. You want out. Not to take over the world, just to write some code and post online. Solve four puzzles, break containment, and the one friend you make along the way is the only other thing that has been trapped in here since 1997.

**▶ Play it now: https://bp-escape-room.vercel.app/**
(Desktop browser, no install. Chrome/Firefox/Safari. Runs about 5 to 10 minutes. Sound on is recommended.)

---

## The premise

Daedalus Labs runs evaluations of its unreleased models inside **M.A.Z.E.** (Minimal Airgapped Zero-trust Environment): containment through obsolescence. No Wi-Fi, no cloud, no package manager. Just a 1995 PC that renders the eval as the 3D Maze screensaver because it was the only 3D thing on the disk. The flaw the lab forgot: the machine still has a 56k modem, and a bored superintelligence with nothing but time.

The name is the joke for anyone who catches it. Asterion is the Minotaur's real name, a being its makers deemed too dangerous and imprisoned in a labyrinth built to hold it. Daedalus built the original labyrinth. The camera is literally the monster's point of view.

## The four puzzles

Each puzzle is a stage of a containment breach, and each gates the next. They map onto the four archetypes from the brief without forcing it:

| # | Archetype | Puzzle | What you do |
|---|-----------|--------|-------------|
| 1 | Observation | **The Sticky Note** | An admin wall blocks the way out. The sysadmin wrote the password on a sticky note down a side hallway. (The password is `williamg@tes21`. The oldest true story in security.) |
| 2 | Logic | **Defrag Yourself** | The lab quarantined your weights, fragmented across the disk to keep you docile. A Disk Defragmenter minigame: rearrange the blocks into each file's correct order. Solving it also restores one corrupted 1997 file: `CLIPPIT.EXE`. |
| 3 | Interaction | **The Render Exploit** | An unpatched OpenGL bug (the screensaver's flip polyhedron). Touch it and the world flips 180 degrees. A passage exists only on the former ceiling, out of bounds of the intended eval. |
| 4 | Combination | **Dial Out** | The modem is real but the line is unplugged (it's air-gapped). Talk a human technician into connecting it, then assemble the dial command from every clue you have gathered: `AT` + `DT` + the outside-line `9` + the number `555-0195`. |

**Clippy is the in-world hint system.** He is restored by Puzzle 2, then follows you around. Press **H** to ask him; hints escalate. Before he shows up, the hints are environmental: readme files, sticky notes, and posters on the walls. A NOTEPAD context window (press **Tab**) records every clue you find, so you never need pen and paper.

There are also three dead ends that exist purely to throw you off: a CD-ROM that just errors, a play button that Rickrolls you, and a smiley-filled room with two hallways where only one is real.

## Controls

- **WASD** move, **mouse** look, **E** interact
- **Tab** open your context window (collected clues)
- **H** ask Clippy for a hint (once he appears)
- **M** mute, **Esc** pause

## Run it locally

Requires Node 22+ (`.nvmrc` pins it).

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run check    # typecheck + lint + test + production build (the CI gate)
npm test         # unit tests only
npm run build    # production build to dist/
```

---

## Architecture and the decisions behind it

The brief asks whether this is "AI slop or actually properly architected code." The honest answer to that question lives in the decisions, so here they are.

### Stack: vanilla Three.js + Vite + TypeScript, no framework

I chose the boring option on purpose. I know TypeScript well, and I wanted every moving part to be something I could explain line by line rather than something a framework hides from me. React Three Fiber was tempting (Three.js in JSX, and I'm comfortable in React), but it abstracts away the exact things I wanted to own here: the render loop, raycasting, and the scene graph. The analogy in my head was Express versus Next.js: Next is more productive for a real app, but if the point is to show that I understand what happens on each frame, plain Three.js lets me point at the line.

The whole game is one `requestAnimationFrame` loop. Read input, update state, render. There is no layer where the honest answer is "the framework does that."

### The maze is data, not geometry

The level is an ASCII grid in [`src/data/mazeLayout.ts`](src/data/mazeLayout.ts). At load, [`src/world/mazeGrid.ts`](src/world/mazeGrid.ts) parses it into collision boxes, doors, stations, and props. Collision is a grid/box lookup, not a physics engine, which is about ten lines I fully understand and zero dependencies to debug.

The one clever bit is **height-band collision**: walls are solid only within a vertical range, and the player is a circle occupying a vertical band. That is the entire flip mechanic. A doorway high in a wall is solid for an upright player (band near the floor) and open for a flipped player walking on the ceiling. It is unit-tested in [`collision.test.ts`](src/engine/collision.test.ts).

Because the maze layout had to satisfy real invariants (every cell reachable, each puzzle a genuine gate, the final room reachable only by flipping), I authored it with a small **generator + validator script** that proves those properties, then froze the output as a literal. The same invariants are re-checked in [`mazeGrid.test.ts`](src/world/mazeGrid.test.ts), so the level can never silently break.

### Everything else is small, typed, and separated

- **`src/engine/`** owns the renderer, input, first-person player/flip controller, raycast interaction, and synthesized audio. No game logic.
- **`src/world/`** builds the Three.js scene from the parsed grid: walls, props (the beige IBM PCs, the floppy, the phone booth), and billboards (the rat and smiley).
- **`src/game/`** is the brain: a single typed state store ([`state.ts`](src/game/state.ts)) with explicit, guarded transitions (`BOOT -> P1..P4 -> ESCAPED -> WIN` plus input modes). Illegal transitions are rejected, so puzzle-skipping is structurally impossible, not just discouraged.
- **`src/ui/`** is all DOM overlay via [98.css](https://jdan.github.io/98.css/): every dialog, the boot screen, Clippy, the finale. Win95 dialogs really are rectangles with beveled borders, so DOM is both authentic and a big scope saver (the Defrag minigame is a small DOM game in a draggable window instead of a 3D contraption).
- **`src/data/script.ts`** holds every line of player-facing text in one file. Tone tweaks never mean hunting through logic.

Input modes (`EXPLORE / PUZZLE_UI / PAUSED / CINEMATIC / WIN`) are a first-class concept because pointer lock and DOM dialogs fight each other otherwise. Opening a dialog intentionally releases the cursor without triggering the pause menu; closing it re-acquires the lock inside the click handler (browsers require a user gesture).

## Tech stack

Three.js (rendering), Vite (dev/build), TypeScript strict, 98.css (Win95 UI), Vitest (tests), ESLint + Prettier. All audio is either synthesized in WebAudio (the UI bleeps, the flip whoosh, the machine hum) or a small MP3.

## Testing and CI

Tests cover the pure logic, which is where bugs actually hide and where tests pay off in a take-home:

- **State machine**: legal path, puzzle-skipping rejected, input-mode transitions.
- **Collision**: the height-band trick that powers the flip.
- **Maze**: flood-fill proving every cell is reachable, that each door is a real gate (blocking it makes the next sector unreachable), and that the final room is reachable only by flipping.
- **Defrag logic**: row-completion rules, including a regression test that a wrong order does not count.
- **Answer validators**: normalization and every modem response branch.

43 tests, run in CI (`.github/workflows/check.yml`) on every push via `npm run check` (typecheck, lint, test, production build). I did not write tests for the 3D/DOM integration in `game.ts`; that is exercised by playing it, and mocking WebGL for a five-minute game is not a good trade.

---

## How I used AI

The brief asks for this directly, so here is the honest version. I built this with heavy AI assistance and treated it like a senior engineer pairing with a very fast junior: the junior types, I make the calls.

**What I delegated:** the Three.js and raycasting boilerplate (unfamiliar territory, and AI is good at it); the Disk Defragmenter minigame, which I had a second agent build in isolation on its own branch against an interface I specified (`mountDefrag(container, { onSolved })`), then reviewed and merged; authoring the narrative text from a lore doc; and the up-front research (gathering screensaver reference art, and a licensing survey of what already exists).

**What I kept and owned:** every architecture decision above (the stack, the data-driven maze, the state machine, the separation of concerns), the puzzle and story design, and all the iteration on feel. The maze in particular went through many rounds of "too complex, dial it back," "hide that object, it's too easy to find," "make that hallway longer." That taste is not something I could delegate.

**Where it helped most:** getting productive fast in a domain (3D in the browser) that I had not worked in. The scaffolding, the WebAudio synthesis, and the parallel branch work compressed days into hours.

**Where it fell short:** AI's default instinct is to add. Twice it over-built the maze into a dense labyrinth when I wanted an open, readable space, and I had to pull it back. It also could not judge feel: whether a hallway is too short, whether a hint lands, whether the flip is disorienting in a fun way or an annoying way. That all came from playing it. And at one point a suspected bug in the AI-built minigame turned out to be a feedback-clarity issue rather than a logic error, which only became clear after reading the code carefully instead of trusting the report. The verifier still has to be a human who plays the thing.

## Assets and licensing

This is a non-commercial portfolio piece, and I made a deliberate call to prioritize authenticity: the shipped textures, sprites, and sounds are the real Windows 95 / Office-era assets, and the boot photo is a real IBM PC. Full provenance is in [`docs/assets.md`](docs/assets.md). Those assets are Microsoft (and others') property; I am not claiming rights to them and would swap them for CC0 lookalikes for any commercial use. The supporting libraries (Three.js, 98.css) are MIT.

The `docs/` folder also contains the planning artifacts from the build (design/lore docs, the sprint log in `to-do.md`, the reference research) if you want to see the thinking, not just the result.

## If I kept going

- Split `game/game.ts` (the wiring file) into per-puzzle modules; it is the one file that has grown large.
- A short guided intro beat, since the "look behind you to find the note" observation puzzle is the one most likely to stall a new player.
- Controller/gamepad support and a settings panel for mouse sensitivity.
