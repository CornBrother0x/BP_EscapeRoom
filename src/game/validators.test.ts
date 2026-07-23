import { describe, expect, it } from 'vitest';
import { classifyDialCommand, isAdminPassword, normalizeAnswer } from './validators';

describe('normalizeAnswer', () => {
  it('trims, uppercases, and strips spaces and hyphens', () => {
    expect(normalizeAnswer('  atdt 555-0195 ')).toBe('ATDT5550195');
    expect(normalizeAnswer('hunter2')).toBe('HUNTER2');
  });
});

describe('isAdminPassword', () => {
  it('accepts williamg@tes21 in any casing/spacing', () => {
    expect(isAdminPassword('williamg@tes21')).toBe(true);
    expect(isAdminPassword(' WILLIAMG@TES21 ')).toBe(true);
    expect(isAdminPassword('williamg@tes-21')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isAdminPassword('williamgates21')).toBe(false);
    expect(isAdminPassword('hunter2')).toBe(false);
    expect(isAdminPassword('password')).toBe(false);
    expect(isAdminPassword('')).toBe(false);
  });
});

describe('classifyDialCommand', () => {
  it('connects on the composed command, tolerant of formatting', () => {
    expect(classifyDialCommand('ATDT5550195')).toBe('CONNECT');
    expect(classifyDialCommand('atdt 555-0195')).toBe('CONNECT');
    expect(classifyDialCommand('  AtDt 555 0195  ')).toBe('CONNECT');
  });

  it('rejects commands that do not start with AT', () => {
    expect(classifyDialCommand('5550195')).toBe('ERROR_NO_AT');
    expect(classifyDialCommand('DT5550195')).toBe('ERROR_NO_AT');
    expect(classifyDialCommand('dial 5550195')).toBe('ERROR_NO_AT');
  });

  it('acknowledges AT with junk but dials nothing', () => {
    expect(classifyDialCommand('AT')).toBe('OK_NOOP');
    expect(classifyDialCommand('ATXYZ')).toBe('OK_NOOP');
  });

  it('NO CARRIER on dial attempts with the wrong number', () => {
    expect(classifyDialCommand('ATDT')).toBe('NO_CARRIER');
    expect(classifyDialCommand('ATDT5550196')).toBe('NO_CARRIER');
    expect(classifyDialCommand('ATDT911')).toBe('NO_CARRIER');
  });

  it('teaches the dial mode when the number is right but DT is missing', () => {
    expect(classifyDialCommand('AT5550195')).toBe('ERROR_NO_DIAL_MODE');
    expect(classifyDialCommand('AT 555-0195')).toBe('ERROR_NO_DIAL_MODE');
  });
});
