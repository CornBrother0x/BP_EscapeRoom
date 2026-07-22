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
| **B1** | Codex/2nd | Sprint 4 P2 Defrag as a standalone DOM component: `mountDefrag(el, onSolved)` + its own dev harness page | puzzles.md contract (now) |
| **B2** | Codex/2nd | Sprint 5 boot-sequence + ending screens as standalone DOM/98.css components | B3 script draft |
| **B3** | Codex/2nd | Sprint 5 `data/script.ts` — author ALL narrative text from lore.md | lore.md ✅ (now) |
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

- [ ] P1 Sticky Note: admin dialog (98.css) anchored to a terminal prop; password found in world → yields `AT`
- [ ] P2 Defrag: DOM minigame in a Win95 window on a CRT prop, concrete ordering rule → yields `DT`, de-rezzes the glitch wall **[LANE B1]**
- [ ] P3 Render Exploit: flip mechanic (or decided fallback) + ceiling passage + `555-0195` on former ceiling
- [ ] P4 Dial Out: modem terminal + in-world manual; accepts composed `ATDT5550195`
- [ ] Answer validators + Vitest: normalization (case/whitespace/hyphens), rejection feedback
- [ ] CONTEXT BUFFER implemented; clues auto-append on discovery
- [ ] Full restart path (from any state, including post-win)
- [ ] Tests: grid collision + maze reachability (every station reachable from spawn)

**Exit**: all four puzzles genuinely solvable without source knowledge; validators tested; preview updated.

## Sprint 5 — Story & character

- [ ] Boot sequence: CRT text + SYSTEM PROMPT dialog (`[ I will comply ]`) **[LANE B2]**
- [ ] Beat-sheet reveals wired to puzzle completions (flagged log → Clippy reveal → THESEUS memo → finale)
- [ ] Clippy: restored by Defrag; explicit ask-for-hint UX with escalation; "take me with you"
- [ ] `data/script.ts`: every line of narrative text finalized in one file **[LANE B3]**
- [ ] Ending cinematic: handshake → upload gag → BSOD cascade → shutdown screen → the post 📎 (CINEMATIC mode, no fail state)
- [ ] Sound: authentic Win95 sounds, handshake, ambient hum + mute control **[LANE B4]**

**Exit**: a stranger can follow the story start-to-finish; every beat lands in the right order.

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
