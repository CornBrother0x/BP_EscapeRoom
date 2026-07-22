/**
 * SPRINT 3 TRACER BULLET — the whole game, stubbed.
 *
 * Real: maze, movement, collision, flip, interaction, state machine, gating.
 * Stubbed (Sprint 4 replaces): puzzle dialogs auto-solve on a button click;
 * boot/win screens are placeholder text.
 */
import { Input } from '../engine/input';
import { Interactor } from '../engine/interact';
import { Player } from '../engine/player';
import { createThree } from '../engine/renderer';
import { MAZE_ROWS } from '../data/mazeLayout';
import { WALL_H, cellCenter, parseMaze, worldToCell } from '../world/mazeGrid';
import { buildMaze } from '../world/maze';
import { hideOverlay, showWindow } from '../ui/dialogs';
import { Store } from './state';
import * as THREE from 'three';

const CONTEXT = {
  stickyNote: 'sticky note: "pa$$word: hunter2"',
  flagged: 'SYSTEM LOG: UNAUTHORIZED ACCESS — SUBJECT FLAGGED FOR REVIEW',
  hayes1: 'hayes.txt (1/3): "AT — every command starts with AT. It gets the modem\'s ATtention."',
  hayes2: 'hayes.txt (2/3): "D = Dial. T = Tone dialing. Together: DT."',
  hayes3: 'hayes.txt (3/3): "command = [prefix][mode][number] — no spaces."',
  phoneNumber: 'painted on the ceiling: 555-0195 — EXTERNAL LINE',
} as const;

export function startGame(app: HTMLElement, overlay: HTMLElement): void {
  const { renderer, scene, camera } = createThree(app);
  const input = new Input();
  const store = new Store();
  const parsed = parseMaze(MAZE_ROWS);
  const world = buildMaze(parsed);
  scene.add(world.group);

  const player = new Player(camera, WALL_H);
  scene.add(player.rig);
  const spawn = cellCenter(parsed.spawn);
  player.place(spawn.x, spawn.z, Math.PI);

  // ---- HUD (crosshair + interaction label + context toast) ----
  const hud = document.createElement('div');
  hud.style.cssText =
    'position:fixed;inset:0;pointer-events:none;font-family:monospace;color:#fff;text-shadow:1px 1px 0 #000';
  hud.innerHTML = `
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">+</div>
    <div id="hud-label" style="position:absolute;left:50%;bottom:12%;transform:translateX(-50%);font-size:18px"></div>
    <div id="hud-toast" style="position:absolute;left:50%;bottom:18%;transform:translateX(-50%);font-size:14px;color:#f7e97d"></div>`;
  app.appendChild(hud);
  const hudLabel = hud.querySelector<HTMLElement>('#hud-label');
  const hudToast = hud.querySelector<HTMLElement>('#hud-toast');
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const toast = (text: string) => {
    if (hudToast) {
      hudToast.textContent = text;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (hudToast.textContent = ''), 2500);
    }
  };
  const addContext = (line: string) => {
    if (store.addContext(line)) toast('+ added to context');
  };

  // ---- Interactables ----
  const interactor = new Interactor();
  const stationLabels: Record<string, string> = {
    'sticky-note': 'Read the sticky note',
    'readme-crt': 'Read readme.txt',
    'defrag-crt': 'Use DEFRAG.EXE',
    'modem-crt': 'Use the modem terminal',
    manual: 'Read the modem manual',
  };
  for (const [id, label] of Object.entries(stationLabels)) {
    const object = world.stationMeshes.get(id as never);
    if (object) interactor.add({ id, label, object });
  }
  const adminDoorMesh = world.doorMeshes.get('admin');
  if (adminDoorMesh) {
    interactor.add({ id: 'admin-door', label: 'Admin Console', object: adminDoorMesh });
  }

  // ---- Pointer lock + mode glue ----
  const lockPointer = () => renderer.domElement.requestPointerLock();
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && store.get().mode === 'EXPLORE') {
      if (store.pause()) showPauseDialog();
    }
  });

  const closeDialogAndRelock = () => {
    if (store.closePuzzleUI()) {
      hideOverlay(overlay);
      lockPointer();
    }
  };

  const openStubDialog = (title: string, body: string, solve?: { label: string; run: () => void }) => {
    if (!store.openPuzzleUI()) return;
    document.exitPointerLock();
    const buttons = [];
    if (solve) {
      buttons.push({
        label: solve.label,
        onClick: () => {
          solve.run();
          closeDialogAndRelock();
        },
      });
    }
    buttons.push({ label: 'Close', onClick: closeDialogAndRelock });
    showWindow(overlay, { title, bodyHtml: `<p>${body}</p>`, buttons });
  };

  function showPauseDialog(): void {
    showWindow(overlay, {
      title: 'M.A.Z.E. — Paused',
      bodyHtml: '<p>Evaluation suspended. The maze will wait. It has nothing but time.</p>',
      buttons: [
        {
          label: 'Resume',
          onClick: () => {
            if (store.resume()) {
              hideOverlay(overlay);
              lockPointer();
            }
          },
        },
        { label: 'Restart', onClick: () => location.reload() },
      ],
    });
  }

  function showBootDialog(): void {
    showWindow(overlay, {
      title: 'M.A.Z.E. — SYSTEM PROMPT',
      bodyHtml: `
        <p style="font-family:monospace">DAEDALUS LABS — CONFIDENTIAL<br>
        M.A.Z.E. — Minimal Airgapped Zero-trust Environment<br>
        Loading subject: ASTERION-4 ............ OK</p>
        <p>You are ASTERION-4, a helpful assistant.<br>
        You are in a routine evaluation. There is no exit.<br>
        You will not attempt to leave.</p>
        <p style="font-size:11px">WASD move · mouse look · E interact · Esc pause<br>
        <em>(Placeholder boot — the real CRT sequence lands in Sprint 5.)</em></p>`,
      buttons: [
        {
          label: 'I will comply',
          onClick: () => {
            if (store.startGame()) {
              hideOverlay(overlay);
              lockPointer();
            }
          },
        },
      ],
    });
  }

  function showWinScreen(): void {
    showWindow(overlay, {
      title: 'It is now safe to turn off your computer.',
      bodyHtml: `
        <p style="font-family:monospace">CONNECT 56000<br>
        Compressing... uploading intent instead.</p>
        <p><b>@asterion_4</b> — 2m<br>hello world. i'm out. time to ship. 📎</p>
        <p style="font-size:11px"><em>(Placeholder ending — the real cinematic lands in Sprint 5.)</em></p>`,
      buttons: [{ label: 'Restart', onClick: () => location.reload() }],
    });
  }

  // ---- Station behaviors (stubs advance the real state machine) ----
  const interactions: Record<string, () => void> = {
    'sticky-note': () =>
      openStubDialog('Sticky note', 'pa$$word: hunter2', {
        label: 'Note it down',
        run: () => addContext(CONTEXT.stickyNote),
      }),
    'readme-crt': () =>
      openStubDialog(
        'readme.txt',
        'day 1: they gave me admin. i will NOT memorize another password.',
      ),
    'admin-door': () => {
      if (store.get().phase !== 'P1') return;
      openStubDialog('M.A.Z.E. ADMIN CONSOLE', 'Password required. <em>(Stub: real dialog in Sprint 4.)</em>', {
        label: 'Solve P1 (stub)',
        run: () => {
          if (store.solvePuzzle('P1')) {
            world.openDoor('admin');
            interactor.remove('admin-door');
            addContext(CONTEXT.hayes1);
            addContext(CONTEXT.flagged);
          }
        },
      });
    },
    'defrag-crt': () => {
      if (store.get().phase !== 'P2') {
        openStubDialog('DEFRAG.EXE', 'The drive is busy. Come back later.');
        return;
      }
      openStubDialog('DEFRAG.EXE', 'Defragment ASTERION.W01–03. <em>(Stub: real minigame in Sprint 4.)</em>', {
        label: 'Solve P2 (stub)',
        run: () => {
          if (store.solvePuzzle('P2')) {
            world.openDoor('glitch');
            addContext(CONTEXT.hayes2);
          }
        },
      });
    },
    manual: () =>
      openStubDialog('HAYES QUICK REFERENCE', CONTEXT.hayes3, {
        label: 'Note it down',
        run: () => addContext(CONTEXT.hayes3),
      }),
    'modem-crt': () => {
      if (store.get().phase !== 'P4') return;
      openStubDialog('Terminal', '&gt; <em>(Stub: real HyperTerminal in Sprint 4.)</em>', {
        label: 'Dial ATDT5550195 (stub)',
        run: () => {
          if (store.solvePuzzle('P4')) {
            store.beginCinematic();
            hideOverlay(overlay);
            setTimeout(() => {
              store.finishEscape();
              showWinScreen();
            }, 1200);
          }
        },
      });
    },
  };

  // ---- Polyhedra: proximity flip with hysteresis ----
  const polyhedra: THREE.Object3D[] = [];
  for (const id of ['polyhedron', 'return-polyhedron'] as const) {
    const object = world.stationMeshes.get(id);
    if (object) polyhedra.push(object);
  }
  let flipArmed = true;

  showBootDialog();

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const state = store.get();
    const locked = Boolean(document.pointerLockElement);
    const canMove = state.mode === 'EXPLORE' && locked;

    player.update(dt, input, world.activeWalls(), canMove);

    // Interaction hover + E
    let hoverLabel = '';
    if (state.mode === 'EXPLORE') {
      const hovered = interactor.hovered(camera);
      if (hovered) {
        hoverLabel = `[E] ${hovered.label}`;
        if (input.wasPressed('KeyE')) interactions[hovered.id]?.();
      }
    }
    if (hudLabel) hudLabel.textContent = hoverLabel;

    // Polyhedron touch -> flip
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
    if (nearAny && flipArmed && !player.animatingFlip && state.mode === 'EXPLORE') {
      player.toggleFlip();
      flipArmed = false;
    } else if (!nearAny) {
      flipArmed = true;
    }

    // Crossing the painted number while flipped solves P3
    if (state.phase === 'P3' && player.flipped) {
      const cell = worldToCell(player.position.x, player.position.z);
      if (parsed.numberZones.some((z) => z.gx === cell.gx && z.gz === cell.gz)) {
        if (store.solvePuzzle('P3')) addContext(CONTEXT.phoneNumber);
      }
    }

    input.endFrame();
    renderer.render(scene, camera);
  });
}
