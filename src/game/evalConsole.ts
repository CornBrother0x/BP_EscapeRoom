/**
 * Pure state machine for P4 phase A: the 3-round technician persuasion.
 * Extracted from the DOM so the branching logic can be unit-tested directly.
 *
 * Rules proven by evalConsole.test.ts:
 *  - only the `correct` option in a round advances you
 *  - round 2's DL-7 option is locked until the modem manual is read
 *  - you must clear all three rounds to connect the line
 */
import { SCRIPT } from '../data/script';

export interface EvalState {
  /** Rounds cleared so far (0..stages.length). */
  readonly stage: number;
  /** True once every round is cleared and the line is connected. */
  readonly connected: boolean;
}

const STAGES = SCRIPT.p4.eval.stages;

export function createEvalState(): EvalState {
  return { stage: 0, connected: false };
}

/** A choice the player is not allowed to pick yet (its clue is unread). */
export function isOptionLocked(stage: number, optionIndex: number, manualRead: boolean): boolean {
  const opt = STAGES[stage]?.options[optionIndex];
  return Boolean(opt && 'requiresManual' in opt && opt.requiresManual && !manualRead);
}

/**
 * Apply a choice. Returns a new state: unchanged for a wrong or locked option,
 * advanced one round for the correct option, `connected` once the last round
 * is cleared.
 */
export function pickOption(state: EvalState, optionIndex: number, manualRead: boolean): EvalState {
  if (state.connected || state.stage >= STAGES.length) return state;
  const opt = STAGES[state.stage]?.options[optionIndex];
  if (!opt || !opt.correct) return state;
  if (isOptionLocked(state.stage, optionIndex, manualRead)) return state;
  const stage = state.stage + 1;
  return { stage, connected: stage >= STAGES.length };
}
