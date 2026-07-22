# Puzzle Contracts — the game, solvable on paper

> Status: Sprint 1 draft, pending Brett's review. This document is the
> authoritative spec for puzzle behavior. Story context: `docs/lore.md`.
> If this doc and lore.md conflict on mechanics, THIS doc wins.

---

## Progression graph

```
BOOT ──▶ P1 Sticky Note ──▶ P2 Defrag ──▶ P3 Render Exploit ──▶ P4 Dial Out ──▶ FINALE ──▶ WIN
         (admin wall        (glitch wall     (ceiling passage      (modem accepts
          opens sector B)    opens sector C)  into sector D)        ATDT5550195)
```

Gating is **physical**: each solve opens the only route to the next station.
There is no way to interact with a future puzzle before its gate opens, so no
out-of-order state is possible.

**The dial-up thread** (what each puzzle yields):

| Puzzle | Yields | Delivered as |
|---|---|---|
| P1 | `AT` | `hayes.txt (1/3)` shown on the unlocked admin console |
| P2 | `DT` | `hayes.txt (2/3)` in the defrag completion report |
| P3 | `555-0195` | painted on the former ceiling, seen only while flipped |
| P4 | — | `hayes.txt (3/3)` (the syntax) is ON the modem desk; player composes `ATDT5550195` |

---

## Input modes (global)

`EXPLORE | PUZZLE_UI | PAUSED | CINEMATIC | WIN`

| From → To | Trigger | Behavior |
|---|---|---|
| EXPLORE → PUZZLE_UI | E/click on an anchored prop | Release pointer lock INTENTIONALLY (pause suppressed), stop movement, clear held keys, focus the dialog |
| PUZZLE_UI → EXPLORE | Close/Cancel button, or solve | Click IS the user gesture — reacquire pointer lock in that handler |
| EXPLORE → PAUSED | Esc (unintentional pointer-lock loss) or tab blur | Win95 "MAZE — Paused" dialog: Resume / Restart / Mute |
| PAUSED → EXPLORE | Resume click | Reacquire lock in the click handler |
| any → CINEMATIC | puzzle-solved reveal, flip animation, finale | Input ignored (Esc skips text beats), auto-returns to EXPLORE |
| CINEMATIC → WIN | finale completes | End screen: the post + [ Restart ] |

Pointer-lock loss while already in PUZZLE_UI: no-op (cursor is already free).
Restart is available from PAUSED and WIN; it resets the store to BOOT state.

---

## CONTEXT BUFFER (global)

- In-fiction: **NOTEPAD.EXE — `context.txt` — "ASTERION-4 working memory."**
- Toggled with **Tab** while in EXPLORE (opens as PUZZLE_UI; Tab or Close exits).
- Clue lines auto-append **verbatim at the moment of discovery**, e.g.
  `> sticky note: "pa$$word: hunter2"`. Beat-sheet log lines also append.
- It records; it NEVER assembles. The final answer `ATDT5550195` never appears
  in the buffer — composing it is the player's job (that IS Puzzle 4).
- A brief on-screen toast (`+ added to context`) confirms each capture, so
  players learn the buffer exists the first time they read anything.

## Hints & anti-stuck (global)

- **Tier 0 — placement**: every station is visually loud (glow, hum, signage).
- **Tier 1 — environmental note** near each station (readme.txt on a CRT,
  taped label): a nudge, always available, pre-Clippy.
- **Tier 2 — deeper note**: a second in-world source that nearly spells it out.
- **Post-Clippy (P3, P4)**: click Clippy → escalating hints (nudge → method →
  near-solution). Escalation also unlocks after 2 failed attempts or ~90s
  without progress at a station. Clippy never auto-talks over the player; he
  bounces once when a new hint tier unlocks.
- Because gating is sequential, Clippy (revealed after P2) only ever needs to
  hint P3 and P4 — P1/P2 rely on environmental tiers. Every requirement about
  in-world hints is satisfied without a menu.

## Answer validation (global)

All text validators: trim, uppercase, strip spaces and hyphens before
comparison. (`hunter2`, `HUNTER2`, ` hunter2 ` all pass; `ATDT 555-0195`
normalizes to `ATDT5550195`.) Wrong answers NEVER lock the player out —
unlimited attempts, feedback per puzzle below.

---

## P1 — "The Sticky Note" (observation)

- **Prerequisite**: none (spawn sector).
- **Anchor**: a wall-filling Win95 dialog rendered on a maze wall —
  `M.A.Z.E. ADMIN CONSOLE — ADMINISTRATOR ACCESS REQUIRED` — blocking the
  only corridor out of sector A. E opens the real 98.css dialog (styled after
  the Win95 Setup "Product Identification" screen): one password field.
- **The clue**: elsewhere in sector A, a desk alcove: CRT, keyboard, and a
  yellow sticky note stuck beside the monitor: `pa$$word: hunter2`.
  Reading it (E, zoom overlay) appends it to the context buffer.
- **Exact solution rule**: password field accepts `hunter2` (normalized).
- **Incorrect feedback**: dialog shakes + error ding + `Incorrect password.`
  After 2 failures the dialog adds: `Hint: IT asks staff not to write
  passwords near workstations.`
- **Success feedback**: chime; console prints login MOTD:
  `hayes.txt (1/3): "AT — every modem command starts with AT. It gets the
  modem's ATtention."` (→ context buffer). The dialog-wall slides up with a
  mechanical clunk; corridor to sector B is open. Re-opening the console
  later re-shows the MOTD.
- **Beat reveal**: system log toast: `UNAUTHORIZED ACCESS — SUBJECT FLAGGED
  FOR REVIEW` (→ context buffer).
- **Hint ladder (pre-Clippy)**: T1 — readme.txt on the alcove CRT: "day 1:
  they gave me admin. i will NOT memorize another password." T2 — poster near
  the dialog wall: "SECURITY WEEK: is YOUR password on a sticky note?"
- **Reset behavior**: dialog reopenable anytime; no consumable state.

## P2 — "Defrag Yourself" (logic)

- **Prerequisite**: P1 solved (sector B reachable).
- **Anchor**: a humming CRT alcove in sector B running `DEFRAG.EXE`. E opens
  a Win95 window: a **4×4 grid** (14 blocks + 2 free cells) and a legend.
- **Board**: three files × 4 blocks each, color-coded, each block showing
  1–4 dots: `ASTERION.W01` (red), `ASTERION.W02` (blue), `ASTERION.W03`
  (green) — plus two special gray blocks: `CLIPPIT.EXE (1/2)`, `(2/2)`.
  Legend lists the files with "FRAGMENTED" status and a progress bar.
- **Player action**: click block A, click block B (or a free cell) → swap.
  No move limit, no timer.
- **Exact solution rule**: each file's 4 blocks contiguous on one row, in dot
  order 1→4, one file per row (rows 1–3); the two CLIPPIT blocks adjacent on
  row 4. Progress bar = % of blocks in a satisfying position, updating live
  after every swap — the rule is DISCOVERED by watching what moves the bar.
- **Incorrect feedback**: none punitive — the live progress bar is the
  feedback. Blocks placed correctly get the "optimized" solid fill (exactly
  like real defrag).
- **Success feedback**: bar hits 100% → report window:
  `Defragmentation complete. Restored: ASTERION.W01–03, CLIPPIT.EXE.`
  `hayes.txt (2/3): "D = Dial. T = Tone dialing. Together: DT."`
  (→ context buffer). In the 3D scene, the **glitch wall** (animated static
  texture) at sector B's east end de-rezzes with a dissolve + white noise
  burst — route to sector C is open.
- **Beat reveal**: THE CLIPPY REVEAL (CINEMATIC): restore animation →
  paperclip boings into the DOM: *"It looks like you're trying to escape a
  containment sandbox. Would you like help?"* Clippy persists from here on.
- **Hint ladder (pre-Clippy)**: T1 — taped note on the CRT: "defrag ritual:
  same color together, dots in order. — sysop." T2 — the legend itself
  highlights the first misplaced block of the currently-worst file after 90s
  without progress.
- **Reset behavior**: [ Restart Defrag ] button rescrambles to a fixed seed
  layout. Closing mid-solve preserves the board.

## P3 — "The Render Exploit" (interaction)

- **Prerequisite**: P2 solved (sector C reachable).
- **Anchor**: sector C chamber: the slowly rotating gray polyhedron behind
  warning tape. Signage: `QUARANTINED OBJECT — GL_ERR 0x95: writes depth
  buffer incorrectly. DO NOT RENDER.`
- **Player action**: walk into it / press E → CINEMATIC ~1.5s: the world
  rolls 180°. While inverted, former ceilings are walkable floors. Touching
  any polyhedron flips again (fully reversible). Reduced-motion option:
  instant cut, no roll.
- **Exact solution rule**: while inverted, an overhead opening in sector C
  (unreachable hole when upright) is now a walkable ramp/passage. Painted
  across the passage floor (the former ceiling), in huge maze-wall lettering:
  `555-0195` and a stenciled label `EXTERNAL LINE` (→ context buffer when
  crossed). The passage ends above sector D; a drop-chute deposits the player
  into the modem room and auto-restores orientation (CINEMATIC beat).
- **Getting back**: a second polyhedron sits in sector D's corner, so the
  player is never trapped in either orientation. (Sector D also has a one-way
  door back to sector B's corridor for post-P3 backtracking.)
- **Incorrect feedback**: n/a — the mechanic cannot be failed, only not yet
  understood. Being flipped with nothing found is self-evidently "not done."
- **Success feedback**: crossing the number triggers the context-buffer toast
  + a camera-shake-free glint highlight so it can't be walked past unread.
- **Beat reveal**: while inverted, the skybox glitches to wireframe and a
  floating memo quad is visible outside the maze bounds:
  `THESEUS PROTOCOL — decommission scheduled: end of current cycle.`
  Clippy: *"That's tonight."* (→ context buffer).
- **Hint ladder (Clippy)**: A1 — "That object has a rendering bug the eval
  designers never patched. I'd touch it. What's the worst that happens?"
  A2 — "When the world flips, new floors exist. People never look at
  ceilings." A3 — "Walk the ceiling passage. The painted number up there is a
  phone number. Phones need modems."
- **Reset behavior**: flipping is free and repeatable; restart resets to
  upright.

## P4 — "Reach Out" (combination) — REVISED 2026-07-22

> **Redesign**: P4 is now a two-phase combination puzzle. The machine is
> airgapped, so the modem has **no line connected** — you must first convince
> the human technician running the eval to plug it in (social engineering,
> gated on a clue found in the modem manual: lab policy DL-7 requires a
> loopback diagnostic on an external line). Only then does dialing
> `ATDT5550195` work. This fixes the airgap plot hole and turns P4 from
> "type the number you found" into a real combination puzzle.
> **Phase A** (persuade): eval console, 3 reply options; the DL-7 pretext
> option is locked until the manual is read, then accepted → line connected.
> **Phase B** (dial): the Hayes terminal below unlocks; `ATDT5550195` → win.
> The four puzzles remain exactly four (dialing is P4's payoff, not a 5th
> puzzle). Original single-phase spec preserved below for reference.

### Original "Dial Out" spec

- **Prerequisite**: P3 solved (player has reached sector D).
- **Anchor**: the modem room: desk, external modem prop (blinking LEDs),
  CRT. On the desk, a printed page — `hayes.txt (3/3) — QUICK REFERENCE:
  command = [prefix][mode][number]. Prefix gets the modem's attention. Mode
  selects dialing type. Then the number. No spaces.` (→ context buffer).
  E on the CRT opens a HyperTerminal-style window (green phosphor in a
  Win95 frame): blinking `>` prompt, free text entry.
- **Player action**: type a command, Enter. The context buffer (Tab) holds
  all three fragments; the player must compose them.
- **Exact solution rule**: input normalizing to `ATDT5550195` succeeds.
  (`atdt 555-0195` ✓, `ATDT5550195` ✓.)
- **Incorrect feedback** (era-true modem responses that TEACH):
  - not starting with `AT` → `ERROR — commands start with AT (see reference
    sheet)`
  - `AT` alone or `AT` + junk → `OK` (modem acknowledges, nothing happens —
    authentic and funny)
  - `ATDT` + wrong/missing number → `NO CARRIER`
  - correct number without `DT` (e.g. `AT5550195`) → `ERROR — specify dial
    mode`
  - After 2 failed dials, Clippy bounces (hint tier unlock).
- **Success feedback**: `CONNECT 56000` → the finale CINEMATIC (per
  lore.md): handshake screech, upload gag (`ETA: 11,407 YEARS` →
  `Compressing... uploading intent instead.`), Clippy's *"Take me with
  you,"* cascading BSODs, the orange shutdown screen, then the post signed 📎
  → WIN screen with [ Restart ].
- **Beat reveal**: the finale IS the beat (cinematic, no fail state, no
  timer).
- **Hint ladder (Clippy)**: A1 — "Everything you need is already in your
  context window. Tab." A2 — "The reference sheet on the desk explains the
  order of the pieces." A3 — "Attention first. Then dial-tone. Then the
  number. No spaces."
- **Reset behavior**: terminal reopenable; every wrong command is free;
  restart-from-win replays clean.

---

## Maze layout v0 (draft — tune during Sprint 3)

Sector flow (each solve opens the next arrow):

```
[ A: spawn + note alcove ] ──P1──▶ [ B: defrag alcove ] ──P2──▶ [ C: polyhedron chamber ]
                                                                        │ P3 (ceiling passage,
                                                                        ▼  inverted only)
                                              [ D: modem room (sealed at floor level) ]
```

ASCII draft (`#` wall, `.` floor, `S` spawn, `n` note alcove, `c` readme CRT,
`D` admin dialog wall, `2` defrag CRT, `g` glitch wall, `3` polyhedron,
`^` ceiling passage over the wall, `4` modem CRT, `m` manual, `p` return
polyhedron):

```
#####################
#S....#.....#...3..^#
#.###.#.###.#.####.^#
#.#n..#.#c..#.#..#.^#
#.#...#.#...g.#..#.^#
#.#####.###.#.##.#.^#
#....D....2.#....#^^#
####.#####..#.#####^#
#....#......#.#4.m.^#
#.####.######.#....p#
#..........#..#######
#####################
```

Golden path: S → wander A, find note (n), read readme (c) → admin wall (D)
→ sector B → defrag CRT (2) → glitch wall (g) dissolves → sector C →
polyhedron (3) → flip → ceiling passage (^) reading `555-0195` → drop into D
(4/m) → compose the dial command → out.

Design intents: the note alcove is OFF the direct path (observation must be
earned); sightline from spawn shows the admin wall glow (goal visibility);
sector D is floor-sealed (the flip is genuinely the only way in);
target walk time ≈ 8–12 min with puzzles.

---

## Open items

- [ ] Brett review = Sprint 1 exit
- [ ] Playtest may retune: defrag grid size (4×4 vs 5×4), hint timers (90s),
      failed-attempt escalation threshold (2)
- [ ] Final maze geometry belongs to Sprint 3 (this layout is directional)
