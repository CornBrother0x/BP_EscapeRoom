import { describe, expect, it } from 'vitest';
import { Store } from './state';

describe('progression', () => {
  it('follows the only legal path: BOOT -> P1..P4 -> ESCAPED -> WIN', () => {
    const s = new Store();
    expect(s.get().phase).toBe('BOOT');
    expect(s.startGame()).toBe(true);
    expect(s.solvePuzzle('P1')).toBe(true);
    expect(s.solvePuzzle('P2')).toBe(true);
    expect(s.solvePuzzle('P3')).toBe(true);
    expect(s.solvePuzzle('P4')).toBe(true);
    expect(s.get().phase).toBe('ESCAPED');
    expect(s.finishEscape()).toBe(true);
    expect(s.get().phase).toBe('WIN');
    expect(s.get().mode).toBe('WIN_SCREEN');
  });

  it('rejects puzzle skipping and double-solves', () => {
    const s = new Store();
    s.startGame();
    expect(s.solvePuzzle('P2')).toBe(false); // skip ahead
    expect(s.solvePuzzle('P4')).toBe(false);
    expect(s.get().phase).toBe('P1');
    s.solvePuzzle('P1');
    expect(s.solvePuzzle('P1')).toBe(false); // double solve
    expect(s.get().phase).toBe('P2');
  });

  it('rejects startGame twice and finishing before ESCAPED', () => {
    const s = new Store();
    expect(s.finishEscape()).toBe(false);
    s.startGame();
    expect(s.startGame()).toBe(false);
  });

  it('restart returns to a clean BOOT state', () => {
    const s = new Store();
    s.startGame();
    s.solvePuzzle('P1');
    s.addContext('a clue');
    s.restart();
    expect(s.get().phase).toBe('BOOT');
    expect(s.get().mode).toBe('PUZZLE_UI');
    expect(s.get().contextLog).toEqual([]);
  });
});

describe('input modes', () => {
  const inGame = () => {
    const s = new Store();
    s.startGame();
    return s;
  };

  it('PUZZLE_UI opens only from EXPLORE, and pause is blocked inside it', () => {
    const s = inGame();
    expect(s.openPuzzleUI()).toBe(true);
    expect(s.pause()).toBe(false); // pointer-lock loss in a dialog ≠ pause
    expect(s.openPuzzleUI()).toBe(false);
    expect(s.closePuzzleUI()).toBe(true);
    expect(s.get().mode).toBe('EXPLORE');
  });

  it('pause/resume round-trips from EXPLORE only', () => {
    const s = inGame();
    expect(s.pause()).toBe(true);
    expect(s.pause()).toBe(false);
    expect(s.resume()).toBe(true);
    expect(s.get().mode).toBe('EXPLORE');
  });

  it('cinematic returns to EXPLORE mid-game and WIN_SCREEN after the finale', () => {
    const s = inGame();
    expect(s.beginCinematic()).toBe(true);
    expect(s.pause()).toBe(false);
    expect(s.endCinematic()).toBe(true);
    expect(s.get().mode).toBe('EXPLORE');

    s.solvePuzzle('P1');
    s.solvePuzzle('P2');
    s.solvePuzzle('P3');
    s.solvePuzzle('P4');
    s.beginCinematic();
    s.finishEscape();
    expect(s.endCinematic()).toBe(false); // already WIN_SCREEN via finishEscape
    expect(s.get().mode).toBe('WIN_SCREEN');
  });

  it('context log appends and dedupes', () => {
    const s = inGame();
    expect(s.addContext('sticky note: hunter2')).toBe(true);
    expect(s.addContext('sticky note: hunter2')).toBe(false);
    expect(s.get().contextLog).toHaveLength(1);
  });
});
