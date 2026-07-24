# Windows 95/98 "3D Maze" Aesthetic Reference Notes

Reference material for recreating the look and feel of the Microsoft Plus! / Windows 95-98
"3D Maze" OpenGL screensaver and its surrounding Win9x-era desktop environment.

All images below were verified with `file` as real images. Three files are smaller than 5 KB
because they are the _authentic original assets_ (tiny, low-color originals extracted from the
screensaver / OS, visually verified) — not broken downloads: `maze-texture-ceiling-tile.png`
(630 B, 33x33), `maze-sprite-opengl-logo.png` (4.0 KB, 205x25), `shutdown-safe-to-turn-off.png`
(4.3 KB, mostly-black 640x400).

## Image Inventory

| Filename                                   | What it shows                                                                                                                                                                                      | Source                                                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maze-texture-wall-brick.png`              | The default wall texture: deep-red bricks with light mortar, 128x128 (extracted original asset)                                                                                                    | https://archive.org/details/3d-maze-screensaver-sprites ("PC Computer - 3D Maze Screensaver - Everything.zip")                                                                |
| `maze-texture-floor-wood.png`              | Default floor texture: orange-brown wood grain, 64x64 (original asset)                                                                                                                             | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-texture-ceiling-tile.png`            | Default ceiling texture: gray speckled "asbestos tile", only 33x33 (original asset)                                                                                                                | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-texture-wall-opengl-room.png`        | The famous alternate wall texture: rendered room with voxel OpenGL globe and toy bricks, 256x256 (original asset)                                                                                  | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-texture-wall-pattern-fractal.png`    | One of the psychedelic fractal "pattern" wall texture variants, 256x256 (original asset; pattern1 of 4)                                                                                            | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-sprite-rat.png`                      | The gray-brown rat billboard sprite that scurries through the maze, 256x123 (original asset)                                                                                                       | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-sprite-smiley-exit.png`              | The yellow smiley face with blue eyes/mouth that marks the maze exit, 126x126 (original asset)                                                                                                     | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-sprite-start-button.png`             | The floating "Start" button (Windows flag + black text on beveled gray) shown at the spawn point, 509x128 (original asset)                                                                         | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-sprite-opengl-logo.png`              | The "OpenGL" wordmark texture used on the in-maze OpenGL logo object, 205x25 (original asset)                                                                                                      | https://archive.org/details/3d-maze-screensaver-sprites                                                                                                                       |
| `maze-corridor-screenshot.png`             | The screensaver in action: first-person brick corridor, wood floor, tile ceiling, Start marker ahead                                                                                               | https://en.wikipedia.org/wiki/3D_Maze (https://upload.wikimedia.org/wikipedia/en/d/d0/Windows_3D_Maze_Screensaver.png)                                                        |
| `win95-desktop-teal-first-run.png`         | Windows 95 first-run desktop: teal background, icon column, taskbar, "Welcome to Windows 95" dialog with beveled gray buttons and navy title bar                                                   | https://en.wikipedia.org/wiki/Windows_95 (https://upload.wikimedia.org/wikipedia/en/e/eb/Windows_95_at_first_run.png)                                                         |
| `bsod-win9x.png`                           | Win9x Blue Screen of Death: "A fatal exception 0E has occurred...", gray DOS text on blue, inverted "Windows" header (faithful Fixedsys recreation, rendered at 1280x960)                          | https://commons.wikimedia.org/wiki/File:Windows_9x_Blue_Screen_of_Death_recreated_in_Fixedsys.svg                                                                             |
| `shutdown-safe-to-turn-off.png`            | "It's now safe to turn off your computer." — orange text on black, the actual LOGOS.SYS bitmap (640x400)                                                                                           | https://commons.wikimedia.org/wiki/File:LOGOS.SYS.png                                                                                                                         |
| `defrag-win95-details-grid.jpg`            | Win95 Disk Defragmenter "Show Details" view: grid of small beveled blocks (white background, dark filled clusters, cyan just-written rows), segmented blue progress bar, Stop/Pause/Legend buttons | Wayback Machine capture of geocities.com/politalk/win95/docs/Defrag4.JPG (http://web.archive.org/web/2009im_/http://www.geocities.com/politalk/win95/docs/Defrag4.JPG)        |
| `defrag-win95-advanced-options-dialog.jpg` | Win95 Defragmenter "Advanced Options" dialog — textbook Win95 chrome: group box, radio buttons, checkbox, beveled OK/Cancel                                                                        | Wayback Machine capture of geocities.com/politalk/win95/docs/Defrag2.JPG (http://web.archive.org/web/20091027031006/http://www.geocities.com/politalk/win95/docs/Defrag2.JPG) |
| `setup-cd-key-dialog.png`                  | Windows 95 Setup Wizard "Product Identification" screen with the CD Key entry field, teal art panel, navy strip title, over the dark-blue setup backdrop                                           | https://gigazine.net/gsc_news/en/20230304-windows-95-product-key/ (https://i.gzn.jp/img/2023/03/04/windows-95-product-key/01_m.png)                                           |
| `clippy-letter-pose.png`                   | Clippy in the iconic "It looks like you're writing a letter" pose with yellow speech balloon                                                                                                       | https://en.wikipedia.org/wiki/Office_Assistant (https://upload.wikimedia.org/wikipedia/en/d/db/Clippy-letter.PNG)                                                             |
| `clippy-sprite-sheet.png`                  | Full Clippy animation atlas (3348x3162): hundreds of frames — idle, atom-juggle, headphones, writing, searching, exit — on magenta transparency-key background                                     | clippy.js official agent assets: https://raw.githubusercontent.com/smore-inc/clippy.js/master/agents/Clippy/map.png                                                           |

### Known gaps (searched, not found from a directly downloadable source)

- **Classic Win9x error dialog** ("This program has performed an illegal operation", red-circle X icon).
  Not found on Wikimedia/curl-able hosts; the chrome traits are fully covered by the four dialog
  screenshots above — only the red X icon itself is missing. Any Win98 `user.exe` icon rip would fill this.
- **The "flip" polyhedron object** has no texture asset — it is an _untextured, flat-shaded gray
  polyhedron_ rendered by the engine (which is why it does not appear in the sprite dump). Model it
  as a low-poly rock-like solid in plain gray; on contact the camera rolls 180° so the wood floor
  becomes the ceiling.
- Action screenshots of the rat/smiley _inside_ the corridor were not separately saved — the
  original sprites plus the corridor screenshot cover reconstruction.

---

## Visual DNA

### Maze renderer

- **Texture scale is tiny and it shows.** 128x128 brick, 64x64 floor, 33x33 ceiling, 256x256 for
  "special" walls. OpenGL bilinear filtering means the look up close is _chunky-but-smeared_ — big
  soft texels, never crisp pixel-art edges. Replicate with low-res textures + linear filtering
  (do NOT use nearest-neighbor if you want the authentic 1995 GL look).
- **Palette (sampled from the actual assets):**
  - Brick red: `#620000`–`#820000` (dominant ~`#7C0000`), mortar lines pale warm gray ~`#C8BFB6`
  - Wood floor: base `#A16824`, grain highlights `#BF853F`
  - Ceiling tile: `#C0C0C0` field with `#808080` and `#FFFFFF` speckle
  - Exit smiley: pure `#FFFF00` face, saturated blue `#0000FF`-ish eyes/mouth, rendered as a shaded sphere
  - Flip polyhedron: flat mid-gray, slightly shaded per-face
- **Lighting: none.** Every surface is drawn fully lit — no shadows, no fog, no distance dimming, no
  vertex shading on walls. Depth is conveyed _only_ by perspective convergence and texture density.
  This flat, shadowless brightness is the single most recognizable renderer trait.
- **Geometry:** strict unit grid; axis-aligned full-height walls; corridors exactly one cell wide;
  ceiling and floor always present. Walls butt together with no trim or molding.
- **Camera feel:** eye height about halfway up the wall (feels slightly low, like a child or a rat);
  moderate-wide FOV (~60-75° vertical feel at 4:3); constant glide speed; turns are quick smooth 90°
  pivots (never strafes); brief pause-and-turn "decisions" at junctions; occasional full 180° roll
  after touching the flip polyhedron, leaving the world upside down until the next flip.
- **Inhabitants:** rat and smiley are camera-facing billboard sprites; the Start button floats at
  spawn as a flat quad; OpenGL logo objects spin in place and do nothing.
- **Frame:** 4:3, 640x480-era resolution, 16-bit color vibe; slight banding in gradients is period-correct.

### Win9x UI chrome

- **3D bevel formula (the heart of the look):** face `#C0C0C0`; raised edge = 1px `#FFFFFF` top/left
  - 1px `#808080` bottom/right + 1px `#000000` outer bottom/right corner; sunken controls (text
    fields, wells) invert it. Pressed buttons swap highlight/shadow and nudge the label 1px down-right.
- **Title bars:** Windows 95 = solid navy `#000080` (inactive: `#808080`); Windows 98 added the
  left-to-right gradient `#000080` → `#1084D0`. Title text is white bold **MS Sans Serif 8pt**;
  caption buttons are 16x14 beveled gray squares with black glyphs.
- **Desktop:** default teal `#008080` (sampled `#008282` from the screenshot), icon labels white
  text on transparent with teal showing through; taskbar is a `#C0C0C0` bar with beveled Start
  button carrying the four-color Windows flag.
- **Fonts:** MS Sans Serif 8pt everywhere in UI (bitmap, no antialiasing); Fixedsys / 80x25 VGA text
  for BSOD; the shutdown screens use pre-rendered bitmap text (LOGOS.SYS is 320x400 stretched
  horizontally to 640x400 — visibly double-wide pixels).
- **BSOD:** background `#0000AA`, text light gray `#AAAAAA`–`#B3B3B3`, centered "Windows" header as
  inverted block (blue text on gray), asterisk-bulleted instructions, blinking `_` cursor,
  "Press any key to continue".
- **Shutdown screen:** pure black `#000000`, warm orange text sampled `#E57732`, centered,
  soft-edged bitmap glyphs.
- **Setup wizard (CD-Key screen):** gray dialog floating over a dark navy-blue textured backdrop with
  a black-on-blue "Windows 95 Setup" banner top-left; inner navy strip titled "Windows 95 Setup
  Wizard"; left teal art panel with 3D computer illustration; "Product Identification" heading in
  large serif-free bold; single sunken text field for the 10-digit CD Key (`XXX-XXXXXXX`);
  `< Back` / `Next >` / `Cancel` beveled buttons bottom-right.
- **Defrag details view:** dense grid of small square blocks each with its own micro-bevel; white
  empty cells, dark slate filled clusters, bright cyan blocks marching row-by-row as data is
  rewritten; bottom `#C0C0C0` strip with segmented royal-blue progress bar ("93% Complete") and
  beveled Stop / Pause / Legend / Hide Details buttons.
- **Clippy:** silver wire paperclip with big googly eyes and expressive wire eyebrows, riding a
  yellow lined-paper sheet; speech balloons are pale-yellow rounded rectangles with black 8pt text,
  blue radio-button bullets, and a checkbox — chrome-free, comic-style. Animation atlas uses
  magenta `#FF00FF` as the transparency key (period-typical).

---

## Sounds (era-defining, names only — no downloads)

- **Windows 95 startup chime** — "The Microsoft Sound" by Brian Eno; warm synth swell. THE boot sound.
- **Windows 98 startup** — longer orchestral-synth flourish variant.
- **Chord (`chord.wav`)** — the blunt "critical stop"/error ding that accompanies error dialogs.
- **Ding (`ding.wav`)** — lighter default beep for questions/notifications.
- **Chimes (`chimes.wav`)** — glassy descending exclamation sound.
- **Tada (`tada.wav`)** — triumphant fanfare (logon/success); great for puzzle-solved moments.
- **The Microsoft Sound shutdown counterpart** — Win95 logoff/shutdown chime (soft descending pad).
- **Recycle Bin empty** — crinkling paper crunch.
- **Hardware ambience:** PC-speaker POST beep, floppy-drive grind/seek, CD-ROM spin-up whir,
  IDE hard-disk chatter (constant during defrag), CRT monitor whine + degauss thunk.
- **Dial-up modem handshake** — screeching V.34/V.90 negotiation; instant era signifier.
- **Office Assistant knock** — Clippy's tap-tap-tap on the "glass" when he appears.
- **Note:** the 3D Maze screensaver itself is _silent_ — total silence over the endless corridor
  glide is itself an authentic (and eerie) trait worth preserving or deliberately subverting.
