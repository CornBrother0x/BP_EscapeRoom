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

/** An oversized Windows-era 3.5" floppy disk on a small stand (defrag prop). */
function makeFloppyDisk(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x24387f, roughness: 0.55 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc2c6cf, roughness: 0.4, metalness: 0.5 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.74, 0.08), bodyMat);
  body.position.y = 1.0;
  const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.17, 0.11), metalMat);
  shutter.position.set(0.02, 1.29, 0);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.34),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#efe9d2',
        fg: '#20205a',
        width: 256,
        height: 150,
        font: 'bold 26px monospace',
      }),
    }),
  );
  label.position.set(0, 0.9, 0.045);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.32), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.07), standMat);
  post.position.y = 0.36;
  g.add(body, shutter, label, stand, post);
  return g;
}

/** A clipboard on a small stand (the modem reference sheet). */
function makeClipboard(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x6e4a29, roughness: 0.85 });
  const clipMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.4, metalness: 0.5 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const lean = -0.18;
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.66, 0.03), boardMat);
  board.position.set(0, 1.05, 0);
  board.rotation.x = lean;
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.56),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#f4f1e6',
        fg: '#222222',
        width: 220,
        height: 288,
        font: 'bold 28px monospace',
      }),
    }),
  );
  paper.position.set(0, 1.05, 0.02);
  paper.rotation.x = lean;
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.05), clipMat);
  clip.position.set(0, 1.37, 0.02);
  clip.rotation.x = lean;
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.34), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), standMat);
  post.position.set(0, 0.4, -0.05);
  g.add(stand, post, board, paper, clip);
  return g;
}

/** A shiny CD-ROM on a stand — the disk-like decoy (a dead end). */
function makeCD(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const discMat = new THREE.MeshStandardMaterial({ color: 0xccd0d8, roughness: 0.18, metalness: 0.75 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 40), discMat);
  disc.rotation.x = Math.PI / 2; // flat faces point ±z
  disc.position.y = 1.0;
  const label = new THREE.Mesh(
    new THREE.CircleGeometry(0.33, 40),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#d6b6e6',
        fg: '#3a1a5a',
        width: 256,
        height: 256,
        font: 'bold 24px monospace',
      }),
    }),
  );
  label.position.set(0, 1.0, 0.017);
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20),
    new THREE.MeshBasicMaterial({ color: 0x1a1a16 }),
  );
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 1.0, 0.02);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.28), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), standMat);
  post.position.set(0, 0.35, -0.05);
  g.add(stand, post, disc, label, hole);
  return g;
}

/** A media "play" button on a stand — the Rickroll dead end. */
function makePlayButton(): THREE.Group {
  const g = new THREE.Group();
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.5 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.12), panelMat);
  panel.position.y = 1.05;
  const icon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('▶', {
        bg: '#0a0a0a',
        fg: '#3be24a',
        width: 128,
        height: 128,
        font: 'bold 90px sans-serif',
      }),
    }),
  );
  icon.position.set(0, 1.05, 0.065);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.28), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.06), standMat);
  post.position.set(0, 0.36, -0.05);
  g.add(stand, post, panel, icon);
  return g;
}

/** A phone booth housing the dial-out terminal (P4). Open front faces +z. */
function makePhoneBooth(): THREE.Group {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a1c1c, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x201a1a, roughness: 0.8 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.2, 0.98), frameMat);
  roof.position.y = 2.15;
  const postGeo = new THREE.BoxGeometry(0.1, 2.05, 0.1);
  for (const [px, pz] of [
    [-0.44, -0.44],
    [0.44, -0.44],
    [-0.44, 0.44],
    [0.44, 0.44],
  ] as const) {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.position.set(px, 1.05, pz);
    g.add(post);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.7, 0.06), frameMat);
  back.position.set(0, 1.15, -0.44);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.4),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('COM1', {
        bg: '#001a06',
        fg: '#3be24a',
        width: 256,
        height: 200,
        font: 'bold 34px monospace',
      }),
    }),
  );
  screen.position.set(0, 1.4, -0.4);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.2), darkMat);
  shelf.position.set(0, 1.02, -0.34);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.22, 0.06),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('PHONE', {
        bg: '#111111',
        fg: '#ffd24a',
        width: 256,
        height: 80,
        font: 'bold 40px monospace',
      }),
    }),
  );
  sign.position.set(0, 1.98, 0.46);
  g.add(roof, back, screen, shelf, sign);
  return g;
}

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
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = makeCD("ENCARTA '95");
      obj.rotation.y = Math.atan2(nx, nz);
      obj.position.set(x, 0, z);
      decoyMeshes.push(obj);
    } else if (deco.id === 'rickroll') {
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = makePlayButton();
      obj.rotation.y = Math.atan2(nx, nz);
      obj.position.set(x, 0, z);
      rickrollMeshes.push(obj);
    } else if (deco.id === 'sign') {
      const { nx, nz } = wallNormal(parsed, deco.cell.gx, deco.cell.gz);
      obj = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), signMat);
      obj.position.set(x - nx * (CELL / 2 - 0.05), 1.7, z - nz * (CELL / 2 - 0.05));
      obj.lookAt(x + nx, 1.7, z + nz);
      signMeshes.push(obj);
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

  // The screensaver's "OpenGL room" as a window on sector C's east wall.
  {
    const oglZ = cellCenter({ gx: 0, gz: 13 }).z;
    const wallX = (parsed.width - 1) * CELL - 0.06;
    const ogl = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      new THREE.MeshBasicMaterial({ map: loadChunkyTexture('/sprites/opengl-room.png', 1, 1) }),
    );
    ogl.position.set(wallX, 2.1, oglZ);
    ogl.lookAt(wallX - 2, 2.1, oglZ);
    group.add(ogl);
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
      case 'defrag-crt': {
        // A giant 3.5" floppy — the disk you're defragmenting.
        const { nx, nz } = wallNormal(parsed, station.cell.gx, station.cell.gz);
        obj = makeFloppyDisk('ASTERION.DSK');
        obj.rotation.y = Math.atan2(nx, nz);
        obj.position.set(x, 0, z);
        break;
      }
      case 'manual': {
        const { nx, nz } = wallNormal(parsed, station.cell.gx, station.cell.gz);
        obj = makeClipboard('hayes.txt');
        obj.rotation.y = Math.atan2(nx, nz);
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
