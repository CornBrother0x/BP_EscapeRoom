/**
 * SPRINT 2 SPIKE — the flip mechanic (Puzzle 3 risk).
 *
 * Proves, in one contained scene:
 *  - camera roll (world flips 180° with an animated roll)
 *  - control inversion while flipped (mouse + strafe)
 *  - height-band collision (ceiling beams become corridors when flipped)
 *  - a room sealed at floor level, enterable ONLY via a high doorway while
 *    walking on the ceiling (this is exactly how sector D works)
 *
 * This module is spike-grade: Sprint 3 replaces it with real systems
 * (maze from ASCII data, state store, interaction raycast).
 */
import * as THREE from 'three';
import { resolveMove, type Band, type WallBox } from '../engine/collision';
import { createThree, loadChunkyTexture } from '../engine/renderer';
import { Input } from '../engine/input';

const ROOM_H = 4;
const EYE = 1.7;
const SPEED = 5.0;
const RADIUS = 0.35;
const FLIP_SECONDS = 0.9;

interface FlipState {
  t: number; // 0 = upright, 1 = flipped (animated)
  target: 0 | 1;
  armed: boolean; // hysteresis so one touch = one flip
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Every wall in the spike scene. See docs/puzzles.md maze v0 for the shape. */
function buildWalls(): WallBox[] {
  const full = (minX: number, maxX: number, minZ: number, maxZ: number): WallBox => ({
    minX,
    maxX,
    minZ,
    maxZ,
    yMin: 0,
    yMax: ROOM_H,
  });
  return [
    // Room A outer shell (x -8..8, z -8..8)
    full(-8.6, 8.6, -8.6, -8), // north
    full(-8.6, 8.6, 8, 8.6), // south
    full(-8.6, -8, -8.6, 8.6), // west
    // East wall, shared with room B — split around the high doorway
    full(8, 8.6, -8.6, -1.2),
    full(8, 8.6, 1.2, 8.6),
    // Doorway filler: solid floor..2, OPEN 2..4 (flipped players pass)
    { minX: 8, maxX: 8.6, minZ: -1.2, maxZ: 1.2, yMin: 0, yMax: 2.0 },
    // Ceiling beams forming the inverted corridor (solid only near ceiling)
    { minX: 0, maxX: 8, minZ: -1.5, maxZ: -1.2, yMin: 2.6, yMax: ROOM_H },
    { minX: 0, maxX: 8, minZ: 1.2, maxZ: 1.5, yMin: 2.6, yMax: ROOM_H },
    // Room B outer shell (x 8.6..15, z -3..3) — sealed at floor level
    full(15, 15.6, -3.6, 3.6), // east
    full(8.6, 15.6, -3.6, -3), // north
    full(8.6, 15.6, 3, 3.6), // south
  ];
}

function textPlane(text: string, w: number, h: number, bg: string, fg: string): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fg;
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  return mesh;
}

function buildScene(scene: THREE.Scene): { polyhedra: THREE.Mesh[] } {
  const brick = new THREE.MeshBasicMaterial({ map: loadChunkyTexture('/textures/brick.png', 2, 1) });
  const wood = new THREE.MeshBasicMaterial({ map: loadChunkyTexture('/textures/floor-wood.png', 8, 8) });
  const tile = new THREE.MeshBasicMaterial({ map: loadChunkyTexture('/textures/ceiling.png', 8, 8) });

  // Wall meshes from the collision boxes (visuals = physics, one source of truth)
  for (const w of buildWalls()) {
    const geo = new THREE.BoxGeometry(w.maxX - w.minX, w.yMax - w.yMin, w.maxZ - w.minZ);
    const mesh = new THREE.Mesh(geo, brick);
    mesh.position.set((w.minX + w.maxX) / 2, (w.yMin + w.yMax) / 2, (w.minZ + w.maxZ) / 2);
    scene.add(mesh);
  }

  // Floors and ceilings for both rooms
  const addFlat = (
    mat: THREE.MeshBasicMaterial,
    y: number,
    faceUp: boolean,
    cx: number,
    cz: number,
    sx: number,
    sz: number,
  ) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), mat);
    mesh.rotation.x = faceUp ? -Math.PI / 2 : Math.PI / 2;
    mesh.position.set(cx, y, cz);
    scene.add(mesh);
  };
  addFlat(wood, 0, true, 0, 0, 17.2, 17.2); // room A floor
  addFlat(tile, ROOM_H, false, 0, 0, 17.2, 17.2); // room A ceiling
  addFlat(wood, 0, true, 11.8, 0, 6.4, 6); // room B floor
  addFlat(tile, ROOM_H, false, 11.8, 0, 6.4, 6); // room B ceiling

  // The payoff: the number painted on the ceiling, readable when flipped
  const number = textPlane('555-0195', 3, 0.75, '#000080', '#ffffff');
  number.rotation.x = Math.PI / 2; // faces down from the ceiling
  number.position.set(4, ROOM_H - 0.01, 0);
  scene.add(number);

  const marker = textPlane('SECTOR D — SEALED', 4, 1, '#7c0000', '#ffffff');
  marker.position.set(14.9, 2, 0);
  marker.rotation.y = -Math.PI / 2;
  scene.add(marker);

  // The quarantined polyhedra (touch to flip). Shaded like the original.
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(3, 6, 2);
  scene.add(dir);

  const polyMat = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, flatShading: true });
  const polyhedra: THREE.Mesh[] = [];
  for (const [x, z] of [
    [-4, 0],
    [11.8, 0],
  ] as const) {
    const poly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55), polyMat);
    poly.position.set(x, 2, z);
    scene.add(poly);
    polyhedra.push(poly);
  }
  return { polyhedra };
}

function overlayHtml(paused: boolean): string {
  return `
    <div class="window" style="width: 380px">
      <div class="title-bar">
        <div class="title-bar-text">M.A.Z.E. — engine spike (Sprint 2)</div>
      </div>
      <div class="window-body">
        <p>${paused ? 'Paused.' : 'Flip-mechanic proving ground.'}</p>
        <p>WASD move · mouse look · walk into the gray object to flip the world.</p>
        <p>Goal: find the painted number, then get inside the sealed room.</p>
        <section style="text-align:center; margin: 8px 0">
          <button id="start-btn">${paused ? 'Resume' : 'Run anyway'}</button>
        </section>
      </div>
    </div>`;
}

export function startSpike(app: HTMLElement, overlay: HTMLElement): void {
  const { renderer, scene, camera } = createThree(app);
  const input = new Input();
  const { polyhedra } = buildScene(scene);
  const walls = buildWalls();

  // Camera rig: player (yaw) -> pitchObj -> camera (roll while flipped)
  const player = new THREE.Object3D();
  const pitchObj = new THREE.Object3D();
  player.add(pitchObj);
  pitchObj.add(camera);
  scene.add(player);
  player.position.set(-6, EYE, -6);

  let yaw = Math.PI / 4;
  let pitch = 0;
  const flip: FlipState = { t: 0, target: 0, armed: true };

  const showOverlay = (paused: boolean) => {
    overlay.innerHTML = overlayHtml(paused);
    overlay.classList.remove('hidden');
    overlay.querySelector('#start-btn')?.addEventListener('click', () => {
      renderer.domElement.requestPointerLock();
    });
  };
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement) overlay.classList.add('hidden');
    else showOverlay(true);
  });
  showOverlay(false);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const locked = Boolean(document.pointerLockElement);
    const flipped = flip.t > 0.5;
    const animating = flip.t !== flip.target;

    // Animate the flip
    if (animating) {
      const dir = flip.target === 1 ? 1 : -1;
      flip.t = Math.max(0, Math.min(1, flip.t + (dir * dt) / FLIP_SECONDS));
    }
    const ease = smoothstep(flip.t);
    camera.rotation.z = Math.PI * ease;
    const eyeY = EYE + (ROOM_H - 2 * EYE) * ease; // 1.7 upright -> 2.3 flipped

    if (locked) {
      // Look (inverted while flipped: screen-right must stay screen-right)
      const inv = flipped ? -1 : 1;
      const m = input.consumeMouse();
      yaw -= m.dx * 0.0022 * inv;
      pitch -= m.dy * 0.0022 * inv;
      pitch = Math.max(-1.45, Math.min(1.45, pitch));

      // Move (only when not mid-flip; strafe inverts while flipped)
      if (!animating) {
        const f = (input.isDown('KeyW') ? 1 : 0) - (input.isDown('KeyS') ? 1 : 0);
        const s = ((input.isDown('KeyD') ? 1 : 0) - (input.isDown('KeyA') ? 1 : 0)) * inv;
        if (f !== 0 || s !== 0) {
          const fx = -Math.sin(yaw) * f + Math.cos(yaw) * s;
          const fz = -Math.cos(yaw) * f - Math.sin(yaw) * s;
          const len = Math.hypot(fx, fz);
          const band: Band = flipped
            ? { yMin: ROOM_H - 1.9, yMax: ROOM_H - 0.1 }
            : { yMin: 0.1, yMax: 1.9 };
          const next = resolveMove(
            player.position.x,
            player.position.z,
            (fx / len) * SPEED * dt,
            (fz / len) * SPEED * dt,
            RADIUS,
            band,
            walls,
          );
          player.position.x = next.x;
          player.position.z = next.z;
        }
      }
    } else {
      input.consumeMouse();
    }

    player.position.y = eyeY;
    player.rotation.y = yaw;
    pitchObj.rotation.x = pitch;

    // Polyhedra: spin, and flip the world on touch (with hysteresis)
    let nearAny = false;
    for (const poly of polyhedra) {
      poly.rotation.x += dt * 0.7;
      poly.rotation.y += dt * 1.1;
      const d = Math.hypot(
        poly.position.x - player.position.x,
        poly.position.z - player.position.z,
      );
      if (d < 1.4) nearAny = true;
    }
    if (nearAny && flip.armed && !animating) {
      flip.target = flip.target === 1 ? 0 : 1;
      flip.armed = false;
    } else if (!nearAny) {
      flip.armed = true;
    }

    renderer.render(scene, camera);
  });
}
