import { describe, expect, it } from 'vitest';
import { bandIntersects, resolveMove, type WallBox } from './collision';

const UPRIGHT = { yMin: 0.1, yMax: 1.9 };
const FLIPPED = { yMin: 2.1, yMax: 3.9 };

// A doorway high in a wall: solid filler from floor to y=2, open 2..4.
const doorFiller: WallBox = { minX: 8, maxX: 8.6, minZ: -1.2, maxZ: 1.2, yMin: 0, yMax: 2.0 };
// A ceiling beam: hangs from the ceiling, y 2.6..4.
const beam: WallBox = { minX: 0, maxX: 8, minZ: 1.2, maxZ: 1.5, yMin: 2.6, yMax: 4 };

describe('bandIntersects', () => {
  it('upright player collides with the door filler but not the ceiling beam', () => {
    expect(bandIntersects(UPRIGHT, doorFiller)).toBe(true);
    expect(bandIntersects(UPRIGHT, beam)).toBe(false);
  });

  it('flipped player passes the door filler but collides with the ceiling beam', () => {
    expect(bandIntersects(FLIPPED, doorFiller)).toBe(false);
    expect(bandIntersects(FLIPPED, beam)).toBe(true);
  });
});

describe('resolveMove', () => {
  it('blocks an upright player walking into the high doorway', () => {
    const r = resolveMove(7.5, 0, 0.5, 0, 0.35, UPRIGHT, [doorFiller]);
    expect(r.x).toBe(7.5);
  });

  it('lets a flipped player walk through the high doorway', () => {
    const r = resolveMove(7.5, 0, 0.5, 0, 0.35, FLIPPED, [doorFiller]);
    expect(r.x).toBe(8);
  });

  it('slides along a wall instead of sticking', () => {
    // Moving diagonally into the door filler: x blocked, z free.
    const r = resolveMove(7.5, 0, 0.5, 0.4, 0.35, UPRIGHT, [doorFiller]);
    expect(r.x).toBe(7.5);
    expect(r.z).toBeCloseTo(0.4);
  });

  it('does not collide with walls outside the body band even when overlapping in XZ', () => {
    const r = resolveMove(4, 1, 0, 0.4, 0.35, UPRIGHT, [beam]);
    expect(r.z).toBeCloseTo(1.4);
  });
});
