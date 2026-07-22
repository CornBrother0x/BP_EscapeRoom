/**
 * The maze, authored via a validated generator (see scratchpad genmaze2.mjs)
 * then frozen here. Each sector is a recursive-backtracker maze (winding
 * corridors + dead ends) so it can't be breezed through; sectors are joined
 * by single doors that make the gating cut-vertices (proven in mazeGrid.test).
 *
 * Legend:
 *   #  wall (full height)          .  floor            S  spawn
 *   N  sticky-note prop (P1 clue)  C  readme CRT (P1 hint)
 *   A  admin-dialog door wall      (opens when P1 solved)
 *   2  defrag CRT (P2 station)     G  glitch wall (de-rezzes when P2 solved)
 *   3  quarantined polyhedron      (P3 — touch to flip; hidden deep in C)
 *   9  number zone (555-0195 painted on the ceiling; cross while flipped = P3)
 *   ~  inverted corridor (hanging beams wall off flipped players)
 *   H  high doorway (solid floor..2, open above — only flipped players pass)
 *   4  modem CRT (P4)              M  modem manual (P4 clue)
 *   P  return polyhedron (unflip inside the sealed sector D)
 *   R  rat (ambient screensaver callback)   E  smiley exit marker
 *   L  OpenGL logo (wall decal — the screensaver's "OpenGL room" nod)
 *
 * Sectors: A (spawn, top) → B (defrag) → C (polyhedron + inverted corridor)
 * → D (modem room, bottom strip, sealed at floor level — flip in via H).
 */
export const MAZE_ROWS: readonly string[] = [
  '###########################',
  '#S#....R#.........#.......#',
  '#.#.###.#####.###.#.#####.#',
  '#...#.#.#...#C..#...#...#.#',
  '#####.#.#.#.###.#####.#.#.#',
  '#N........#.....#.....#...#',
  '###A#######################',
  '#.#.....#...........#....2#',
  '#.###.#.#######.###.#####.#',
  '#...#.#.........#.#.......#',
  '###.#.###########.#######.#',
  '#.....#...................#',
  '#######################G###',
  '#.........#.#.........#..L#',
  '#########.#.#.#####.#.###.#',
  '#....3..#.#.....#...#...#.#',
  '#.#.#####.#######.#####.#.#',
  '#.#...............#.......#',
  '#....................9~~..#',
  '#######################H###',
  '#4...M......P...........E.#',
  '###########################',
];
