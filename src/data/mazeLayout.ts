/**
 * The maze, hand-authored (docs/puzzles.md, layout v0).
 *
 * Legend:
 *   #  wall (full height)
 *   .  floor
 *   S  spawn
 *   N  sticky-note prop            (P1 clue)
 *   C  readme CRT prop             (P1 hint tier 1)
 *   A  admin-dialog door wall      (opens when P1 solved)
 *   2  defrag CRT prop             (P2 station)
 *   G  glitch wall                 (de-rezzes when P2 solved)
 *   3  quarantined polyhedron      (P3 — touch to flip)
 *   9  number zone — entry cell of the inverted corridor; `555-0195`
 *      painted on its ceiling; crossing it while flipped solves P3
 *   ~  inverted corridor — hanging beams wall it off for flipped players;
 *      upright players walk freely underneath
 *   H  high doorway — solid floor..2.0, open above (flipped players pass)
 *   4  modem CRT prop              (P4 station)
 *   M  modem manual prop           (P4 clue)
 *   P  return polyhedron           (unflip inside sector D)
 *
 * Sectors: NW = spawn (S, N, C in the NE pocket), SW = defrag, SE =
 * polyhedron + inverted corridor, D (bottom strip) = modem room, sealed at
 * floor level — enterable only via the H doorway while flipped.
 */
export const MAZE_ROWS: readonly string[] = [
  '#####################',
  '#S.......#.........##',
  '#...##...#...##....##',
  '#.N.##.......##..C.##',
  '#...##...#...##....##',
  '#........#.........##',
  '####A################',
  '#........#.........##',
  '#...##...#...##....##',
  '#.2.##...G...##3...##',
  '#...##...#...##....##',
  '#........#......9~~##',
  '##################H##',
  '#4.M...P...........##',
  '#####################',
];
