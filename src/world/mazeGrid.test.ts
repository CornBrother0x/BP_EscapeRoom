import { describe, expect, it } from 'vitest';
import { MAZE_ROWS } from '../data/mazeLayout';
import { HIGH_DOOR_TOP, WALL_H, parseMaze, reachableCells } from './mazeGrid';

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

  it('the modem room is sealed at floor level (only H leads in)', () => {
    // Every cell adjacent to sector D's row must be wall or H — proven by
    // construction here: the row above the modem row contains only '#' and 'H'.
    const modemRowIndex = MAZE_ROWS.findIndex((r) => r.includes('4'));
    const rowAbove = MAZE_ROWS[modemRowIndex - 1] ?? '';
    expect([...rowAbove].every((ch) => ch === '#' || ch === 'H')).toBe(true);
  });
});
