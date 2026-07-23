/** Builds the three.js scene from the parsed maze — visuals mirror the
 * collision boxes so there is one source of truth for geometry. */
import * as THREE from 'three';
import type { WallBox } from '../engine/collision';
import { loadChunkyTexture } from '../engine/renderer';
import { CELL, WALL_H, cellCenter, type DoorId, type ParsedMaze, type StationId } from './mazeGrid';
import { makeNoiseTexture, makeTextTexture, textPlane } from './textures';
import { SCRIPT } from '../data/script';

/** A beige IBM-style desktop: monitor + horizontal case + green DOS screen. */
function makeRetroPC(caseMat: THREE.Material, darkMat: THREE.Material, label: string): THREE.Group {
  const pc = new THREE.Group();
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.56, 0.58), caseMat);
  monitor.position.set(0, 1.16, 0);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42), darkMat);
  bezel.position.set(0, 1.18, 0.3);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.34),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(label, {
        bg: '#001a06',
        fg: '#3be24a',
        width: 256,
        height: 200,
        font: 'bold 30px monospace',
      }),
    }),
  );
  screen.position.set(0, 1.18, 0.305);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.26, 0.6), caseMat);
  base.position.set(0, 0.61, 0.02);
  const floppy = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.02), darkMat);
  floppy.position.set(0.09, 0.66, 0.33);
  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.016, 10),
    new THREE.MeshBasicMaterial({ color: 0x8fff5a }),
  );
  led.position.set(-0.24, 0.6, 0.33);
  pc.add(monitor, bezel, screen, base, floppy, led);
  return pc;
}

export interface MazeWorld {
  readonly group: THREE.Group;
  readonly stationMeshes: ReadonlyMap<StationId, THREE.Object3D>;
  readonly doorMeshes: ReadonlyMap<DoorId, THREE.Object3D>;
  /** Static walls + every still-closed door. */
  activeWalls(): readonly WallBox[];
  openDoor(id: DoorId): void;
}

function boxMesh(box: WallBox, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(box.maxX - box.minX, box.yMax - box.yMin, box.maxZ - box.minZ),
    material,
  );
  mesh.position.set(
    (box.minX + box.maxX) / 2,
    (box.yMin + box.yMax) / 2,
    (box.minZ + box.maxZ) / 2,
  );
  return mesh;
}

/** Find a neighboring wall cell so wall-mounted props can face the room. */
function wallNormal(parsed: ParsedMaze, gx: number, gz: number): { nx: number; nz: number } {
  for (const [dx, dz] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ] as const) {
    if (parsed.rows[gz + dz]?.[gx + dx] === '#') return { nx: -dx, nz: -dz };
  }
  return { nx: 0, nz: 1 };
}

export function buildMaze(parsed: ParsedMaze): MazeWorld {
  const group = new THREE.Group();
  const brick = new THREE.MeshBasicMaterial({
    map: loadChunkyTexture('/textures/brick.png', 1, 1),
  });

  for (const box of parsed.walls) group.add(boxMesh(box, brick));

  // Floor + ceiling spanning the whole grid
  const w = parsed.width * CELL;
  const d = parsed.height * CELL;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: loadChunkyTexture('/textures/floor-wood.png', parsed.width, parsed.height),
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(w / 2, 0, d / 2);
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: loadChunkyTexture('/textures/ceiling.png', parsed.width, parsed.height),
    }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(w / 2, WALL_H, d / 2);
  group.add(ceiling);

  // Openable doors
  const doorMeshes = new Map<DoorId, THREE.Object3D>();
  const closedDoors = new Map<DoorId, WallBox>();
  for (const door of parsed.doors) {
    const material =
      door.id === 'admin'
        ? new THREE.MeshBasicMaterial({
            map: makeTextTexture('ADMIN ACCESS REQUIRED', {
              bg: '#000080',
              fg: '#ffffff',
              font: 'bold 40px monospace',
            }),
          })
        : new THREE.MeshBasicMaterial({ map: makeNoiseTexture() });
    const mesh = boxMesh(door.box, material);
    group.add(mesh);
    doorMeshes.set(door.id, mesh);
    closedDoors.set(door.id, door.box);
  }

  // P1 hint tier 2: security poster on the wall beside the admin door
  const adminDoor = parsed.doors.find((d) => d.id === 'admin');
  if (adminDoor) {
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.4),
      new THREE.MeshBasicMaterial({
        map: makeTextTexture('SECURITY WEEK: is YOUR password on a sticky note?', {
          bg: '#f0f0e0',
          fg: '#7c0000',
          width: 1024,
          font: 'bold 36px monospace',
        }),
      }),
    );
    poster.position.set(
      (adminDoor.cell.gx - 0.5) * CELL,
      1.7,
      adminDoor.cell.gz * CELL - 0.02,
    );
    poster.rotation.y = Math.PI;
    group.add(poster);
  }

  // The painted number on the inverted corridor's ceiling
  for (const zone of parsed.numberZones) {
    const { x, z } = cellCenter(zone);
    const decal = textPlane('555-0195', CELL * 0.95, CELL * 0.4, '#000080', '#ffffff');
    decal.rotation.x = Math.PI / 2;
    decal.position.set(x, WALL_H - 0.02, z);
    group.add(decal);
    const label = textPlane('EXTERNAL LINE', CELL * 0.8, CELL * 0.22, '#000000', '#e57732');
    label.rotation.x = Math.PI / 2;
    label.position.set(x, WALL_H - 0.02, z + CELL * 0.35);
    group.add(label);
  }

  // Lighting only matters for the shaded polyhedra (walls are unlit, per DNA)
  group.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(10, 20, 5);
  group.add(dirLight);

  // Screensaver callbacks: rat + smiley as crossed-plane billboards, the
  // OpenGL logo as a wall decal. Transparent PNGs via alphaTest.
  const spriteMat = (url: string) =>
    new THREE.MeshBasicMaterial({
      map: loadChunkyTexture(url, 1, 1),
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
  const crossedBillboard = (mat: THREE.Material, w: number, h: number, y: number): THREE.Group => {
    const g = new THREE.Group();
    for (const rot of [0, Math.PI / 2]) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      plane.rotation.y = rot;
      g.add(plane);
    }
    g.position.y = y;
    return g;
  };
  const ratMat = spriteMat('/sprites/rat.png');
  const smileyMat = spriteMat('/sprites/smiley.png');
  const openglMat = spriteMat('/sprites/opengl.png');
  for (const deco of parsed.decorations) {
    const { x, z } = cellCenter(deco.cell);
    let obj: THREE.Object3D;
    if (deco.id === 'rat') {
      obj = crossedBillboard(ratMat, 1.1, 0.53, 0.28);
      obj.position.set(x, 0, z);
    } else if (deco.id === 'smiley') {
      obj = crossedBillboard(smileyMat, 0.9, 0.9, 1.4);
      obj.position.set(x, 0, z);
    } else {
      // OpenGL logo: flat decal on the nearest wall.
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.21), openglMat);
      obj.position.set(x - nx * (CELL / 2 - 0.05), 2.4, z - nz * (CELL / 2 - 0.05));
      obj.lookAt(x + nx, 2.4, z + nz);
    }
    group.add(obj);
  }

  // Station props
  const stationMeshes = new Map<StationId, THREE.Object3D>();
  const polyMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, flatShading: true });
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xcabf98, roughness: 0.92 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x24241e, roughness: 0.8 });
  const screenLabels: Partial<Record<StationId, string>> = {
    'readme-crt': 'readme.txt',
    'defrag-crt': 'DEFRAG.EXE',
    'modem-crt': 'COM1',
  };

  for (const station of parsed.stations) {
    const { x, z } = cellCenter(station.cell);
    let obj: THREE.Object3D;
    switch (station.id) {
      case 'polyhedron':
      case 'return-polyhedron': {
        obj = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55), polyMat);
        obj.position.set(x, 2, z);
        break;
      }
      case 'sticky-note': {
        const { nx, nz } = wallNormal(parsed, station.cell.gx, station.cell.gz);
        obj = textPlane(SCRIPT.p1.stickyNote, 0.7, 0.5, '#f7e97d', '#222222');
        obj.position.set(x - nx * (CELL / 2 - 0.06), 1.5, z - nz * (CELL / 2 - 0.06));
        obj.lookAt(x + nx, 1.5, z + nz);
        break;
      }
      case 'manual': {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.7), caseMat);
        desk.position.set(x, 0.4, z);
        const page = textPlane('hayes.txt (3/3)', 0.6, 0.35, '#ffffff', '#222222');
        page.rotation.x = -Math.PI / 2;
        page.position.set(x, 0.81, z);
        obj = new THREE.Group();
        obj.add(desk, page);
        break;
      }
      default: {
        // Beige IBM-style PC, screen facing into the room.
        const { nx, nz } = wallNormal(parsed, station.cell.gx, station.cell.gz);
        obj = makeRetroPC(caseMat, darkMat, screenLabels[station.id] ?? '');
        obj.rotation.y = Math.atan2(nx, nz);
        obj.position.set(x, 0, z);
        break;
      }
    }
    group.add(obj);
    stationMeshes.set(station.id, obj);
  }

  return {
    group,
    stationMeshes,
    doorMeshes,
    activeWalls() {
      return [...parsed.walls, ...closedDoors.values()];
    },
    openDoor(id: DoorId) {
      const mesh = doorMeshes.get(id);
      if (mesh) group.remove(mesh);
      closedDoors.delete(id);
    },
  };
}
