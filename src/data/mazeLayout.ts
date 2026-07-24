/**
 * The maze — authored via a validated generator (scratchpad genfinal6.mjs),
 * frozen here, and re-proven by mazeGrid.test.
 *
 * - Sector A: open spawn room; a computer (C) and a corridor that bends down
 *   and back to a dead-end where the radio (N) plays the spoken password.
 * - Sector B (defrag): a long serpentine loitered with rats (R). The CD-ROM
 *   decoy (K) by the door and the Rickroll button (Y) tucked mid-slalom are
 *   distractions; the real defrag floppy (2) is buried at the far end.
 * - Sector C (flip zone): a smiley chamber (E) drops to a junction. One way is
 *   the 9~~ room (the inverted corridor + H drop). The polyhedron (3) is down a
 *   long hallway on the far side, so you flip there and travel back to cross 9.
 * - Sector D: drop in flipped, go all the way down the left to the return
 *   polyhedron (P), unflip, then come back past the dial-9 sign (X) to the
 *   phone-booth terminal (4). Sealed — reachable ONLY by flipping.
 *
 * Legend:
 *   #  wall   .  floor   S  spawn   N  radio (spoken password)   C  readme CRT   A  admin door
 *   2  defrag floppy   K  CD-ROM decoy   Y  Rickroll play button
 *   G  glitch wall   3  polyhedron   9  number zone   ~  inverted corridor
 *   H  high doorway (flip only)   4  modem terminal   M  clipboard
 *   X  dial-9 sign   P  return polyhedron   R  rat   E  smiley
 *   L  OpenGL logo   O  OpenGL room window
 */
export const MAZE_ROWS: readonly string[] = [
  '#######################',
  '#S..........###########',
  '#...##..##..###########',
  '#............C.......##',
  '#...##..##..########.##',
  '#...........########.##',
  '#...........#N.......##',
  '#####A#################',
  '#..K...........R.....##',
  '####################.##',
  '#.....R..............##',
  '#.#####################',
  '#...........Y....R...##',
  '####################.##',
  '#........R...........##',
  '#.#####################',
  '#.......R...........2##',
  '##########G############',
  '#...E.....E......E....#',
  '#......E......E.......#',
  '#...E.............E...#',
  '###########.###########',
  '###########.###########',
  '#....................##',
  '#.###########......L.##',
  '#.###########.....O..##',
  '#.3.........#..9~~...##',
  '################H######',
  '#.................M...#',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#.#####################',
  '#P................X..4#',
  '#######################',
];
