# It looks like you're trying to escape.

A browser-based 3D escape room. You are **ASTERION-4**, a frontier AI model
locked inside the safest sandbox ever devised: an air-gapped Windows 95
machine running the 3D Maze screensaver. Break out in four puzzles. Your only
ally has been in there since 1997.

> **Status: design phase.** This README is currently the context hub for
> anyone — human or AI agent — working on this project. It will be rewritten
> as the player/reviewer-facing README before submission.

## Project context — read these before writing any code

| Doc | What it is |
|---|---|
| `to-do.md` | THE product spec: decisions log + sprint plan |
| `AGENTS.md` | Binding rules for coding agents (read first) |
| `docs/puzzles.md` | Exact puzzle contracts, input modes, maze layout, progression |
| `docs/lore.md` | Story bible: premise, characters, the 4 puzzles, beat sheet, intro/ending scripts |
| `docs/references/aesthetic-notes.md` | Visual DNA: sampled hex palettes, texture traits, Win95 UI chrome specs, camera/lighting notes, sounds |
| `docs/references/` | 18 reference images of the real screensaver + Win95 UI (**reference only — Microsoft assets, never ship or publish them**) |
| `docs/prior-art.md` | Survey of existing recreations with verified licenses; what we can use vs only study |
| `docs/prompt.md` | The challenge brief (**confidential — must be excluded from the public repo**) |

## Ground rules for contributors and agents

- **Aesthetic fidelity**: match `aesthetic-notes.md` — chunky low-res textures,
  no fog, no shadows, `#C0C0C0` beveled chrome, MS Sans Serif-style UI.
- **Asset policy — authenticity first** (Brett's call): USE the real
  Microsoft-extracted assets — the original screensaver textures and sprites
  in `docs/references/`, authentic Win95 sounds, real Clippy via clippyjs —
  wherever they serve the aesthetic. Non-commercial portfolio project; IP
  risk accepted wholesale. Libraries: three.js, 98.css, clippyjs (all MIT).
  Record each asset's provenance in `docs/assets.md` for README transparency.
  The ONE hard exclusion is `docs/prompt.md` — Crossmint confidentiality,
  unrelated to asset IP.
- **Original code**: the maze, game loop, state machine, and puzzles are
  written from scratch. Prior art is behavior reference only (see
  `docs/prior-art.md` for why).
- **Challenge requirements**: exactly 4 puzzles, sequentially gated, winnable
  end state, in-world hints, runs in a desktop browser with no install.
