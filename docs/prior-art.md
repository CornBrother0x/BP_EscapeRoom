# Prior Art: Windows 95/98 "3D Maze" in the Browser

Research notes for the BP_EscapeRoom take-home (browser 3D escape room styled after the
Windows 95/98 3D Maze screensaver). All license claims below were verified against the
repo's LICENSE file (via GitHub API `license.spdx_id`) or the npm registry on 2026-07-22
unless marked **unverified**. "No license" means no LICENSE file exists, which legally
means **all rights reserved** — such code can be studied but not copied.

---

## Summary table

| Project                                               | Link                                                                                                        | Live demo                                                            | Tech                                                    | License                                                                                                                                                                  | Useful for                                                                                                             | Fork-worthy?                                     |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Windows-95-3D-Maze-Screensaver (ibid-11962)           | [GitHub](https://github.com/ibid-11962/Windows-95-3D-Maze-Screensaver)                                      | [Demo](https://ibid-11962.github.io/Windows-95-3D-Maze-Screensaver/) | Raw WebGL + JS (no three.js)                            | **None** (all rights reserved)                                                                                                                                           | Most faithful recreation: rats, polyhedra flip, smiley exit, right-wall-following auto-solver. Behavior reference      | reference-only                                   |
| maze95-js                                             | [GitHub](https://github.com/maze95/maze95-js) (archived)                                                    | [Demo](https://maze95.js.org/)                                       | three.js                                                | **None**                                                                                                                                                                 | Playable (WASD) maze w/ collision in three.js; incomplete (no rats/smiley), discontinued                               | reference-only                                   |
| maze95js (uuphoria fork)                              | [GitHub](https://github.com/uuphoria/maze95js)                                                              | [Demo](https://uuphoria.github.io/maze95js/)                         | three.js                                                | **None** (inherits parent)                                                                                                                                               | Same as parent, kept online after parent archived                                                                      | reference-only                                   |
| 3d-maze-95 (MikelAlejoBR)                             | [GitHub](https://github.com/MikelAlejoBR/3d-maze-95)                                                        | [Demo](https://mikelalejobr.github.io/3d-maze-95/maze.html)          | three.js                                                | **GPL-3.0**                                                                                                                                                              | Simple three.js maze walkthrough                                                                                       | no (GPL contaminates an MIT/proprietary project) |
| win98-maze-webgl (srsly4)                             | [GitHub](https://github.com/srsly4/win98-maze-webgl)                                                        | —                                                                    | three.js/WebGL                                          | **None**                                                                                                                                                                 | Win98 variant, recursive-backtracking maze gen                                                                         | reference-only                                   |
| WebGLMaze (jobbojobson)                               | [GitHub](https://github.com/jobbojobson/WebGLMaze)                                                          | —                                                                    | three.js                                                | **MIT**                                                                                                                                                                  | Camera-on-rails maze _animation_ (screensaver mode, not playable). Only MIT-licensed maze recreation found             | yes (as a snippet source), but it's minimal      |
| Playable3DMaze (x86matthew)                           | [GitHub](https://github.com/x86matthew/Playable3DMaze)                                                      | —                                                                    | C++ (native, patches original .scr)                     | **None**                                                                                                                                                                 | Proof the original is reverse-engineerable; not web                                                                    | no                                               |
| Win3DMaze (kurtis2221)                                | [GitHub](https://github.com/kurtis2221/Win3DMaze) / [itch](https://kurtis2221.itch.io/windows-3d-maze-game) | downloadable                                                         | C# / .NET                                               | **None**                                                                                                                                                                 | Faithful native remake; behavior reference only                                                                        | no                                               |
| 3D Maze Ultra (Smoke Fumus)                           | [itch.io](https://smoke-th.itch.io/3d-maze-ultra)                                                           | browser-playable                                                     | unverified (itch web build)                             | **unverified**                                                                                                                                                           | Feel/faithfulness reference, playable in browser                                                                       | no (no source found)                             |
| Screensaver Subterfuge                                | [itch.io](https://poor-track-design.itch.io/screensaver-subterfuge)                                         | downloadable                                                         | unverified                                              | **unverified**                                                                                                                                                           | "Escape the 3D Maze screensaver" concept prior art — closest in _concept_ to this project                              | no                                               |
| **98.css** (jdan)                                     | [GitHub](https://github.com/jdan/98.css)                                                                    | [Docs](https://jdan.github.io/98.css/)                               | CSS only, on npm (`98.css`)                             | **MIT** ✅                                                                                                                                                               | Win98 windows/dialogs, title bars, buttons, progress bars (solid + segmented), checkboxes, dropdowns, tabs, tree views | yes — use as dependency                          |
| 7.css (khang-nd)                                      | [GitHub](https://github.com/khang-nd/7.css)                                                                 | [Docs](https://khang-nd.github.io/7.css/)                            | CSS                                                     | **MIT** ✅                                                                                                                                                               | Windows 7 look (wrong era for this project)                                                                            | dependency if Win7 theme wanted                  |
| XP.css (botoxparty)                                   | [GitHub](https://github.com/botoxparty/XP.css)                                                              | [Docs](https://botoxparty.github.io/XP.css/)                         | CSS (fork of 98.css)                                    | **MIT** ✅                                                                                                                                                               | Windows XP look (wrong era)                                                                                            | dependency if XP theme wanted                    |
| React95 (react95-io)                                  | [GitHub](https://github.com/react95-io/React95)                                                             | [react95.io](https://react95.io)                                     | React + styled-components                               | **MIT** ✅                                                                                                                                                               | Win95 React components; last push Jan 2024                                                                             | yes, if the shell is React                       |
| React95 (@react95/core)                               | [GitHub](https://github.com/React95/React95)                                                                | [Docs](https://react95.github.io/React95/)                           | React                                                   | **MIT w/ disclaimer** ("Windows and all associated images are property of Microsoft Corp and not covered by this license") — GitHub reports NOASSERTION; npm reports MIT | Actively maintained (July 2026) Win95 React components                                                                 | yes, if the shell is React                       |
| os-gui (1j01)                                         | [GitHub](https://github.com/1j01/os-gui)                                                                    | [os-gui.js.org](https://os-gui.js.org)                               | CSS + JS                                                | **MIT** ✅                                                                                                                                                               | Win98 look **plus JS windowing** (draggable/focusable `$Window`, menus) — from the 98.js.org author                    | yes — use if draggable windows needed            |
| **clippyjs** (pithings/clippy, formerly pi0/clippyjs) | [GitHub](https://github.com/pithings/clippy)                                                                | [clippy.pi0.io](https://clippy.pi0.io/)                              | ES modules, no jQuery; npm `clippyjs` v0.1.0 (Feb 2026) | **MIT (code)** ✅ per npm; README: character assets remain **Microsoft property**                                                                                        | Clippy/Merlin/etc. agents with animations + balloons; per-agent subpath imports (`clippyjs/agents/merlin`)             | yes — use as dependency (see asset caveat)       |
| clippyts (lizozom)                                    | [GitHub](https://github.com/lizozom/clippyts) / [npm](https://www.npmjs.com/package/clippyts)               | —                                                                    | TypeScript, no jQuery; npm v1.0.4 (2023)                | **MIT** ✅ per npm (no LICENSE file in repo)                                                                                                                             | TS alternative if clippyjs 0.1.0 misbehaves                                                                            | backup option                                    |
| clippy.js original (smore-inc → clippyjs/clippy.js)   | [GitHub](https://github.com/clippyjs/clippy.js)                                                             | —                                                                    | jQuery-era (2012)                                       | **None** (no LICENSE file)                                                                                                                                               | Historic only; superseded                                                                                              | no                                               |
| three.js                                              | [GitHub](https://github.com/mrdoob/three.js)                                                                | [examples](https://threejs.org/examples/)                            | —                                                       | **MIT** ✅                                                                                                                                                               | Engine; official `PointerLockControls` + `misc_controls_pointerlock` example is in-repo and MIT                        | yes — core dependency                            |
| EscapeTheLightrooms (JaimeUGR)                        | [GitHub](https://github.com/JaimeUGR/EscapeTheLightrooms)                                                   | [itch](https://thejaimex.itch.io/escape-the-lightrooms)              | three.js + Tween + CSG + PointerLockControls            | **None**                                                                                                                                                                 | The most complete open-source three.js escape room found (rooms, puzzles, sound, animation)                            | reference-only                                   |
| ambientCG (textures)                                  | [ambientcg.com](https://ambientcg.com)                                                                      | —                                                                    | PBR texture library                                     | **CC0 1.0** ✅ ([license page](https://docs.ambientcg.com/license/))                                                                                                     | Brick/carpet/stone lookalike textures, redistributable in a public repo                                                | yes — asset source                               |

Notes: `Tresster/83D-Maze` appeared in searches but now returns 404 (deleted/renamed).
CodePen turned up no substantive 3D Maze recreations beyond the GitHub projects above.

---

## Area notes

### 1. Web recreations of the 3D Maze screensaver

- **ibid-11962/Windows-95-3D-Maze-Screensaver** (90★, raw WebGL) is the _fidelity benchmark_:
  rats with independent movement, tetra/octa/dodecahedra, the upside-down flip ("up vector
  rotated 90° about the camera direction" on polyhedron contact), smiley exit, start-button
  icon, and the original right-wall-following auto-solver. Its README openly states wall/floor
  textures were **extracted from the original screensaver** and 2D sprites were taken from a
  Unity clone found online — i.e., Microsoft assets, no license. Study the mechanics, do not
  copy code or assets.
- **maze95-js** (three.js) is the closest architectural match to what we'd build (three.js,
  box-geometry collision, PNG texture loading) but is discontinued, incomplete (no rat/smiley),
  has spawn bugs, and no license.
- **jobbojobson/WebGLMaze** is the only MIT-licensed recreation found, but it is an
  auto-navigating animation, not a playable game.
- Conclusion: **nothing exists that is both licensed for reuse and complete.** Building the
  maze from scratch on three.js is the right call; the recreations are behavior references.

### 2. Win95 UI libraries

- **98.css (MIT, 11k★)** provides exactly the three things needed — window/dialog with title
  bar + close button, buttons (default/pressed/disabled/focused), and progress bars (solid and
  segmented) — plus checkboxes, selects, tabs, sliders, tree views. CSS-only, semantic HTML,
  installable from npm/unpkg. It recreates the look with CSS/SVG rather than shipping
  Microsoft bitmaps, so it is clean for a public repo.
- **os-gui (MIT)** adds what 98.css deliberately omits: JS behavior (draggable/resizable
  windows, focus management, menu bars). Worth adding only if the escape room needs movable
  windows; otherwise 98.css alone is lighter.
- **React95 (either flavor, both MIT)** only if the UI shell is React; for a small take-home,
  plain 98.css over DOM is less machinery.
- 7.css / XP.css are MIT but the wrong era for a 95/98 aesthetic.

### 3. Clippy libraries

- The canonical modern option is **npm `clippyjs` v0.1.0** (published Feb 2026 from the
  rewritten pithings/clippy repo, formerly pi0/clippyjs): ES-module rewrite, no jQuery, agents
  importable individually (`clippyjs/agents/clippy`), sprites/animation data ship with the
  package (also available via jsDelivr CDN). npm license field: **MIT**. The README is
  explicit that **the character artwork remains Microsoft property** — MIT covers the code only.
- **clippyts v1.0.4** (MIT per npm, TypeScript, 2023) is a fallback if 0.1.0 has issues.
- The original smore-inc clippy.js repo has **no license file** — do not vendor from it.

### 4. Asset provenance (textures & sounds)

- Every faithful recreation gets its wall/floor/ceiling textures by **ripping them from
  Microsoft's `ssmaze.scr`** (or from mirrors: Internet Archive "3D Maze Screensaver Sprites
  and Files", The Spriters Resource). These are **Microsoft IP**. In practice this is widely
  tolerated — the ibid-11962 repo has hosted them publicly since 2019 with no takedown — but
  none of those projects carry a license, and for a take-home attached to your name/employer
  the risk is unnecessary. Same story for Win95 system sounds (chord/ding/tada): freely
  mirrored on Internet Archive, still Microsoft's.
- Free lookalikes exist and are trivially good enough: **ambientCG is CC0 1.0 (verified)** and
  explicitly permits committing raw files to a public repo, with brick/carpet/stone materials
  that read as "3D Maze" once downscaled and color-crushed to 256-color vibes. Procedural
  generation (a 128×128 canvas-drawn brick pattern) is another zero-risk route.
- Sounds: Pixabay's retro/Windows-style effects are free for commercial use without
  attribution under the Pixabay Content License (not CC0 — standalone redistribution of the
  files is restricted, but use inside a project is allowed); itch.io free retro UI packs vary
  per pack (check each); or synthesize clicks/chimes with WebAudio/jsfxr for full CC0-purity.

### 5. Three.js escape room / first-person examples

- **three.js official `misc_controls_pointerlock` example** — in the three.js repo, MIT, and
  the standard pattern for FPS movement (PointerLockControls + keyboard velocity + simple
  collision). This is the one source you can copy verbatim.
- **EscapeTheLightrooms** — a finished, sizable three.js escape room (PointerLockControls,
  Tween, CSG, sounds, multi-room puzzles). No license, so architecture-reference only:
  useful for how it structures rooms, interactables, and puzzle state.
- Other hits (g-escape, escapethevroom, diegodan1893/EscapeRoom, Zebiano/projeto_SG) are
  small student projects, licenses unverified — not worth mining.
- Raycast interaction ("look at object, press E / click") is a ~30-line pattern
  (`Raycaster.setFromCamera` against an interactables array) documented in three.js docs;
  no dependency needed.

---

## Recommendation

**Use as dependencies (all MIT-verified):**

- `three` — engine. Copy the official PointerLockControls example wiring (MIT, safe to copy).
- `98.css` — all 2D chrome: dialogs, buttons, progress bars. Don't hand-roll Win98 CSS.
- `clippyjs@0.1.0` — if the design includes an assistant. Load it as an npm/CDN dependency
  rather than committing the sprite sheets to the repo (code is MIT; sprites are Microsoft's —
  keep them out of your tree and note the provenance in the README).
- Optional: `os-gui` (MIT) only if dialogs must be draggable.

**Study but rewrite from scratch:**

- ibid-11962's recreation for _behavior_: maze generation, the rat/polyhedron/smiley roster,
  the upside-down flip math, and the right-wall-follower (useful as an "attract mode" or hint
  system). No license — treat as a spec, not a source.
- maze95-js for how a three.js version organizes maze → BoxGeometry + grid-based collision
  (grid cell collision is ~20 lines; no physics engine needed).
- EscapeTheLightrooms for escape-room structure (room/puzzle/interactable state machine).

**Avoid copying:**

- Code from any no-license repo (ibid-11962, maze95-js, srsly4, EscapeTheLightrooms) — read,
  don't paste.
- Code from MikelAlejoBR/3d-maze-95 — GPL-3.0 would force the whole project to GPL.
- Microsoft-extracted textures, sprites (start button, smiley, rat), and Win95 WAVs.

**Bottom line:** there is no fork-worthy complete implementation; the differentiated work
(maze + escape-room mechanics) must be original, which is what a take-home wants anyway. The
undifferentiated work (UI chrome, Clippy, controls) is fully covered by MIT libraries.

## Asset strategy (public repo)

1. **Textures:** commit only CC0 material — ambientCG bricks/carpet/stone (CC0 1.0, verified,
   redistribution explicitly allowed) downscaled to ~128px with reduced palette for the
   period look, or procedurally drawn on a canvas at startup (zero binary assets). Credit
   ambientCG in the README (not required, good form).
2. **Sounds:** synthesize UI blips/chimes with WebAudio (safest, zero assets), or use Pixabay
   retro effects (free, no attribution; avoid claiming CC0). Do **not** commit real Win95
   WAVs or the startup chime.
3. **Clippy:** dependency-only via npm/CDN; no sprite files in the repo.
4. **UI art:** 98.css needs no images from us; its pixel fonts and styling ship with the
   package under MIT.
5. **README provenance note:** one short "Assets" section listing each asset's source and
   license — reviewers notice this, and it defuses the only IP question the project raises.
