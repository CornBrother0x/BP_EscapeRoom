// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { mountDefrag } from './defrag';
import {
  isSolved,
  swap,
  type DefragBoard,
  type WeightFile,
  type WeightOrder,
} from './defragLogic';

const w = (file: WeightFile, order: WeightOrder): DefragBoard[number] => ({
  kind: 'weight',
  file,
  order,
});
const SOLVED: DefragBoard = [
  w('ASTERION.W01', 1), w('ASTERION.W01', 2), w('ASTERION.W01', 3), w('ASTERION.W01', 4),
  w('ASTERION.W02', 1), w('ASTERION.W02', 2), w('ASTERION.W02', 3), w('ASTERION.W02', 4),
  w('ASTERION.W03', 1), w('ASTERION.W03', 2), w('ASTERION.W03', 3), w('ASTERION.W03', 4),
  { kind: 'clippit', order: 1 }, { kind: 'clippit', order: 2 }, null, null,
];

function clickCell(container: HTMLElement, index: number): void {
  const btn = container.querySelector<HTMLElement>(`[data-cell-index="${index}"]`);
  expect(btn, `cell ${index} button exists`).toBeTruthy();
  btn?.click();
}

describe('mountDefrag DOM integration', () => {
  it('fires onSolved once the final swap completes the disk', () => {
    expect(isSolved(SOLVED)).toBe(true);
    const oneAway = swap(SOLVED, 0, 1); // row 0 now out of order (2,1,3,4)
    expect(isSolved(oneAway)).toBe(false);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const onSolved = vi.fn();
    const handle = mountDefrag(container, { initialBoard: oneAway, onSolved });

    clickCell(container, 0); // select
    clickCell(container, 1); // swap back -> solved
    expect(onSolved).toHaveBeenCalledTimes(1);

    handle.destroy();
    container.remove();
  });

  it('does not fire onSolved for a fresh scrambled board', () => {
    const container = document.createElement('div');
    const onSolved = vi.fn();
    const handle = mountDefrag(container, { onSolved });
    expect(onSolved).not.toHaveBeenCalled();
    handle.destroy();
  });
});
