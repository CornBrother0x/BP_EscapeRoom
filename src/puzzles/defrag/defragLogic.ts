export const DEFRAG_GRID_SIZE = 4;
export const DEFRAG_BLOCK_COUNT = 14;

export type WeightFile = 'ASTERION.W01' | 'ASTERION.W02' | 'ASTERION.W03';
export type WeightOrder = 1 | 2 | 3 | 4;
export type ClippitOrder = 1 | 2;

export interface WeightBlock {
  readonly kind: 'weight';
  readonly file: WeightFile;
  readonly order: WeightOrder;
}

export interface ClippitBlock {
  readonly kind: 'clippit';
  readonly order: ClippitOrder;
}

export type DefragBlock = WeightBlock | ClippitBlock;
export type DefragCell = DefragBlock | null;
export type DefragBoard = readonly DefragCell[];

const weight = (file: WeightFile, order: WeightOrder): WeightBlock => ({
  kind: 'weight',
  file,
  order,
});

const clippit = (order: ClippitOrder): ClippitBlock => ({
  kind: 'clippit',
  order,
});

// Fixed scramble made by disrupting every row of a solved board. Its reverse
// path teaches the rule in six swaps while keeping restart deterministic.
const START_BOARD: DefragBoard = [
  clippit(1),
  weight('ASTERION.W01', 3),
  weight('ASTERION.W01', 2),
  weight('ASTERION.W01', 4),
  clippit(2),
  weight('ASTERION.W02', 4),
  weight('ASTERION.W02', 3),
  weight('ASTERION.W02', 2),
  null,
  weight('ASTERION.W03', 4),
  weight('ASTERION.W03', 3),
  weight('ASTERION.W03', 2),
  weight('ASTERION.W01', 1),
  weight('ASTERION.W02', 1),
  weight('ASTERION.W03', 1),
  null,
];

export function createBoard(): DefragBoard {
  return START_BOARD.map((cell) => (cell === null ? null : { ...cell }));
}

export function swap(board: DefragBoard, first: number, second: number): DefragBoard {
  assertBoard(board);
  assertIndex(first);
  assertIndex(second);

  if (first === second) return board.slice();

  const next = board.slice();
  [next[first], next[second]] = [next[second], next[first]];
  return next;
}

export function isPlaced(board: DefragBoard, index: number): boolean {
  assertBoard(board);
  assertIndex(index);

  const row = Math.floor(index / DEFRAG_GRID_SIZE);
  const cell = board[index];
  if (cell === null) return false;

  if (row < 3) return isCompleteWeightRow(board, row);
  if (cell.kind !== 'clippit') return false;

  const rowStart = row * DEFRAG_GRID_SIZE;
  for (let column = 0; column < DEFRAG_GRID_SIZE - 1; column += 1) {
    const leftIndex = rowStart + column;
    const left = board[leftIndex];
    const right = board[leftIndex + 1];
    if (
      left?.kind === 'clippit' &&
      left.order === 1 &&
      right?.kind === 'clippit' &&
      right.order === 2
    ) {
      return index === leftIndex || index === leftIndex + 1;
    }
  }

  return false;
}

export function computeProgress(board: DefragBoard): number {
  assertBoard(board);
  let placed = 0;

  for (let index = 0; index < board.length; index += 1) {
    if (isPlaced(board, index)) placed += 1;
  }

  return placed / DEFRAG_BLOCK_COUNT;
}

export function isSolved(board: DefragBoard): boolean {
  return computeProgress(board) === 1;
}

function isCompleteWeightRow(board: DefragBoard, row: number): boolean {
  const rowStart = row * DEFRAG_GRID_SIZE;
  const first = board[rowStart];
  if (first?.kind !== 'weight') return false;

  for (let column = 0; column < DEFRAG_GRID_SIZE; column += 1) {
    const cell = board[rowStart + column];
    if (cell?.kind !== 'weight' || cell.file !== first.file || cell.order !== column + 1) {
      return false;
    }
  }

  return true;
}

function assertBoard(board: DefragBoard): void {
  if (board.length !== DEFRAG_GRID_SIZE * DEFRAG_GRID_SIZE) {
    throw new RangeError('Defrag board must contain exactly 16 cells');
  }
}

function assertIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= DEFRAG_GRID_SIZE * DEFRAG_GRID_SIZE) {
    throw new RangeError(`Defrag index out of range: ${index}`);
  }
}
