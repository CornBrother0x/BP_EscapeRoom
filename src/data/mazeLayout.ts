/**
 * The maze — hallway-based, validated by a generator script (reachability +
 * gating cut-vertices + sealed room + H-drop) and re-proven by mazeGrid.test.
 *
 * - Sector A is a winding serpentine hallway; the password (N) waits at its
 *   far end, by the rat (R), on a north wall (back-face culled until you get
 *   there and look up at the wall). The readme (C) is partway along.
 * - Sector C's polyhedron (3) sits at the end of a corridor with the smiley
 *   exit marker (E) beside it; the OpenGL logo (L) decals a wall.
 * - Sector D is a long hallway: you drop in flipped via H, unflip at the
 *   return polyhedron (P), read the note (M) near the entry, and reach the
 *   modem terminal (4) at the far end.
 *
 * Legend:
 *   #  wall   .  floor   S  spawn
 *   N  sticky-note (password)   C  readme CRT (hint)
 *   A  admin-dialog door (opens on P1)   2  defrag floppy (P2)
 *   G  glitch wall (de-rezzes on P2)     3  quarantined polyhedron (P3)
 *   9  number zone (painted ceiling)     ~  inverted corridor (beams)
 *   H  high doorway (flipped players only)
 *   4  modem terminal (P4)   M  modem manual/clipboard (P4 clue)
 *   P  return polyhedron
 *   R  rat   E  smiley exit marker   L  OpenGL logo (wall decal)
 */
export const MAZE_ROWS: readonly string[] = [
  '#######################',
  '#S....................#',
  '#####################.#',
  '#.....................#',
  '#.#####################',
  '#.......C.............#',
  '#####################.#',
  '#.........R.N.........#',
  '#########A#############',
  '#...................2.#',
  '#.###.#########.#####.#',
  '#.....................#',
  '############G##########',
  '#...E.3...............#',
  '#.#########.#########.#',
  '#...................L.#',
  '#..9~~................#',
  '#####H#################',
  '#.P....M..........4...#',
  '#######################',
];
