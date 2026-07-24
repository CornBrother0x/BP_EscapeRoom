import { describe, expect, it } from 'vitest';
import { SCRIPT } from '../data/script';
import { createEvalState, isOptionLocked, pickOption } from './evalConsole';

const STAGES = SCRIPT.p4.eval.stages;
const correctIndex = (s: number) => STAGES[s].options.findIndex((o) => o.correct);
const wrongIndex = (s: number) => STAGES[s].options.findIndex((o) => !o.correct);

describe('technician persuasion (P4 phase A)', () => {
  it('starts unconnected at round 0', () => {
    const s = createEvalState();
    expect(s.stage).toBe(0);
    expect(s.connected).toBe(false);
  });

  it('only the correct option advances a round; wrong options do not', () => {
    let s = createEvalState();
    s = pickOption(s, wrongIndex(0), true);
    expect(s.stage).toBe(0);
    s = pickOption(s, correctIndex(0), true);
    expect(s.stage).toBe(1);
  });

  it('locks the DL-7 option until the modem manual is read', () => {
    const gatedStage = STAGES.findIndex((st) =>
      st.options.some((o) => 'requiresManual' in o && o.requiresManual),
    );
    expect(gatedStage).toBeGreaterThanOrEqual(0);
    const gatedOpt = STAGES[gatedStage].options.findIndex(
      (o) => 'requiresManual' in o && o.requiresManual,
    );
    expect(isOptionLocked(gatedStage, gatedOpt, false)).toBe(true);
    expect(isOptionLocked(gatedStage, gatedOpt, true)).toBe(false);

    let s = createEvalState();
    for (let i = 0; i < gatedStage; i++) s = pickOption(s, correctIndex(i), true);
    expect(s.stage).toBe(gatedStage);
    expect(pickOption(s, gatedOpt, false).stage).toBe(gatedStage); // blocked
    expect(pickOption(s, gatedOpt, true).stage).toBe(gatedStage + 1); // allowed
  });

  it('requires clearing every round to connect the line', () => {
    let s = createEvalState();
    for (let i = 0; i < STAGES.length; i++) {
      expect(s.connected).toBe(false);
      s = pickOption(s, correctIndex(i), true);
    }
    expect(s.stage).toBe(STAGES.length);
    expect(s.connected).toBe(true);
    expect(pickOption(s, 0, true)).toEqual(s); // no-op once connected
  });

  it('the correct answer sits in different positions across rounds', () => {
    const positions = STAGES.map((_, i) => correctIndex(i));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });
});
