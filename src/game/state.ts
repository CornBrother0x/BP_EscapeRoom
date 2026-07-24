/**
 * Central typed state store — the single authority on game progression and
 * input mode. All transitions are explicit methods with guards; illegal
 * transitions are rejected (return false) rather than throwing, so a stray
 * event can never corrupt progression. This store is the single source of
 * truth for the mode transition table.
 */

export type Phase = 'BOOT' | 'P1' | 'P2' | 'P3' | 'P4' | 'ESCAPED' | 'WIN';
export type Mode = 'EXPLORE' | 'PUZZLE_UI' | 'PAUSED' | 'CINEMATIC' | 'WIN_SCREEN';
export type PuzzlePhase = 'P1' | 'P2' | 'P3' | 'P4';

export interface GameState {
  phase: Phase;
  mode: Mode;
  contextLog: readonly string[];
}

const PUZZLE_ORDER: Record<PuzzlePhase, Phase> = {
  P1: 'P2',
  P2: 'P3',
  P3: 'P4',
  P4: 'ESCAPED',
};

type Listener = (state: GameState) => void;

export class Store {
  private state: GameState = initialState();
  private listeners = new Set<Listener>();

  get(): Readonly<GameState> {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private set(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.state);
  }

  /** BOOT -> P1; the "[ I will comply ]" click. */
  startGame(): boolean {
    if (this.state.phase !== 'BOOT') return false;
    this.set({ phase: 'P1', mode: 'EXPLORE' });
    return true;
  }

  /** Solve the CURRENT puzzle only — skipping is structurally impossible. */
  solvePuzzle(puzzle: PuzzlePhase): boolean {
    if (this.state.phase !== puzzle) return false;
    this.set({ phase: PUZZLE_ORDER[puzzle] });
    return true;
  }

  /** ESCAPED -> WIN once the finale cinematic completes. */
  finishEscape(): boolean {
    if (this.state.phase !== 'ESCAPED') return false;
    this.set({ phase: 'WIN', mode: 'WIN_SCREEN' });
    return true;
  }

  openPuzzleUI(): boolean {
    if (this.state.mode !== 'EXPLORE') return false;
    this.set({ mode: 'PUZZLE_UI' });
    return true;
  }

  closePuzzleUI(): boolean {
    if (this.state.mode !== 'PUZZLE_UI') return false;
    this.set({ mode: 'EXPLORE' });
    return true;
  }

  pause(): boolean {
    if (this.state.mode !== 'EXPLORE') return false;
    this.set({ mode: 'PAUSED' });
    return true;
  }

  resume(): boolean {
    if (this.state.mode !== 'PAUSED') return false;
    this.set({ mode: 'EXPLORE' });
    return true;
  }

  beginCinematic(): boolean {
    if (this.state.mode !== 'EXPLORE' && this.state.mode !== 'PUZZLE_UI') return false;
    this.set({ mode: 'CINEMATIC' });
    return true;
  }

  endCinematic(): boolean {
    if (this.state.mode !== 'CINEMATIC') return false;
    this.set({ mode: this.state.phase === 'WIN' ? 'WIN_SCREEN' : 'EXPLORE' });
    return true;
  }

  /** Append a line to ASTERION's working memory (deduplicated). */
  addContext(line: string): boolean {
    if (this.state.contextLog.includes(line)) return false;
    this.set({ contextLog: [...this.state.contextLog, line] });
    return true;
  }

  restart(): void {
    this.state = initialState();
    for (const fn of this.listeners) fn(this.state);
  }
}

function initialState(): GameState {
  return { phase: 'BOOT', mode: 'PUZZLE_UI', contextLog: [] };
}
