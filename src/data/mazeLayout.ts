/**
 * The maze — authored via a validated generator (scratchpad genfinal4.mjs),
 * frozen here, and re-proven by mazeGrid.test.
 *
 * - Sector A: open spawn room; an L-hallway by the rat (R) + computer (C)
 *   dead-ends at the password (N).
 * - Sector B (defrag): the room holds the CD-ROM decoy (K) and the real defrag
 *   floppy (2). A hallway off the right curls once to a play button (Y) — a
 *   Rickroll dead end.
 * - Sector C (flip zone): a smiley chamber (E). A hallway leads down and
 *   SPLITS; the left branch dead-ends, the right branch curls into a back nook
 *   where the polyhedron (3) hides. Flip, cross the inverted corridor (9~~),
 *   drop through H into D.
 * - Sector D: drop in flipped, travel all the way down the left to the return
 *   polyhedron (P) in the far corner, unflip, then come back across to the
 *   phone-booth terminal (4). Sealed — reachable ONLY by flipping.
 *
 * Legend:
 *   #  wall   .  floor   S  spawn   N  password   C  readme CRT   A  admin door
 *   2  defrag floppy   K  CD-ROM decoy   Y  Rickroll play button
 *   G  glitch wall   3  polyhedron   9  number zone   ~  inverted corridor
 *   H  high doorway (flip only)   4  modem terminal   M  clipboard
 *   P  return polyhedron   R  rat   E  smiley   L  OpenGL logo
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
  '#................######',
  '#..#K.#..#..#.........#',
  '#................####.#',
  '#..#..#..#..#....####.#',
  '#................####.#',
  '#..#..#..#..#....####.#',
  '#.......2........####Y#',
  '#................######',
  '###########G###########',
  '#...E.....E......E....#',
  '#......E......E.......#',
  '#...E.............E...#',
  '###########.###########',
  '###########.###########',
  '####...............####',
  '####.#############.####',
  '####E#######.....L.####',
  '############.39~~..####',
  '###############H#######',
  '#................M....#',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#P...................4#',
  '#######################',
];
