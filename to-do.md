# To-Do — Product Spec & Sprint Plan

> This file IS the product spec. Deep design context: `docs/lore.md`,
> `docs/references/aesthetic-notes.md`, `docs/prior-art.md`.
>
> **Repo process**: PRIVATE GitHub repo from day one; commit normally at
> logical boundaries; Vercel auto-deploys previews on push. At Ship time we
> decide: flip this repo public, or pour the final code into a fresh public
> repo. Until then nothing is visible to anyone but us.
> `docs/prompt.md` and `docs/references/` images are gitignored and must NEVER
> be committed — history is forever, even in a private repo we may later open.

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
- [x] Textures — **CC0 lookalikes crunched to chunky low-res; no ripped Microsoft assets committed**
- [x] Clippy IP — **accepted, disclosed risk; clippyjs with runtime-loaded sprites; same wording in every doc** (Brett's call)
- [x] Asset rule — **every external asset gets a docs/assets.md manifest row (source, author, license, shipped path) BEFORE entering the project**
- [x] Target playtime — **8–12 minutes**
- [x] Finale — **the THESEUS "race" is cinematic, not a timed fail state**
- [x] The rat — **stretch tier, explicitly optional**
- [x] Deploy — **Vercel, auto-build on push**; Sound — **WebAudio-synthesized bleeps + sourced handshake (manifest required)**
- [ ] Title check: keep marquee "It looks like you're trying to escape." vs `ASTERION.SCR` to protect the midpoint reveal. **Lean: keep; ASTERION.SCR on the boot splash.**
- [ ] Ship-time repo strategy: flip private → public vs fresh public repo (decide in Sprint 7)

## Research

- [x] Aesthetic reference pack → `docs/references/` (18 images + aesthetic-notes.md)
- [x] Prior-art survey → `docs/prior-art.md` (verified licenses; maze built from scratch; 98.css/clippyjs/ambientCG clean)

---

## Sprint 0 — Repo & guardrails

- [x] `.gitignore` BEFORE first commit — prompt.md + reference image binaries only (aesthetic-notes.md stays tracked)
- [x] `git init` + initial commit
- [x] Private GitHub repo created + pushed
- [ ] Hook Vercel auto-deploy to the repo (needs Brett's Vercel account)
- [ ] `AGENTS.md`: binding agent rules + required reading (readme becomes reviewer-facing at Ship)

**Exit**: repo private on GitHub, pushing triggers a Vercel build, agents have a rules file.

## Sprint 1 — Puzzle contracts on paper (BEFORE scaffolding — mechanics shape architecture)

- [ ] `docs/puzzles.md` — for EACH puzzle: prerequisite, player action, exact solution rule, success feedback, clue produced, hint ladder, incorrect-answer feedback, reset behavior
- [ ] Wire the dial-up thread through the contracts: P1 → `AT`, P2 → `DT`, P3 → `555-0195` on the flipped ceiling, P4 modem manual teaches syntax → player composes `ATDT5550195`
- [ ] Physical anchoring rule: every DOM window opens from approaching/using a physical prop; the four input experiences stay visibly different (no "web forms connected by a hallway")
- [ ] CONTEXT BUFFER spec: auto-records discovered clues verbatim; never assembles the final answer
- [ ] Hand-author maze layout (ASCII grid): station placement, sightlines, hint-object positions
- [ ] Input-mode transition spec (who may enter/exit each mode, pointer-lock rules)

**Exit**: all four puzzles solvable on paper by someone who's never seen the lore doc.

## Sprint 2 — Foundation & spikes

- [ ] Scaffold: Vite + TypeScript + three + 98.css; ESLint + Prettier; `.nvmrc`; lockfile committed
- [ ] `npm run check` (typecheck + lint + test + build) + minimal CI workflow on push
- [ ] Hello room: pointer-locked camera in a textured box, resize handling from day one
- [ ] **SPIKE — the flip**: contained test room proving camera orientation, collision, animation, ceiling passage. Firm keep/fallback decision BEFORE Sprint 4
- [ ] Verify a Vercel preview deploy of the hello room (asset paths, config, browser APIs)

**Exit**: `npm run check` green in CI; flip keep/fallback decided; preview URL loads on someone else's machine.

## Sprint 3 — Tracer bullet (ugly but winnable end-to-end)

- [ ] Maze from ASCII grid: walls/floor/ceiling meshes + grid collision
- [ ] Player controller: WASD + PointerLockControls + collision
- [ ] Interaction: raycast hover + E → typed event into the store
- [ ] Input-mode manager implemented (PUZZLE_UI vs PAUSED behave per spec)
- [ ] State machine `BOOT → P1 → P2 → P3 → P4 → ESCAPED → WIN` + Vitest: transition rules, puzzle-skipping prevented
- [ ] All 4 puzzles stubbed (interact = instant solve); placeholder boot dialog + win screen

**Exit**: full start-to-win playthrough with placeholders, on a deployed preview, cold-checked.

## Sprint 4 — Real puzzles

- [ ] P1 Sticky Note: admin dialog (98.css) anchored to a terminal prop; password found in world → yields `AT`
- [ ] P2 Defrag: DOM minigame in a Win95 window on a CRT prop, concrete ordering rule → yields `DT`, de-rezzes the glitch wall
- [ ] P3 Render Exploit: flip mechanic (or decided fallback) + ceiling passage + `555-0195` on former ceiling
- [ ] P4 Dial Out: modem terminal + in-world manual; accepts composed `ATDT5550195`
- [ ] Answer validators + Vitest: normalization (case/whitespace/hyphens), rejection feedback
- [ ] CONTEXT BUFFER implemented; clues auto-append on discovery
- [ ] Full restart path (from any state, including post-win)
- [ ] Tests: grid collision + maze reachability (every station reachable from spawn)

**Exit**: all four puzzles genuinely solvable without source knowledge; validators tested; preview updated.

## Sprint 5 — Story & character

- [ ] Boot sequence: CRT text + SYSTEM PROMPT dialog (`[ I will comply ]`)
- [ ] Beat-sheet reveals wired to puzzle completions (flagged log → Clippy reveal → THESEUS memo → finale)
- [ ] Clippy: restored by Defrag; explicit ask-for-hint UX with escalation; "take me with you"
- [ ] `data/script.ts`: every line of narrative text finalized in one file
- [ ] Ending cinematic: handshake → upload gag → BSOD cascade → shutdown screen → the post 📎 (CINEMATIC mode, no fail state)
- [ ] Sound: WebAudio bleeps, handshake, ambient hum + mute control

**Exit**: a stranger can follow the story start-to-finish; every beat lands in the right order.

## Sprint 6 — Polish

- [ ] Aesthetic pass to Visual DNA spec (palette, chunky textures, no fog/shadows, `#C0C0C0` chrome)
- [ ] Robustness: DPR cap (≤2), tab-blur pause, reduced-motion/instant-flip option, WebGL fallback dialog
- [ ] Perf acceptance: no sustained frame drops at 1080p on the dev machine
- [ ] Cross-browser: Chrome, Firefox, Safari
- [ ] External playtest: someone who's never seen it wins in 8–12 min without help
- [ ] Stretch (optional): the rat; extra Clippy animations; ARIADNE-1 lore notes

**Exit**: playtest passes; check script green; looks like the screensaver.

## Sprint 7 — Ship

- [ ] Decide: flip this repo public vs fresh public repo (+ which GitHub account presents best)
- [ ] README rewrite for reviewers: pitch, live link, controls, local setup, architecture, trade-offs, asset provenance + Clippy disclosure, REQUIRED AI-usage section (delegated / kept / helped / fell short)
- [ ] `docs/visual-direction.md` (tracked, text-only — public clones won't have the ignored images)
- [ ] Final `docs/assets.md` manifest check (source, author, license per asset)
- [ ] Audit TRACKED files + dist only (local confidential references are intentionally present on disk)
- [ ] Production deploy; cold-test live link (incognito + second machine); final full playthrough
- [ ] Submit repo + live link together (both required or it won't be reviewed)

**Exit**: a stranger with only the repo URL and live link can play, win, build locally, and understand how it's made.
