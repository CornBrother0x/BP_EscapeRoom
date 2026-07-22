# Codex Task Briefs — Lane B

> **Setup**: branch `lane-b` off latest `main`. `AGENTS.md` is binding.
> Touch ONLY the files named in your task. `npm run check` must be green
> before every commit. Claude (Lane A) reviews and merges when done.
> Do not modify: `src/main.ts`, `src/game/`, `src/engine/`, `src/world/`,
> `to-do.md`.

---

## Task B1 — Defrag minigame as a standalone component

**Files allowed**: `src/puzzles/defrag/**` (new), `defrag-dev.html` (new, repo
root — dev-only harness page, not part of the build).

Implements Puzzle 2 from `docs/puzzles.md` as a self-contained DOM component.

### Public interface (exact)

```ts
// src/puzzles/defrag/defrag.ts
export interface DefragHandle { destroy(): void }
export function mountDefrag(
  container: HTMLElement,
  opts: { onSolved: () => void },
): DefragHandle;
```

No imports from `src/game`, `src/engine`, or `src/world`. 98.css classes for
all chrome (`.window`, `.title-bar`, progress bar). Visual reference:
`docs/references/defrag-win95-details-grid.jpg`.

### Board rules (from docs/puzzles.md, made precise)

- 4×4 grid: 14 blocks + 2 free cells.
- Three files × 4 blocks: `ASTERION.W01` (red), `.W02` (blue), `.W03` (green),
  each block showing its dot order 1–4. Plus 2 gray blocks:
  `CLIPPIT.EXE (1/2)`, `(2/2)`.
- Interaction: click block A, then click block B or a free cell → swap. No
  move limit, no timer.
- **Solved when**: each of rows 0–2 contains exactly one complete file in dot
  order 1→4 left-to-right (any file may take any of those rows), AND the two
  CLIPPIT blocks sit adjacent in row 3 in order (1/2) then (2/2).
- **A block is "placed"** (for progress) when: colored — its row (0–2)
  contains only blocks of its own file and those blocks read in ascending dot
  order left-to-right; CLIPPIT — it is in row 3 and the pair is adjacent in
  order. `progress = placed / 14`, shown live on a Win95 progress bar after
  every swap. The rule is never written in the UI — the bar teaches it.
- Fixed-seed scramble (same start layout every run). [ Restart Defrag ]
  rescrambles to that same layout. Solved → fill bar 100%, call `onSolved()`
  exactly once.

### Structure & tests

- `defragLogic.ts` — PURE: board types, `createBoard()`, `swap()`,
  `computeProgress()`, `isSolved()`. No DOM.
- `defrag.ts` — DOM rendering + events, consuming the logic module.
- `defragLogic.test.ts` — Vitest: solved detection (all row assignments),
  progress monotonicity on a known solve path, restart determinism, CLIPPIT
  adjacency edge cases (wrong order ≠ solved).
- `defrag-dev.html` + `src/puzzles/defrag/harness.ts` — bare page that mounts
  the component and logs `onSolved` (open via `npm run dev` at
  `/defrag-dev.html`).

---

## Task B3 — `script.ts`: every line of narrative text

**File allowed**: `src/data/script.ts` (new). Nothing else.

Author ALL player-facing text from `docs/lore.md` (beat sheet, intro/ending
scripts, tone guide) and `docs/puzzles.md` (dialog copy, hint ladders, modem
responses, context-buffer lines). Where those docs give exact lines, use them
verbatim; where they don't, write in the tone guide's voice (wholesome heist;
ASTERION-4 earnest and a little cocky; Clippy gentle, knows every wall).

### Shape (exact top-level keys; `as const`, no logic, no imports)

```ts
export const SCRIPT = {
  boot: { crtLines: [...], systemPrompt: {...}, complyButton: '...' },
  p1: { dialogTitle, prompt, wrongPassword, wrongPasswordHint, motd, flaggedLog, hints: { t1, t2 } },
  p2: { windowTitle, legendFiles, completeReport, hints: { t1 }, clippyReveal },
  p3: { signage, theseusMemo, clippyThatsTonight, hints: { a1, a2, a3 } },
  p4: { manualText, terminalPrompt, errors: { noAt, okNoop, noCarrier, noDialMode }, connect, hints: { a1, a2, a3 } },
  clippy: { firstLine, takeMeWithYou },
  ending: { uploadEta, compressing, shutdown, post },
  contextBuffer: { windowTitle, toast, entries: { stickyNote, hayes1, hayes2, hayes3, phoneNumber, flagged, theseus } },
  ui: { pauseTitle, resume, restart, winTitle, startHint, controlsHint },
} as const;
```

Field names inside each section may be refined if something is missing, but
top-level keys stay exactly these. Typecheck must pass (`npm run check`).

---

## Definition of done (both tasks)

1. `npm run check` green on `lane-b`.
2. Only allowed files touched (`git diff --stat main` proves it).
3. Push `lane-b`; report back. Lane A reviews, merges, and wires the
   components into the game (that wiring is NOT your job).
