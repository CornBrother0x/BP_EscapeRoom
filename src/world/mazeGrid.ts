/**
 * Pure maze parsing: ASCII rows -> collision boxes + station/zone positions.
 * No three.js here — this module is fully unit-testable.
 */
import type { WallBox } from '../engine/collision';

export const CELL = 2.4;
export const WALL_H = 4;
/** High doorways are solid from the floor to this height, open above. */
export const HIGH_DOOR_TOP = 2.0;
/** Hanging beams reach down from the ceiling to this height. */
export const BEAM_BOTTOM = 2.6;
const BEAM_THICKNESS = 0.3;

export type DoorId = 'admin' | 'glitch';
export type StationId =
  | 'sticky-note'
  | 'readme-crt'
  | 'defrag-crt'
  | 'polyhedron'
  | 'return-polyhedron'
  | 'modem-crt'
  | 'manual';
/** Screensaver callbacks, dead-end props, and the dial-9 clue sign. */
export type DecorationId = 'rat' | 'smiley' | 'opengl' | 'cd' | 'rickroll' | 'sign';

export interface GridPos {
  gx: number;
  gz: number;
}

export interface ParsedMaze {
  width: number;
  height: number;
  rows: readonly string[];
  spawn: GridPos;
  /** Static, always-solid geometry (walls, beams, high-door fillers). */
  walls: WallBox[];
  /** Openable barriers, solid until their puzzle is solved. */
  doors: { id: DoorId; box: WallBox; cell: GridPos }[];
  stations: { id: StationId; cell: GridPos }[];
  decorations: { id: DecorationId; cell: GridPos }[];
  /** Cells whose ceiling carries the painted number (P3 payoff). */
  numberZones: GridPos[];
  beams: WallBox[];
  highDoors: WallBox[];
}

export function cellCenter(pos: GridPos): { x: number; z: number } {
  return { x: (pos.gx + 0.5) * CELL, z: (pos.gz + 0.5) * CELL };
}

export function worldToCell(x: number, z: number): GridPos {
  return { gx: Math.floor(x / CELL), gz: Math.floor(z / CELL) };
}

function cellBox(gx: number, gz: number, yMin: number, yMax: number): WallBox {
  return { minX: gx * CELL, maxX: (gx + 1) * CELL, minZ: gz * CELL, maxZ: (gz + 1) * CELL, yMin, yMax };
}

const STATION_CHARS: Record<string, StationId> = {
  N: 'sticky-note',
  C: 'readme-crt',
  '2': 'defrag-crt',
  '3': 'polyhedron',
  P: 'return-polyhedron',
  '4': 'modem-crt',
  M: 'manual',
};

const DECORATION_CHARS: Record<string, DecorationId> = {
  R: 'rat',
  E: 'smiley',
  L: 'opengl',
  K: 'cd',
  Y: 'rickroll',
  X: 'sign',
};

export function isWalkable(ch: string): boolean {
  return ch !== '#' && ch !== undefined;
}

export function parseMaze(rows: readonly string[]): ParsedMaze {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  for (const row of rows) {
    if (row.length !== width) throw new Error(`Ragged maze row: "${row}"`);
  }

  const at = (gx: number, gz: number): string => rows[gz]?.[gx] ?? '#';

  let spawn: GridPos | null = null;
  const walls: WallBox[] = [];
  const doors: ParsedMaze['doors'] = [];
  const stations: ParsedMaze['stations'] = [];
  const decorations: ParsedMaze['decorations'] = [];
  const numberZones: GridPos[] = [];
  const beams: WallBox[] = [];
  const highDoors: WallBox[] = [];

  for (let gz = 0; gz < height; gz++) {
    for (let gx = 0; gx < width; gx++) {
      const ch = at(gx, gz);
      switch (ch) {
        case '#':
          walls.push(cellBox(gx, gz, 0, WALL_H));
          break;
        case 'S':
          if (spawn) throw new Error('Multiple spawn cells');
          spawn = { gx, gz };
          break;
        case 'A':
          doors.push({ id: 'admin', box: cellBox(gx, gz, 0, WALL_H), cell: { gx, gz } });
          break;
        case 'G':
          doors.push({ id: 'glitch', box: cellBox(gx, gz, 0, WALL_H), cell: { gx, gz } });
          break;
        case 'H':
          highDoors.push(cellBox(gx, gz, 0, HIGH_DOOR_TOP));
          break;
        case '9':
          numberZones.push({ gx, gz });
          break;
        case '~':
          // Beams generated below, once all cells are known.
          break;
        default: {
          const station = STATION_CHARS[ch];
          const decoration = DECORATION_CHARS[ch];
          if (station) stations.push({ id: station, cell: { gx, gz } });
          else if (decoration) decorations.push({ id: decoration, cell: { gx, gz } });
          else if (ch !== '.') throw new Error(`Unknown maze char "${ch}" at ${gx},${gz}`);
        }
      }
    }
  }

  // Hanging beams: wall off '~' corridor cells from ordinary floor for
  // flipped players. '9' is the deliberate beam-free entrance; '#', 'H' and
  // fellow '~' cells need no beam.
  const noBeamNeighbors = new Set(['~', '9', '#', 'H']);
  for (let gz = 0; gz < height; gz++) {
    for (let gx = 0; gx < width; gx++) {
      if (at(gx, gz) !== '~') continue;
      const x0 = gx * CELL;
      const z0 = gz * CELL;
      if (!noBeamNeighbors.has(at(gx - 1, gz)))
        beams.push({ minX: x0, maxX: x0 + BEAM_THICKNESS, minZ: z0, maxZ: z0 + CELL, yMin: BEAM_BOTTOM, yMax: WALL_H });
      if (!noBeamNeighbors.has(at(gx + 1, gz)))
        beams.push({ minX: x0 + CELL - BEAM_THICKNESS, maxX: x0 + CELL, minZ: z0, maxZ: z0 + CELL, yMin: BEAM_BOTTOM, yMax: WALL_H });
      if (!noBeamNeighbors.has(at(gx, gz - 1)))
        beams.push({ minX: x0, maxX: x0 + CELL, minZ: z0, maxZ: z0 + BEAM_THICKNESS, yMin: BEAM_BOTTOM, yMax: WALL_H });
      if (!noBeamNeighbors.has(at(gx, gz + 1)))
        beams.push({ minX: x0, maxX: x0 + CELL, minZ: z0 + CELL - BEAM_THICKNESS, maxZ: z0 + CELL, yMin: BEAM_BOTTOM, yMax: WALL_H });
    }
  }

  if (!spawn) throw new Error('Maze has no spawn (S)');
  return {
    width,
    height,
    rows,
    spawn,
    walls: [...walls, ...beams, ...highDoors],
    doors,
    stations,
    decorations,
    numberZones,
    beams,
    highDoors,
  };
}

/**
 * Flood fill from spawn. By default doors/high-doors/corridor cells count as
 * open (verifies the grid has no accidentally sealed area). Pass chars in
 * `treatAsWall` to simulate closed gates — e.g. ['A', 'G'] models the state
 * before any puzzle is solved, proving sequential gating mechanically.
 */
export function reachableCells(
  rows: readonly string[],
  treatAsWall: readonly string[] = [],
): Set<string> {
  const parsed = parseMaze(rows);
  const blocked = new Set(['#', ...treatAsWall]);
  const seen = new Set<string>();
  const stack: GridPos[] = [parsed.spawn];
  const key = (p: GridPos) => `${p.gx},${p.gz}`;
  seen.add(key(parsed.spawn));
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur) break;
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const next = { gx: cur.gx + dx, gz: cur.gz + dz };
      const ch = rows[next.gz]?.[next.gx];
      if (ch === undefined || blocked.has(ch)) continue;
      if (!seen.has(key(next))) {
        seen.add(key(next));
        stack.push(next);
      }
    }
  }
  return seen;
}

/** Grid position of the first cell bearing `ch` — test helper. */
export function findCell(rows: readonly string[], ch: string): GridPos {
  for (let gz = 0; gz < rows.length; gz++) {
    const gx = rows[gz]?.indexOf(ch) ?? -1;
    if (gx >= 0) return { gx, gz };
  }
  throw new Error(`No "${ch}" cell in maze`);
}
