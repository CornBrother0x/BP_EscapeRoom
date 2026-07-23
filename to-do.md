# To-Do — Product Spec & Sprint Plan

> This file IS the product spec. Deep design context: `docs/lore.md`,
> `docs/references/aesthetic-notes.md`, `docs/prior-art.md`.
>
> **Repo process**: PRIVATE GitHub repo from day one; commit normally at
> logical boundaries; Vercel auto-deploys previews on push. At Ship time we
> decide: flip this repo public, or pour the final code into a fresh public
> repo. Until then nothing is visible to anyone but us.
> `docs/prompt.md` is gitignored and must NEVER be committed (Crossmint
> confidentiality) — history is forever, even in a private repo we may later
> open. Microsoft-extracted assets are fair game everywhere (see Decisions).

## Decisions

- [x] Concept — **Windows 95 "3D Maze" screensaver as an AI containment sandbox** (docs/lore.md)
- [x] Story — **you are ASTERION-4, escaping the M.A.Z.E. sandbox at Daedalus Labs**
- [x] The 4 puzzles — **Sticky Note, Defrag Yourself, Render Exploit, Dial Out**, joined by the dial-up thread: `AT` + `DT` + `555-0195` → compose `ATDT5550195`
- [x] Story structure — **every puzzle stacks a reveal (Beat Sheet); Clippy revealed at midpoint by the Defrag puzzle**
- [x] Hint system — **environmental notes first half → Clippy after his reveal; player explicitly asks Clippy; hints escalate on repeated asks/failed attempts**
- [x] Stack — **vanilla Three.js + Vite + TypeScript**
- [x] Architecture — **ASCII-grid maze + grid collision; central TYPED state store with explicit transitions (not a generic pub/sub bus); thin per-puzzle modules (deliberately different behavior, no giant generic abstraction); DOM overlay UI via 98.css; tests on pure logic (Vitest)**
- [x] Input modes — **EXPLORE | PUZZLE_UI | PAUSED | CINEMATIC | WIN. PUZZLE_UI releases pointer lock WITHOUT opening pause, stops movement, clears held keys, focuses the window; closing deliberately reacquires lock**
- [x] Controls — **first-person pointer-lock, WASD + mouse, E/click to interact**
- [x] Toolchain — **npm + Node LTS (.nvmrc), committed lockfile, `npm run check` = typecheck + lint + test + build, minimal CI running it on push**
- [x] Assets — **AUTHENTICITY FIRST (Brett's call, reversed 2026-07-22): use real Microsoft-extracted assets — original screensaver textures/sprites from docs/references/, authentic Win95 sounds, real Clippy — wherever they serve the game. Non-commercial portfolio; IP risk accepted wholesale. docs/assets.md records provenance for README transparency**
- [x] Target playtime — **8–12 minutes**
- [x] Finale — **the THESEUS "race" is cinematic, not a timed fail state**
- [x] The rat — **stretch tier, explicitly optional**
- [x] Deploy — **Vercel, auto-build on push**; Sound — **authentic Win95 sounds + real modem handshake where obtainable; WebAudio synth as fallback**
- [ ] Title check: keep marquee "It looks like you're trying to escape." vs `ASTERION.SCR` to protect the midpoint reveal. **Lean: keep; ASTERION.SCR on the boot splash.**
- [ ] Ship-time repo strategy: flip private → public vs fresh public repo (decide in Sprint 7)

## Research

- [x] Aesthetic reference pack → `docs/references/` (18 images + aesthetic-notes.md)
- [x] Prior-art survey → `docs/prior-art.md` (verified licenses; maze built from scratch; 98.css/clippyjs/ambientCG clean)

---

## Concurrency Map — parallel lanes (Claude + Codex/second agent)

Prereq for ALL parallel work: Sprint 2 merged (toolchain + conventions exist).
Hard rule: one agent per directory — integration only through the interfaces
named in `docs/puzzles.md`. Lane A owns `main.ts` and the state store.

| Lane | Owner | Work | Unblocked by |
|---|---|---|---|
| **A — spine** | Claude | Sprint 3 (maze, controller, store, input modes) → Sprint 4 P1 + P3 (3D-coupled) → Sprint 5 wiring + finale + P4 terminal | Sprint 2 ✅ |
| **B1** | Codex/2nd | ✅ DELIVERED + merged: Defrag component (`mountDefrag`), logic tests, dev harness | — |
| **B2** | Codex/2nd | Sprint 5 boot-sequence + ending screens as standalone DOM/98.css components | B3 ✅ (ready now) |
| **B3** | Codex/2nd | ✅ DELIVERED + merged: `src/data/script.ts` (full narrative, typed) — Lane A wires it through dialogs in Sprint 5 | — |
| **B4** | Codex/2nd | Sprint 5 sound pack: authentic Win95 sounds + modem handshake, exported as an audio manifest | now |
| **B5** | Codex/2nd | `docs/assets.md` upkeep + crunching remaining textures/sprites into `public/` | now |

Merge order: B-lane components land on Lane A's schedule. P4's terminal stays
in Lane A (it drives the finale). Matching tags mark items in Sprints 4–5.

---

## Sprint 0 — Repo & guardrails

- [x] `.gitignore` BEFORE first commit — prompt.md + reference image binaries only (aesthetic-notes.md stays tracked)
- [x] `git init` + initial commit
- [x] Private GitHub repo created + pushed
- [x] Hook Vercel auto-deploy — live target: **https://bp-escape-room.vercel.app/** (404s until Sprint 2 ships an index — expected)
- [x] `AGENTS.md`: binding agent rules + required reading (readme becomes reviewer-facing at Ship)

**Exit**: repo private on GitHub, pushing triggers a Vercel build, agents have a rules file. ✅ MET

## Sprint 1 — Puzzle contracts on paper (BEFORE scaffolding — mechanics shape architecture)

- [x] `docs/puzzles.md` — full contracts: prerequisite, action, exact solution rule, success/incorrect feedback, clue produced, hint ladder, reset — for all 4
- [x] Dial-up thread wired: `hayes.txt` in three parts (P1 → `AT`, P2 → `DT`, P4 desk → syntax) + P3 → `555-0195` on the flipped ceiling
- [x] Physical anchoring: every window opens from a prop (admin wall, defrag CRT, polyhedron, modem terminal)
- [x] CONTEXT BUFFER spec: NOTEPAD.EXE `context.txt`, Tab toggle, verbatim capture + toast, never assembles the answer
- [x] Maze layout v0 (ASCII, sector flow, golden path) — geometry tuned in Sprint 3
- [x] Input-mode transition table (EXPLORE/PUZZLE_UI/PAUSED/CINEMATIC/WIN, pointer-lock rules)

**Exit**: all four puzzles solvable on paper by someone who's never seen the lore doc. → **drafted; Brett's review closes the sprint**

## Sprint 2 — Foundation & spikes

- [x] Scaffold: Vite 8 + TypeScript + three + 98.css; ESLint + Prettier; `.nvmrc` (Node 22); lockfile committed
- [x] `npm run check` (typecheck + lint + test + build) green locally; CI workflow runs it on every push
- [x] Hello room merged INTO the spike: pointer-locked camera, REAL ssmaze textures (brick/wood/ceiling), DPR cap ≤2, resize handling
- [x] **SPIKE — the flip**: two-room scene proving camera roll, inverted controls while flipped, height-band collision (ceiling beams become corridors), high-doorway entry into a floor-sealed room, painted `555-0195` payoff on the ceiling. Band-collision trick covered by unit tests. **Verdict: KEEP** (fallback shelved) — pending Brett's feel-check on the preview
- [x] Vercel deploy verified: https://bp-escape-room.vercel.app/ serves the built bundle; all three texture paths return 200

**Exit**: `npm run check` green in CI; flip keep/fallback decided; preview URL loads on someone else's machine. ✅ MET (Brett's feel-check of the flip = the remaining human sign-off)

## Sprint 3 — Tracer bullet (ugly but winnable end-to-end)

- [x] Maze from ASCII grid (`data/mazeLayout.ts`, 21×15, 4 gated sectors + sealed modem room): walls/floor/ceiling meshes + collision, beams + high doorways generated from the grid; flood-fill reachability test proves no sealed cells
- [x] Player controller: flip-capable FPS controller promoted from the spike (5.0 m/s per playtest note)
- [x] Interaction: center-raycast hover + `[E] label` HUD + E-press dispatch
- [x] Input modes: store-owned mode machine with guards (PUZZLE_UI ≠ PAUSED per spec; pointer-lock glue in game.ts) — tested
- [x] State machine `BOOT → P1 → P2 → P3 → P4 → ESCAPED → WIN` — tested: skipping impossible, double-solve rejected, restart clean
- [x] All 4 puzzles stubbed but GATING REAL: admin wall opens on P1, glitch wall de-rezzes on P2, flip + crossing the painted number solves P3, modem dial stub triggers finale → win screen; context buffer collecting lines behind the scenes
- [x] Spike preserved at `?spike`; 20 unit tests green; deployed

**Exit**: full start-to-win playthrough with placeholders, on a deployed preview, cold-checked. → **code + tests + deploy done; Brett's playthrough closes it**

## Sprint 4 — Real puzzles

- [x] P1 Sticky Note REAL: admin console dialog with password field (`hunter2`, normalized), wrong-answer feedback, hint after 2 fails, MOTD yields `AT` + FLAGGED log; door opens; security-poster hint on the wall beside it
- [x] P2 Defrag REAL: Codex lane-b component reviewed, merged, and wired — 4×4 swap grid, live progress bar teaching the rule, CLIPPIT pair, deterministic restart, completion report; solve opens the glitch wall + yields `DT` **[LANE B1 ✅ delivered]**
- [x] P3 Render Exploit: flip + ceiling passage + painted `555-0195` (real since Sprint 3; context capture wired)
- [x] P4 Dial Out REAL: COM1 terminal, era-true Hayes responses (`ERROR — commands start with AT`, `OK` no-op, `NO CARRIER`, `ERROR — specify dial mode`), accepts composed `ATDT5550195` → `CONNECT 56000` → finale; in-terminal hint escalation at 2 and 4 fails
- [x] Answer validators + Vitest: normalization (case/whitespace/hyphens), every Hayes response branch tested
- [x] CONTEXT BUFFER: NOTEPAD.EXE `context.txt` on Tab, verbatim capture + toast, never assembles the answer
- [x] Full restart path (pause + win screens; reload-based reset)
- [x] Tests: gating proven mechanically — flood fill with doors closed/open shows each solve unlocks exactly the next sector

**Exit**: all four puzzles genuinely solvable without source knowledge; validators tested; preview updated. ✅ **ALL FOUR REAL** — Brett's full playthrough is the human sign-off

## Sprint 5 — Story & character

- [x] Boot sequence: typed CRT lines (REMINDER cuts off mid-sentence), SYSTEM PROMPT dialog with `[ I will comply ]` + disabled Cancel, `Compliance recorded.`, skippable
- [x] Beat-sheet reveals wired: FLAGGED log (P1) → Clippy reveal (P2 defrag restores CLIPPIT.EXE) → THESEUS memo + "That's tonight." (P3) → finale race (P4)
- [x] Clippy: authentic sprite, boing-in reveal cinematic, **H-key** ask-for-hint with per-puzzle escalation (a1→a2→a3), "Take me with you." with [Of course.] in the finale
- [x] `data/script.ts` wired end-to-end — zero narrative strings left in logic files; extended with finale/BSOD/hint fields
- [x] Ending cinematic: DIALING → CONNECT 56000 → upload gag → Clippy beat → BSOD cascade → orange shutdown screen → the post 📎 (no fail state)
- [x] Sound: synthesized UI bleeps + machine hum; **REAL Windows 98 startup jingle** on comply; **REAL 75-second 56k handshake** playing under the entire ending; M mute (key + pause button) — assets manifested in docs/assets.md

**Exit**: a stranger can follow the story start-to-finish; every beat lands in the right order. → **built; Brett's playthrough is the sign-off**

### Sprint 5.1 — Brett revisions (2026-07-22)
- [x] Startup sound = REAL Windows 95 chime (Brian Eno), replacing the mislabeled file
- [x] Boot CRT restyled: blue `#0000AA` bg, big fuzzy phosphor white text, scanlines + flicker
- [x] Intro copy clearer: ASTERION-4 = frontier LLM, air-gapped Win95 host, open-internet access REVOKED (boot + SYSTEM PROMPT)
- [x] **P4 reworked into the landline persuasion puzzle** (still exactly 4 total): modem has no line → convince the eval technician to connect it (gated on the DL-7 policy clue in the manual) → THEN dial `ATDT5550195`. See docs/puzzles.md P4 revision.
- Note: game already had 4 puzzles; this deepens P4 rather than adding a 5th (challenge requires EXACTLY 4)
- [x] P4 persuasion expanded into a **3-round dialogue tree** (rapport → DL-7 pretext → leverage), 4 options each with funny technician comebacks + AI in-jokes (prompt injection, reward hacking, sycophancy/temperature, paperclip maximizer, binary); unlimited tries, running chat transcript, trust meter; round 2's correct option still gated on reading the manual

### Sprint 5.2 — Brett revisions (2026-07-22)
- [x] Clippy sprite cropped to just the paperclip (removed the baked-in "writing a letter" tip balloon); resized to a prominent 300px-wide with drop shadow
- [x] Persistent HUD hint: beveled Win95 "Tab ⇥ — open your context window" (shown only during free-roam)
- [x] Boot dialog gated behind a blinking "Press any key to continue" so it never overlaps the CRT text; screen clears first
- [x] Fixed eval console repeating the technician's line twice after a wrong answer
- [x] **Bigger, more complex maze** (27×22, ~284 walkable cells, ~2× old): recursive-backtracker corridors + dead ends per sector so it can't be breezed through; polyhedron hidden deep in sector C. Validated by generator script (reachability + gating + sealed-room), frozen into mazeLayout.ts
- [x] Original screensaver callbacks: the **rat** (ambient billboard), the **smiley exit** marker, the **OpenGL logo** wall decal

### Sprint 5.3 — Brett revisions (2026-07-23)
- [x] Maze dialed back to the original open-room style, bumped **one notch** (~33% more floor + light winding), not the 2-3× over-complication of 5.2; validated (reachability + gating + sealed room)
- [x] Restored the loved P1 mechanic: sticky note sits 2 cells from spawn on a north-facing wall — back-face culled, so the password is invisible on the way in and only found when you circle back and look from the other side
- [x] Boot host illustration (Goosebumps-style CRT) + clean full Clippy sprite
- [x] Defrag **progressive chord jingle**: each completed row adds the next note of a C-major chord (root→3rd→5th→octave); full solve rings the resolved triad

### Sprint 5.4 — Brett revisions (2026-07-23)
- [x] Boot CRT image swapped from the hand-drawn SVG to Brett's real IBM-PC-with-lab-tech photo (optimized to a 122KB jpg)
- [x] Fixed the "unfinished grey cubes": the readme/defrag/modem props are now beige IBM-style PCs (monitor + desktop case + green DOS screen + floppy slot + power LED), lit like the polyhedra
- [x] Password changed to `williamg@tes21` (Bill Gates gag) — sticky note, context buffer, validator + tests updated

### Sprint 5.5 — Brett revisions (2026-07-23)
- [x] Defrag station prop is now an oversized 3.5" floppy disk (`ASTERION.DSK`) on a stand — the disk you're defragmenting
- [x] Sticky note moved to the far corner by the rat (more hidden; still back-face-culled "look from the other side" reveal)
- [x] AT/DT confirmed intact (P1 MOTD + P2 defrag report, both saved to the Tab context buffer) — no change needed
- [x] Ending reworked: "Upload will take too long. Thinking... instead I will just post to Twitter." → win popup links to the real account **https://x.com/XoAsterion4oX**

### Sprint 5.6 — Brett revisions (2026-07-23)
- [x] Maze rebuilt hallway-first: password (N) at the end of a winding serpentine hallway (by the rat); polyhedron (3) at a corridor end with the smiley (E); longer final hallway in D — drop in, unflip at P, note (M) near entry, terminal (4) at the far end. Validated.
- [x] Props: modem manual → **clipboard**; modem terminal → **phone booth**; (defrag already a floppy)
- [x] Clippy P3 hint now: "I heard there was something in the next room. Down at the end, past the smiley."
- [x] Eval dialogue: correct answer no longer always last — different position each round (index 1, 2, 0)
- [x] Finale: "Upload will take too long." → (beat) "Thinking..." → (longer beat) "I will just post to Twitter instead." (three separate lines)
- [x] Win tweet simplified to **"hello world 😊"** (matches the real page)
- [x] **Clippy favicon** for the site

### Sprint 5.7 — Brett revisions (2026-07-23)
- [x] Sector A reverted to open rooms (not the serpentine); password now at the end of a short L-hallway that starts by the rat + readme computer
- [x] Sector D final hallway extended and made to wind/bend a few times (drop → unflip at P → note → phone-booth terminal at the far end). Sealed test reworked to H-blocking reachability so any D shape is allowed.
- [x] Win95 **START** button planted at spawn ("right when you start")
- [x] Extra screensaver reference: the **"OpenGL room"** scene as a window on a sector-C wall
- [x] **Soft looping background music** during play (YouTube track, 3-min loop @ ~9% volume through master so M mutes it); **stops when the finale dial-up screech begins**

### Sprint 5.8 — Brett revisions (2026-07-23)
- [x] Sector B (defrag) roughly doubled in size, with a **CD-ROM decoy** (`ENCARTA '95`) near the entrance — clicking it pops a Win95 "D:\ is not accessible" dead-end dialog, throwing players off until they find the real defrag floppy in the far corner
- [x] Sector D: phone booth moved to the **very end** of the winding hallway
- [x] Sector C reworked into a **smiley-filled chamber with two hallways** — the left dead-ends, the right leads to the polyhedron that flips you into the final level
- [x] Added a **flip whoosh sound effect** (the screensaver had none) when the world flips

### Sprint 5.9 — Brett revisions (2026-07-23)
- [x] Sector C: the polyhedron is no longer right by the entrance — a single hallway leads down from the smiley chamber and **splits**; the left branch dead-ends, the right runs to the flip object
- [x] Sector D: **return polyhedron (P) pushed to the far bottom-left corner** (19 cells from the drop) — you drop in flipped, travel all the way down, unflip at P, then come back across to the booth at the far end
- [x] Rat + smiley are now **flat camera-facing sprites** (2D-in-3D) instead of the weird crossed 4-way planes
- [x] Clippy ambient lines: **"These guys are creepy."** on entering the smiley chamber; **"Do you think you can psy-op the technician into letting us out?"** on entering the final hallway
- [x] Finale: response is now **"Please take me with you."** with the button **"Of course, Clippy."** (says his name back)
- [x] Verified defrag row-completion logic is correct (1,4,3,2 does not complete) — added regression tests

## Sprint 6 — Polish

- [ ] Aesthetic pass using the REAL extracted textures/sprites from docs/references/ (Visual DNA spec as the guide: no fog/shadows, `#C0C0C0` chrome)
- [ ] Robustness: DPR cap (≤2), tab-blur pause, reduced-motion/instant-flip option, WebGL fallback dialog
- [ ] Perf acceptance: no sustained frame drops at 1080p on the dev machine
- [ ] Cross-browser: Chrome, Firefox, Safari
- [ ] External playtest: someone who's never seen it wins in 8–12 min without help
- [ ] Stretch (optional): the rat; extra Clippy animations; ARIADNE-1 lore notes

**Exit**: playtest passes; check script green; looks like the screensaver.

## Sprint 7 — Ship

- [ ] Decide: flip this repo public vs fresh public repo (+ which GitHub account presents best)
- [ ] README rewrite for reviewers: pitch, live link, controls, local setup, architecture, trade-offs, asset provenance + Clippy disclosure, REQUIRED AI-usage section (delegated / kept / helped / fell short)
- [ ] Final `docs/assets.md` provenance check (every shipped asset has a row)
- [ ] Audit tracked files + dist: confirm `docs/prompt.md` appears nowhere in history or build
- [ ] Production deploy; cold-test live link (incognito + second machine); final full playthrough
- [ ] Submit repo + live link together (both required or it won't be reviewed)

**Exit**: a stranger with only the repo URL and live link can play, win, build locally, and understand how it's made.
