/**
 * The maze — authored via a validated generator (scratchpad genfinal3.mjs),
 * frozen here, and re-proven by mazeGrid.test.
 *
 * - Sector A: open spawn room; an L-hallway by the rat (R) + computer (C)
 *   dead-ends at the password (N).
 * - Sector B (defrag): a bigger hall with a CD-ROM decoy (K) and the real
 *   defrag floppy (2) in the far corner.
 * - Sector C (flip zone): a chamber full of smiley faces (E). A single hallway
 *   leads down and SPLITS — the left branch dead-ends, the right branch runs
 *   to the polyhedron (3) where the world flips; the inverted corridor (9~~)
 *   then drops you through H into D.
 * - Sector D: you drop in flipped, must travel all the way down the left side
 *   to the return polyhedron (P) in the far corner to unflip, then come back
 *   across the bottom to the phone-booth terminal (4). Sealed — reachable ONLY
 *   by flipping (mazeGrid.test proves it via H-blocking).
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
  '#...E.....E......E....#',
  '#......E......E.......#',
  '#...E.............E...#',
  '###########.###########',
  '###########.###########',
  '####...............####',
  '####.#############.####',
  '####E########......L###',
  '#############.9~~3..###',
  '###############H#######',
  '#................M....#',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#P...................4#',
  '#######################',
];
