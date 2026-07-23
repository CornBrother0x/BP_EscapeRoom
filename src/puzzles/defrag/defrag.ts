import { SCRIPT } from '../../data/script';
import './defrag.css';
import {
  computeProgress,
  createBoard,
  isPlaced,
  isSolved,
  swap,
  type DefragBlock,
  type DefragBoard,
  type WeightFile,
} from './defragLogic';

export interface DefragHandle {
  destroy(): void;
}

interface DefragOptions {
  onSolved: () => void;
  initialBoard?: DefragBoard;
  onBoardChange?: (board: DefragBoard) => void;
  onRowComplete?: (completed: number) => void;
}

/** How many rows are fully defragged (each weight file in order + CLIPPIT pair). */
function countCompletedRows(board: DefragBoard): number {
  let n = 0;
  for (let r = 0; r < 3; r++) if (isPlaced(board, r * 4)) n++;
  for (let i = 12; i < 16; i++) {
    const cell = board[i];
    if (cell && cell.kind === 'clippit' && isPlaced(board, i)) {
      n++;
      break;
    }
  }
  return n;
}

export function mountDefrag(container: HTMLElement, opts: DefragOptions): DefragHandle {
  let board = opts.initialBoard?.slice() ?? createBoard();
  let selectedIndex: number | null = null;
  let solvedNotified = false;
  let completedRows = countCompletedRows(board);
  let destroyed = false;

  const root = document.createElement('section');
  root.className = 'window defrag-component';
  container.replaceChildren(root);

  const render = (): void => {
    const progress = computeProgress(board);
    const progressPercent = Math.round(progress * 100);
    const solved = isSolved(board);

    root.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">${SCRIPT.p2.windowTitle}</div>
      </div>
      <div class="window-body">
        <div class="defrag-workspace">
          <div
            class="sunken-panel defrag-grid"
            role="grid"
            aria-label="${SCRIPT.p2.gridLabel}"
          >
            ${board.map((cell, index) => renderCell(board, cell, index, selectedIndex, solved)).join('')}
          </div>
          ${renderLegend(board)}
        </div>
        <div class="defrag-progress-row">
          <div
            class="progress-indicator segmented defrag-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${progressPercent}"
          >
            <span class="progress-indicator-bar" style="width: ${progressPercent}%"></span>
          </div>
          <span class="defrag-progress-label">${progressPercent}% ${SCRIPT.p2.progressLabel}</span>
        </div>
        <div class="defrag-actions">
          <button type="button" data-restart>${SCRIPT.p2.restartButton}</button>
        </div>
        ${solved ? renderCompleteReport() : ''}
      </div>
    `;
  };

  const handleClick = (event: MouseEvent): void => {
    if (destroyed || !(event.target instanceof Element)) return;

    const restartButton = event.target.closest<HTMLButtonElement>('button[data-restart]');
    if (restartButton) {
      board = createBoard();
      opts.onBoardChange?.(board);
      selectedIndex = null;
      completedRows = countCompletedRows(board);
      render();
      return;
    }

    const cellButton = event.target.closest<HTMLButtonElement>('button[data-cell-index]');
    if (!cellButton || isSolved(board)) return;

    const index = Number(cellButton.dataset.cellIndex);
    if (!Number.isInteger(index)) return;

    if (selectedIndex === null) {
      if (board[index] === null) return;
      selectedIndex = index;
      render();
      return;
    }

    if (selectedIndex === index) {
      selectedIndex = null;
      render();
      return;
    }

    board = swap(board, selectedIndex, index);
    opts.onBoardChange?.(board);
    selectedIndex = null;
    const solved = isSolved(board);
    render();

    const nowComplete = countCompletedRows(board);
    if (solved && !solvedNotified) {
      solvedNotified = true;
      opts.onSolved();
    } else if (nowComplete > completedRows) {
      opts.onRowComplete?.(nowComplete);
    }
    completedRows = nowComplete;
  };

  root.addEventListener('click', handleClick);
  render();

  return {
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      root.removeEventListener('click', handleClick);
      root.remove();
    },
  };
}

function renderCell(
  board: DefragBoard,
  block: DefragBlock | null,
  index: number,
  selectedIndex: number | null,
  solved: boolean,
): string {
  if (block === null) {
    return `
      <button
        class="defrag-cell defrag-cell-free"
        type="button"
        role="gridcell"
        data-cell-index="${index}"
        aria-label="${SCRIPT.p2.freeCellLabel}"
        ${solved ? 'disabled' : ''}
      ></button>
    `;
  }

  const selected = selectedIndex === index;
  const placed = isPlaced(board, index);
  const fileClass = block.kind === 'clippit' ? 'clippit' : fileClassName(block.file);
  const total = block.kind === 'clippit' ? 2 : 4;
  const label = block.kind === 'clippit' ? SCRIPT.p2.legendFiles.clippit : block.file;
  const dots = '●'.repeat(block.order);

  return `
    <button
      class="defrag-cell defrag-cell-${fileClass}${selected ? ' is-selected' : ''}${placed ? ' is-placed' : ''}"
      type="button"
      role="gridcell"
      data-cell-index="${index}"
      aria-label="${label}, ${SCRIPT.p2.fragmentLabel} ${block.order} ${SCRIPT.p2.ofLabel} ${total}"
      aria-pressed="${selected}"
      ${solved ? 'disabled' : ''}
    >
      <span aria-hidden="true">${dots}</span>
    </button>
  `;
}

function renderLegend(board: DefragBoard): string {
  const files = [
    {
      name: SCRIPT.p2.legendFiles.w01,
      className: 'w01',
      placed: isWeightFilePlaced(board, 'ASTERION.W01'),
    },
    {
      name: SCRIPT.p2.legendFiles.w02,
      className: 'w02',
      placed: isWeightFilePlaced(board, 'ASTERION.W02'),
    },
    {
      name: SCRIPT.p2.legendFiles.w03,
      className: 'w03',
      placed: isWeightFilePlaced(board, 'ASTERION.W03'),
    },
    { name: SCRIPT.p2.legendFiles.clippit, className: 'clippit', placed: isClippitPlaced(board) },
  ];

  return `
    <fieldset class="defrag-legend">
      <legend>${SCRIPT.p2.legendTitle}</legend>
      ${files
        .map(
          (file) => `
            <div class="defrag-legend-row">
              <span class="defrag-swatch defrag-cell-${file.className}" aria-hidden="true"></span>
              <span>${file.name}</span>
              <strong>${file.placed ? SCRIPT.p2.optimizedStatus : SCRIPT.p2.fragmentedStatus}</strong>
            </div>
          `,
        )
        .join('')}
    </fieldset>
  `;
}

function renderCompleteReport(): string {
  return `
    <section class="sunken-panel defrag-report" role="status" aria-live="polite">
      <strong>${SCRIPT.p2.reportTitle}</strong>
      ${SCRIPT.p2.completeReport.map((line) => `<p>${line}</p>`).join('')}
    </section>
  `;
}

function isWeightFilePlaced(board: DefragBoard, file: WeightFile): boolean {
  return board.some(
    (block, index) => block?.kind === 'weight' && block.file === file && isPlaced(board, index),
  );
}

function isClippitPlaced(board: DefragBoard): boolean {
  return board.some((block, index) => block?.kind === 'clippit' && isPlaced(board, index));
}

function fileClassName(file: WeightFile): 'w01' | 'w02' | 'w03' {
  if (file === 'ASTERION.W01') return 'w01';
  if (file === 'ASTERION.W02') return 'w02';
  return 'w03';
}
