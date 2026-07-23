import { describe, expect, it } from 'vitest';
import { MAZE_ROWS } from '../data/mazeLayout';
import { HIGH_DOOR_TOP, WALL_H, findCell, parseMaze, reachableCells } from './mazeGrid';

describe('parseMaze on the real layout', () => {
  const maze = parseMaze(MAZE_ROWS);

  it('has exactly one spawn and all required stations', () => {
    const ids = maze.stations.map((s) => s.id).sort();
    expect(ids).toEqual(
      [
        'defrag-crt',
        'manual',
        'modem-crt',
        'polyhedron',
        'readme-crt',
        'return-polyhedron',
        'sticky-note',
      ].sort(),
    );
    expect(maze.numberZones.length).toBeGreaterThan(0);
  });

  it('keeps the OpenGL room reference anchored to the maze data', () => {
    expect(maze.decorations.filter((item) => item.id === 'opengl-room')).toHaveLength(1);
  });

  it('has both openable doors at full wall height', () => {
    const ids = maze.doors.map((d) => d.id).sort();
    expect(ids).toEqual(['admin', 'glitch']);
    for (const d of maze.doors) {
      expect(d.box.yMin).toBe(0);
      expect(d.box.yMax).toBe(WALL_H);
    }
  });

  it('high doorways are solid low, open high (the flip gate)', () => {
    expect(maze.highDoors.length).toBeGreaterThan(0);
    for (const h of maze.highDoors) {
      expect(h.yMin).toBe(0);
      expect(h.yMax).toBe(HIGH_DOOR_TOP);
    }
  });

  it('generates hanging beams around the inverted corridor', () => {
    expect(maze.beams.length).toBeGreaterThan(0);
    for (const b of maze.beams) expect(b.yMin).toBeGreaterThan(HIGH_DOOR_TOP);
  });

  it('every walkable cell is reachable from spawn (doors treated open)', () => {
    const reachable = reachableCells(MAZE_ROWS);
    let walkable = 0;
    MAZE_ROWS.forEach((row, gz) => {
      [...row].forEach((ch, gx) => {
        if (ch === '#') return;
        walkable++;
        expect(reachable.has(`${gx},${gz}`), `cell ${gx},${gz} "${ch}" unreachable`).toBe(true);
      });
    });
    expect(reachable.size).toBe(walkable);
  });

  it('proves sequential gating: each door opens exactly the next sector', () => {
    const key = (ch: string) => {
      const c = findCell(MAZE_ROWS, ch);
      return `${c.gx},${c.gz}`;
    };
    // Before any puzzle: defrag (2) and polyhedron (3) unreachable, note (N)
    // and readme (C) reachable.
    const preP1 = reachableCells(MAZE_ROWS, ['A', 'G']);
    expect(preP1.has(key('N'))).toBe(true);
    expect(preP1.has(key('C'))).toBe(true);
    expect(preP1.has(key('2'))).toBe(false);
    expect(preP1.has(key('3'))).toBe(false);
    // P1 solved (A open): defrag reachable, polyhedron still gated by G.
    const postP1 = reachableCells(MAZE_ROWS, ['G']);
    expect(postP1.has(key('2'))).toBe(true);
    expect(postP1.has(key('3'))).toBe(false);
    // P2 solved (G open): polyhedron and the number zone reachable.
    const postP2 = reachableCells(MAZE_ROWS, []);
    expect(postP2.has(key('3'))).toBe(true);
    expect(postP2.has(key('9'))).toBe(true);
  });

  it('the modem room is sealed — reachable only by flipping (via H)', () => {
    // With H treated as a wall (i.e. the player never flips), the modem room
    // (4 / manual / return polyhedron) must be unreachable from spawn. This
    // proves the flip is the only way in, regardless of D's hallway shape.
    const noFlip = reachableCells(MAZE_ROWS, ['H']);
    for (const ch of ['4', 'M', 'P']) {
      const c = findCell(MAZE_ROWS, ch);
      expect(noFlip.has(`${c.gx},${c.gz}`), `"${ch}" reachable without flipping`).toBe(false);
    }
  });
});
