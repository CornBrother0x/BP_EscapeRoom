import { describe, expect, it } from 'vitest';
import {
  computeProgress,
  createBoard,
  isPlaced,
  isSolved,
  swap,
  type ClippitBlock,
  type DefragBoard,
  type WeightBlock,
  type WeightFile,
  type WeightOrder,
} from './defragLogic';

const FILES: readonly WeightFile[] = ['ASTERION.W01', 'ASTERION.W02', 'ASTERION.W03'];
const FILE_ORDERS: readonly (readonly WeightFile[])[] = [
  [FILES[0], FILES[1], FILES[2]],
  [FILES[0], FILES[2], FILES[1]],
  [FILES[1], FILES[0], FILES[2]],
  [FILES[1], FILES[2], FILES[0]],
  [FILES[2], FILES[0], FILES[1]],
  [FILES[2], FILES[1], FILES[0]],
];

const weight = (file: WeightFile, order: WeightOrder): WeightBlock => ({
  kind: 'weight',
  file,
  order,
});

const clippit = (order: 1 | 2): ClippitBlock => ({ kind: 'clippit', order });

function solvedBoard(
  fileOrder: readonly WeightFile[],
  finalRow: DefragBoard = [clippit(1), clippit(2), null, null],
): DefragBoard {
  const rows = fileOrder.flatMap((file) =>
    [1, 2, 3, 4].map((order) => weight(file, order as WeightOrder)),
  );
  return [...rows, ...finalRow];
}

describe('defrag solved state', () => {
  it.each(FILE_ORDERS.map((fileOrder) => [fileOrder] as const))(
    'accepts complete files in row assignment %j',
    (fileOrder) => {
      const board = solvedBoard(fileOrder);
      expect(isSolved(board)).toBe(true);
      expect(computeProgress(board)).toBe(1);
    },
  );

  it('requires CLIPPIT fragments to be adjacent and in order', () => {
    expect(isSolved(solvedBoard(FILES, [clippit(2), clippit(1), null, null]))).toBe(false);
    expect(isSolved(solvedBoard(FILES, [clippit(1), null, clippit(2), null]))).toBe(false);
    expect(isSolved(solvedBoard(FILES, [null, null, clippit(1), clippit(2)]))).toBe(true);
  });

  it('counts only complete ordered rows and the complete CLIPPIT pair', () => {
    const board = solvedBoard(FILES, [clippit(2), clippit(1), null, null]);
    expect(computeProgress(board)).toBe(12 / 14);
    expect(isPlaced(board, 0)).toBe(true);
    expect(isPlaced(board, 12)).toBe(false);
  });
});

describe('defrag moves', () => {
  it('follows a deterministic solve path with monotonic progress', () => {
    let board = createBoard();
    let previousProgress = computeProgress(board);
    const solvePath = [
      [9, 11],
      [5, 7],
      [1, 2],
      [8, 14],
      [4, 13],
      [0, 12],
    ] as const;

    expect(previousProgress).toBe(0);
    for (const [first, second] of solvePath) {
      board = swap(board, first, second);
      const progress = computeProgress(board);
      expect(progress).toBeGreaterThanOrEqual(previousProgress);
      previousProgress = progress;
    }

    expect(isSolved(board)).toBe(true);
  });

  it('restarts deterministically without sharing board arrays', () => {
    const first = createBoard();
    const second = createBoard();
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(swap(first, 0, 1)).not.toEqual(first);
    expect(second).toEqual(createBoard());
  });
});
