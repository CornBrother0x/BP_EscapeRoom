/**
 * Shared plumbing passed to the game's UI and puzzle modules, so the large
 * `startGame` closure can be split into focused files without threading a
 * dozen arguments through each one.
 */
import type { GameAudio } from '../engine/audio';
import type { Interactor } from '../engine/interact';
import type { ClippyWidget } from '../ui/clippy';
import type { MazeWorld } from '../world/maze';
import type { DefragBoard } from '../puzzles/defrag/defragLogic';
import type { Store } from './state';

/** Mutable flags that genuinely cross module boundaries. */
export interface GameSession {
  lineConnected: boolean;
  modemIntroShown: boolean;
  modemManualRead: boolean;
  defragBoard: DefragBoard | undefined;
}

/** Dependencies + helpers every UI/puzzle module needs. */
export interface GameContext {
  readonly store: Store;
  readonly audio: GameAudio;
  readonly clippy: ClippyWidget;
  readonly world: MazeWorld;
  readonly interactor: Interactor;
  readonly overlay: HTMLElement;
  readonly session: GameSession;
  /** Append a clue to the context window (deduped) and toast if it's new. */
  addContext(line: string): void;
  toast(text: string): void;
  lockPointer(): void;
  /** Enter PUZZLE_UI mode for a dialog. Returns false if not allowed now. */
  openDialog(id: string): boolean;
  closeDialog(): void;
  dialogId(): string | null;
  setDialogId(id: string | null): void;
  /** Swap the Clippy HUD label to the "ask for a hint" prompt. */
  showClippyHudHint(): void;
}
