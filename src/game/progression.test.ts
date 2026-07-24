/**
 * End-to-end proof at the logic layer: the game is winnable, and only via the
 * real answers. Chains the actual solve predicates (password check, defrag
 * solvability, technician persuasion, dial command) through the state machine
 * from BOOT to WIN. The 3D/DOM wiring on top is exercised by playing (and by
 * the e2e boot smoke test); this proves the underlying puzzle logic connects.
 */
import { describe, expect, it } from 'vitest';
import { SCRIPT } from '../data/script';
import { Store } from './state';
import { classifyDialCommand, isAdminPassword } from './validators';
import { createEvalState, pickOption } from './evalConsole';
import {
  createBoard,
  isSolved,
  swap,
  type DefragBoard,
  type DefragCell,
  type WeightFile,
  type WeightOrder,
} from '../puzzles/defrag/defragLogic';

const STAGES = SCRIPT.p4.eval.stages;
const correctIndex = (s: number) => STAGES[s].options.findIndex((o) => o.correct);

/**
 * Solve the fixed defrag scramble. Because any two cells can be swapped, a
 * selection sort into the target layout always solves it in ≤16 swaps — which
 * proves the scramble is genuinely solvable, not just that a solved state exists.
 */
function solveDefrag(): boolean {
  const w = (file: WeightFile, order: WeightOrder): DefragCell => ({ kind: 'weight', file, order });
  const target: DefragBoard = [
    w('ASTERION.W01', 1),
    w('ASTERION.W01', 2),
    w('ASTERION.W01', 3),
    w('ASTERION.W01', 4),
    w('ASTERION.W02', 1),
    w('ASTERION.W02', 2),
    w('ASTERION.W02', 3),
    w('ASTERION.W02', 4),
    w('ASTERION.W03', 1),
    w('ASTERION.W03', 2),
    w('ASTERION.W03', 3),
    w('ASTERION.W03', 4),
    { kind: 'clippit', order: 1 },
    { kind: 'clippit', order: 2 },
    null,
    null,
  ];
  const matches = (a: DefragCell, b: DefragCell): boolean => {
    if (a === null || b === null) return a === b;
    if (a.kind !== b.kind) return false;
    if (a.kind === 'weight' && b.kind === 'weight') return a.file === b.file && a.order === b.order;
    if (a.kind === 'clippit' && b.kind === 'clippit') return a.order === b.order;
    return false;
  };
  let board = createBoard();
  for (let i = 0; i < 16; i++) {
    if (matches(board[i], target[i])) continue;
    const j = board.findIndex((cell, k) => k > i && matches(cell, target[i]));
    if (j === -1) return false;
    board = swap(board, i, j);
  }
  return isSolved(board);
}

describe('the game is winnable end-to-end via the real answers', () => {
  it('BOOT -> P1 -> P2 -> P3 -> P4 -> ESCAPED -> WIN', () => {
    const store = new Store();
    expect(store.get().phase).toBe('BOOT');
    store.startGame();
    expect(store.get().phase).toBe('P1');

    // P1 — the spoken radio password unlocks the admin door.
    expect(isAdminPassword('williamg@tes21')).toBe(true);
    expect(store.solvePuzzle('P1')).toBe(true);
    expect(store.get().phase).toBe('P2');

    // P2 — the defrag scramble is genuinely solvable.
    expect(solveDefrag()).toBe(true);
    expect(store.solvePuzzle('P2')).toBe(true);
    expect(store.get().phase).toBe('P3');

    // P3 — crossing the painted number while flipped.
    expect(store.solvePuzzle('P3')).toBe(true);
    expect(store.get().phase).toBe('P4');

    // P4a — persuade the technician (needs the manual read for DL-7).
    let ev = createEvalState();
    for (let i = 0; i < STAGES.length; i++) ev = pickOption(ev, correctIndex(i), true);
    expect(ev.connected).toBe(true);
    // P4b — dial the composed command (AT + DT + outside-line 9 + number).
    expect(classifyDialCommand('ATDT95550195')).toBe('CONNECT');
    expect(store.solvePuzzle('P4')).toBe(true);
    expect(store.get().phase).toBe('ESCAPED');

    store.finishEscape();
    expect(store.get().phase).toBe('WIN');
  });

  it('near-miss final answers do not solve their puzzles', () => {
    expect(isAdminPassword('hunter2')).toBe(false); // the old password
    expect(classifyDialCommand('ATDT5550195')).toBe('NO_OUTSIDE_LINE'); // forgot the 9
    // persuasion cannot connect if the DL-7 round is answered without the manual
    let ev = createEvalState();
    ev = pickOption(ev, correctIndex(0), true);
    const gated = STAGES[1].options.findIndex((o) => 'requiresManual' in o && o.requiresManual);
    ev = pickOption(ev, gated, false); // manual NOT read
    expect(ev.stage).toBe(1);
    expect(ev.connected).toBe(false);
  });
});
