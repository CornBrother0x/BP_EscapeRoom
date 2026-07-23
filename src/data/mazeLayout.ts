/**
 * The maze — authored via a validated generator (scratchpad genfinal.mjs),
 * frozen here, and re-proven by mazeGrid.test.
 *
 * - Sector A is an open spawn room; a short L-hallway starts by the rat (R)
 *   and readme computer (C) and dead-ends at the password (N).
 * - Sectors B/C unchanged (defrag floppy; polyhedron 3 + smiley E; 9~~ + L).
 * - Sector D is a longer winding hallway: drop in flipped via H, unflip at
 *   the return polyhedron (P), read the note (M) near the entry, and follow
 *   the bends to the phone-booth terminal (4) at the far end. D is sealed —
 *   reachable ONLY by flipping (mazeGrid.test proves it via H-blocking).
 *
 * Legend:
 *   #  wall   .  floor   S  spawn
 *   N  password   C  readme CRT   A  admin door   2  defrag floppy
 *   G  glitch wall   3  polyhedron   9  number zone   ~  inverted corridor
 *   H  high doorway (flip only)   4  modem terminal   M  manual/clipboard
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
  '#...................2.#',
  '#.###.#########.#####.#',
  '#.....................#',
  '###########G###########',
  '#...E.3...............#',
  '#.#########.#########.#',
  '#...................L.#',
  '#..9~~................#',
  '####H##################',
  '#.P...M...............#',
  '####################.##',
  '#.....................#',
  '#.#####################',
  '#4....................#',
  '#######################',
];
