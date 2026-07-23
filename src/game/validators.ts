/**
 * Answer validation, per docs/puzzles.md: trim, uppercase, strip spaces and
 * hyphens before comparison. Wrong answers never lock the player out.
 */

export function normalizeAnswer(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, '');
}

export function isAdminPassword(input: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer('williamg@tes21');
}

/** Era-true Hayes modem responses that teach the syntax through failure. */
export type DialResult =
  | 'CONNECT'
  | 'ERROR_NO_AT' // command didn't start with AT
  | 'OK_NOOP' // AT acknowledged, nothing dialed (authentic and useless)
  | 'NO_CARRIER' // dial attempted, wrong or missing number
  | 'ERROR_NO_DIAL_MODE'; // right number, no DT mode prefix

export function classifyDialCommand(input: string): DialResult {
  const n = normalizeAnswer(input);
  if (!n.startsWith('AT')) return 'ERROR_NO_AT';
  const rest = n.slice(2);
  if (rest === 'DT5550195') return 'CONNECT';
  if (rest.startsWith('DT')) return 'NO_CARRIER';
  if (rest.includes('5550195')) return 'ERROR_NO_DIAL_MODE';
  return 'OK_NOOP';
}
