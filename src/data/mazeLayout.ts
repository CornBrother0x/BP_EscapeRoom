/**
 * The maze — authored via a validated generator (scratchpad genfinal2.mjs),
 * frozen here, and re-proven by mazeGrid.test.
 *
 * - Sector A: open spawn room; an L-hallway by the rat (R) + computer (C)
 *   dead-ends at the password (N).
 * - Sector B (defrag): a bigger hall with a CD-ROM decoy (K) near the entrance
 *   to throw you off, and the real defrag floppy (2) in the far corner.
 * - Sector C (flip zone): a chamber full of smiley faces (E) with TWO hallways
 *   down — the left dead-ends, the right leads to the polyhedron (3) where the
 *   world flips; then the inverted corridor (9~~) drops you through H into D.
 * - Sector D: a long winding hallway; unflip at P, read the note (M), and
 *   follow the bends to the phone-booth terminal (4) at the very end. Sealed —
 *   reachable ONLY by flipping (mazeGrid.test proves it via H-blocking).
 *
 * Legend:
 *   #  wall   .  floor   S  spawn   N  password   C  readme CRT   A  admin door
 *   2  defrag floppy   K  CD-ROM decoy   G  glitch wall   3  polyhedron
 *   9  number zone   ~  inverted corridor   H  high doorway (flip only)
 *   4  modem terminal   M  clipboard   P  return polyhedron
 *   R  rat   E  smiley   L  OpenGL logo
 */
export const MAZE_ROWS: readonly string[] = [
  '#######################',
  '#S..........###########',
  '#...##..##..###########',
  '#............C.R.....##',
  '#...##..##..########.##',
  '#...........########.##',
  '#...........########N##',
  '#####A#################',
  '#....................2#',
  '#..#K.#..#..#..#..#...#',
  '#.....................#',
  '#..#..#..#..#..#..#...#',
  '#.....................#',
  '#..#..#..#..#..#..#...#',
  '###########G###########',
  '#...E......E......E...#',
  '#......E.......E......#',
  '#..E...............E..#',
  '###.###############.###',
  '###.###############.###',
  '###E##########..3...L.#',
  '##############.9~~....#',
  '################H######',
  '#.............P...M...#',
  '#####################.#',
  '#.....................#',
  '#.#####################',
  '#....................4#',
  '#######################',
];
