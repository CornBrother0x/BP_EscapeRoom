# AGENTS.md — Binding Rules for All Coding Agents

## Required reading, in order

1. `to-do.md` — THE product spec and sprint plan. All work flows from it.
2. `docs/puzzles.md` — exact puzzle contracts, input modes, progression.
3. `docs/lore.md` — story bible: characters, beat sheet, scripts, tone.
4. `docs/references/aesthetic-notes.md` — Visual DNA to match.
5. `docs/prior-art.md` — what may be used vs only studied (licenses).

## Rules

1. **Work off `to-do.md`.** Check items off as they complete. Newly discovered
   tasks get added there, not tracked in your head.
2. **Never commit** `docs/prompt.md` (gitignored). This is Crossmint
   confidentiality — never force-add it, and never quote the challenge
   brief's text into any tracked file. History is forever.
3. **Asset manifest**: when an external asset (texture, sound, font) enters
   the project, add a row to `docs/assets.md` with its source, rights holder,
   license or permission status, and shipped path. Unresolved redistribution
   rights block submission.
4. **Asset policy**: aesthetic references guide original or clearly licensed
   replacements. Do not ship extracted, ripped, or downloaded media solely
   because it is publicly accessible. Authenticity does not override
   redistribution rights.
5. **Code conventions**: TypeScript strict, no `any` without a comment
   justifying it. ALL narrative/UI text lives in `src/data/script.ts` — none
   hardcoded in logic. Puzzle modules stay independent (no generic
   mega-abstraction). Central typed state store with explicit transitions.
   Input modes exactly per `docs/puzzles.md`. No physics engine, no
   procedural generation, no runtime dependencies beyond three.js, 98.css,
   clippyjs without a Decisions entry in `to-do.md`.
6. **Tests**: pure logic only (state transitions, answer validators, grid
   collision/reachability) in Vitest. `npm run check` (typecheck + lint +
   test + build) must pass before every commit.
7. **Commits**: small and logical, plain descriptive messages. Every push
   auto-deploys a Vercel preview: https://bp-escape-room.vercel.app/
8. **Scope discipline**: exactly 4 puzzles, sequentially gated, winnable,
   in-world hints, desktop browser only, 8–12 minute playtime. When in doubt,
   cut scope — never quality.
9. **Aesthetic fidelity**: match the Visual DNA — sampled palette, chunky
   low-res textures, no fog, no shadows, `#C0C0C0` beveled chrome, MS Sans
   Serif-style UI.
