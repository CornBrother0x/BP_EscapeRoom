/**
 * Grid-free collision primitives for the maze.
 *
 * Walls are axis-aligned boxes that are only solid within a vertical range
 * [yMin, yMax]. The player is a circle (top-down) occupying a vertical body
 * band. A wall only collides if its vertical range intersects the player's
 * band — this is what makes the flip mechanic work: a doorway high in a wall
 * is solid for an upright player (band near the floor) and open for a flipped
 * player walking on the ceiling (band near the ceiling).
 */

export interface WallBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  yMin: number;
  yMax: number;
}

export interface Band {
  yMin: number;
  yMax: number;
}

export function bandIntersects(band: Band, wall: WallBox): boolean {
  return band.yMin < wall.yMax && band.yMax > wall.yMin;
}

function circleHitsRect(x: number, z: number, radius: number, w: WallBox): boolean {
  const cx = Math.max(w.minX, Math.min(x, w.maxX));
  const cz = Math.max(w.minZ, Math.min(z, w.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < radius * radius;
}

/**
 * Attempt a move, resolving each axis independently so the player slides
 * along walls instead of sticking to them.
 */
export function resolveMove(
  x: number,
  z: number,
  dx: number,
  dz: number,
  radius: number,
  band: Band,
  walls: readonly WallBox[],
): { x: number; z: number } {
  const active = walls.filter((w) => bandIntersects(band, w));
  let nx = x + dx;
  if (active.some((w) => circleHitsRect(nx, z, radius, w))) nx = x;
  let nz = z + dz;
  if (active.some((w) => circleHitsRect(nx, nz, radius, w))) nz = z;
  return { x: nx, z: nz };
}
