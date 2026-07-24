/** Builds the three.js scene from the parsed maze — visuals mirror the
 * collision boxes so there is one source of truth for geometry. */
import * as THREE from 'three';
import type { WallBox } from '../engine/collision';
import { loadChunkyTexture } from '../engine/renderer';
import { CELL, WALL_H, cellCenter, type DoorId, type ParsedMaze, type StationId } from './mazeGrid';
import { makeNoiseTexture, makeTextTexture, textPlane } from './textures';
import {
  makeCD,
  makeClipboard,
  makeFloppyDisk,
  makePhoneBooth,
  makePlayButton,
  makeRadio,
  makeRetroPC,
} from './props';
import { SCRIPT } from '../data/script';

export interface MazeWorld {
  readonly group: THREE.Group;
  readonly stationMeshes: ReadonlyMap<StationId, THREE.Object3D>;
  readonly doorMeshes: ReadonlyMap<DoorId, THREE.Object3D>;
  /** Clickable CD-ROM decoys (dead ends). */
  readonly decoyMeshes: readonly THREE.Object3D[];
  /** Clickable Rickroll play buttons (dead ends). */
  readonly rickrollMeshes: readonly THREE.Object3D[];
  /** Readable clue signs (dial-9 notice). */
  readonly signMeshes: readonly THREE.Object3D[];
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
        map: makeTextTexture(SCRIPT.p1.hints.t2, {
          bg: '#f0f0e0',
          fg: '#7c0000',
          width: 1024,
          font: 'bold 36px monospace',
        }),
      }),
    );
    poster.position.set((adminDoor.cell.gx - 0.5) * CELL, 1.7, adminDoor.cell.gz * CELL - 0.02);
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

  // Screensaver callbacks: rat + smiley as flat camera-facing sprites (2D in
  // 3D, Doom-style), the OpenGL logo as a wall decal. Transparent via alphaTest.
  const billboard = (url: string, w: number, h: number): THREE.Sprite => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: loadChunkyTexture(url, 1, 1),
        transparent: true,
        alphaTest: 0.5,
      }),
    );
    sprite.scale.set(w, h, 1);
    return sprite;
  };
  const openglMat = new THREE.MeshBasicMaterial({
    map: loadChunkyTexture('/sprites/opengl.png', 1, 1),
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });
  const openglRoomMat = new THREE.MeshBasicMaterial({
    map: loadChunkyTexture('/sprites/opengl-room.png', 1, 1),
  });
  const decoyMeshes: THREE.Object3D[] = [];
  const rickrollMeshes: THREE.Object3D[] = [];
  const signMeshes: THREE.Object3D[] = [];
  const signMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture('OUTSIDE LINE — DIAL 9', {
      bg: '#f0f0e0',
      fg: '#000080',
      width: 512,
      height: 160,
      font: 'bold 44px monospace',
    }),
  });
  for (const deco of parsed.decorations) {
    const { x, z } = cellCenter(deco.cell);
    let obj: THREE.Object3D;
    if (deco.id === 'rat') {
      obj = billboard('/sprites/rat.png', 1.1, 0.53);
      obj.position.set(x, 0.3, z);
    } else if (deco.id === 'smiley') {
      obj = billboard('/sprites/smiley.png', 0.95, 0.95);
      obj.position.set(x, 1.4, z);
    } else if (deco.id === 'cd') {
      obj = makeCD("ENCARTA '95");
      obj.rotation.y = Math.PI / 2; // faces east — you reach the decoy from the entrance to its east
      obj.position.set(x, 0, z);
      decoyMeshes.push(obj);
    } else if (deco.id === 'rickroll') {
      obj = makePlayButton();
      obj.rotation.y = -Math.PI / 2; // faces west — you arrive along the entrance corridor from its west
      obj.position.set(x, 0, z);
      rickrollMeshes.push(obj);
    } else if (deco.id === 'sign') {
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), signMat);
      obj.position.set(x - nx * (CELL / 2 - 0.05), 1.7, z - nz * (CELL / 2 - 0.05));
      obj.lookAt(x + nx, 1.7, z + nz);
      signMeshes.push(obj);
    } else if (deco.id === 'opengl-room') {
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), openglRoomMat);
      obj.position.set(x - nx * (CELL / 2 - 0.05), 2.1, z - nz * (CELL / 2 - 0.05));
      obj.lookAt(x + nx, 2.1, z + nz);
    } else {
      // OpenGL logo: flat decal on the nearest wall.
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.21), openglMat);
      obj.position.set(x - nx * (CELL / 2 - 0.05), 2.4, z - nz * (CELL / 2 - 0.05));
      obj.lookAt(x + nx, 2.4, z + nz);
    }
    group.add(obj);
  }

  // START marker floating at spawn (Win95 Start button — a screensaver nod),
  // facing the player's initial view.
  {
    const sp = cellCenter(parsed.spawn);
    const start = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 0.5),
      new THREE.MeshBasicMaterial({
        map: loadChunkyTexture('/sprites/start.png', 1, 1),
        transparent: true,
        alphaTest: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    start.position.set(sp.x, 1.3, sp.z + 1.2);
    start.rotation.y = Math.PI;
    group.add(start);
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
      case 'radio': {
        // A transistor radio, looping the spoken password. Faces east — you
        // reach this dead-end walking west, arriving from its east.
        obj = makeRadio('88.1 FM');
        obj.rotation.y = Math.PI / 2;
        obj.position.set(x, 0, z);
        break;
      }
      case 'defrag-crt': {
        // A giant 3.5" floppy — the disk you're defragmenting. Faces west; you
        // arrive at this far corner walking east along the serpentine.
        obj = makeFloppyDisk('ASTERION.DSK');
        obj.rotation.y = -Math.PI / 2;
        obj.position.set(x, 0, z);
        break;
      }
      case 'manual': {
        // hayes.txt clipboard in the final hall. Faces west, toward the drop-in
        // point just to its west where the player lands.
        obj = makeClipboard('hayes.txt');
        obj.rotation.y = -Math.PI / 2;
        obj.position.set(x, 0, z);
        break;
      }
      case 'modem-crt': {
        // Phone booth housing the dial-out terminal at the hallway's end.
        const { nx, nz } = wallNormal(parsed, station.cell.gx, station.cell.gz);
        obj = makePhoneBooth();
        obj.rotation.y = Math.atan2(nx, nz);
        obj.position.set(x, 0, z);
        break;
      }
      default: {
        // Beige IBM-style PC, screen facing into the room (readme station).
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
    decoyMeshes,
    rickrollMeshes,
    signMeshes,
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
