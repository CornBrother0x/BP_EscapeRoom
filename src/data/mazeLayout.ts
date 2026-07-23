/**
 * The maze — the original open-room design, bumped ~one notch harder (~33%
 * more floor + a little more winding). Validated by a generator script
 * (reachability + gating cut-vertices + sealed room) and re-proven by
 * mazeGrid.test. Deliberately NOT a dense backtracker maze.
 *
 * The sticky note (N) sits two cells from spawn (S) on a north-facing wall,
 * so its text is back-face culled and invisible on the way in — you only
 * spot the password when you circle back and look from the other side.
 *
 * Legend:
 *   #  wall (full height)          .  floor            S  spawn
 *   N  sticky-note prop (P1 clue, by spawn)   C  readme CRT (P1 hint)
 *   A  admin-dialog door wall      (opens when P1 solved)
 *   2  defrag CRT (P2 station)     G  glitch wall (de-rezzes when P2 solved)
 *   3  quarantined polyhedron      (P3 — touch to flip)
 *   9  number zone (555-0195 painted on the ceiling; cross while flipped = P3)
 *   ~  inverted corridor (hanging beams wall off flipped players)
 *   H  high doorway (solid floor..2, open above — only flipped players pass)
 *   4  modem CRT (P4)   M  modem manual (P4 clue)   P  return polyhedron (D)
 *   R  rat   E  smiley exit marker   L  OpenGL logo (wall decal)
 *
 * Sectors: A (spawn) → B (defrag) → C (polyhedron + inverted corridor)
 * → D (modem room, bottom strip, sealed at floor level — flip in via H).
 */
export const MAZE_ROWS: readonly string[] = [
  '#######################',
  '#S.....#......#.....R.#',
  '#.##...#.###..#.###...#',
  '#.N................C..#',
  '#......#......#.......#',
  '#####A#################',
  '#.....#......#.....2..#',
  '#.###.#.###..#.####...#',
  '#.....................#',
  '##########G############',
  '#.....#......#......L.#',
  '#....3................#',
  '#.....#......#........#',
  '#.............9~~.....#',
  '###############H#######',
  '#4.M....P......E......#',
  '#######################',
];
