/**
 * Orchestrator: builds the world and dependencies, wires interactables, and
 * runs the render loop. The UI screens, story beats, and puzzles live in
 * focused modules (screens.ts, puzzles.ts) sharing a small GameContext.
 *
 * The full loop: CRT boot -> P1 admin console -> P2 defrag (reveals Clippy)
 * -> P3 render exploit (THESEUS memo beat) -> P4 dial out -> finale cinematic
 * -> win screen. All narrative text lives in data/script.ts.
 */
import * as THREE from 'three';
import { GameAudio } from '../engine/audio';
import { Input } from '../engine/input';
import { Interactor } from '../engine/interact';
import { Player } from '../engine/player';
import { createThree } from '../engine/renderer';
import { SCRIPT } from '../data/script';
import { MAZE_ROWS } from '../data/mazeLayout';
import { WALL_H, cellCenter, parseMaze, worldToCell, type StationId } from '../world/mazeGrid';
import { buildMaze } from '../world/maze';
import { hideOverlay } from '../ui/dialogs';
import { ClippyWidget } from '../ui/clippy';
import { runBoot } from '../ui/boot';
import { Store } from './state';
import { createHud } from './hud';
import { createPuzzles } from './puzzles';
import type { GameContext, GameSession } from './context';
import {
  openContextBuffer,
  showDecoy,
  showDialSign,
  showPauseDialog,
  showRickroll,
  theseusBeat,
} from './screens';

export function startGame(app: HTMLElement, overlay: HTMLElement): void {
  const { renderer, scene, camera } = createThree(app);
  const input = new Input();
  const store = new Store();
  const audio = new GameAudio();
  const clippy = new ClippyWidget();
  const parsed = parseMaze(MAZE_ROWS);
  const world = buildMaze(parsed);
  scene.add(world.group);

  const player = new Player(camera, WALL_H);
  scene.add(player.rig);
  const spawn = cellCenter(parsed.spawn);
  player.place(spawn.x, spawn.z, Math.PI);

  const hud = createHud(app);

  // ---- Interactables ----
  const interactor = new Interactor();
  const stationLabels: readonly (readonly [StationId, string])[] = [
    ['radio', SCRIPT.ui.interactions.radio],
    ['readme-crt', SCRIPT.ui.interactions.readme],
    ['defrag-crt', SCRIPT.ui.interactions.defrag],
    ['modem-crt', SCRIPT.ui.interactions.modem],
    ['manual', SCRIPT.ui.interactions.manual],
  ];
  for (const [id, label] of stationLabels) {
    const object = world.stationMeshes.get(id);
    if (object) interactor.add({ id, label, object });
  }
  const adminDoorMesh = world.doorMeshes.get('admin');
  if (adminDoorMesh) {
    interactor.add({
      id: 'admin-door',
      label: SCRIPT.ui.interactions.admin,
      object: adminDoorMesh,
    });
  }
  world.decoyMeshes.forEach((mesh, i) =>
    interactor.add({ id: `decoy-${i}`, label: SCRIPT.decoy.label, object: mesh }),
  );
  world.rickrollMeshes.forEach((mesh, i) =>
    interactor.add({ id: `rickroll-${i}`, label: SCRIPT.rickroll.label, object: mesh }),
  );
  world.signMeshes.forEach((mesh, i) =>
    interactor.add({ id: `sign-${i}`, label: SCRIPT.dialSign.label, object: mesh }),
  );

  // ---- Pointer lock + dialog plumbing (the shared GameContext) ----
  const session: GameSession = {
    lineConnected: false,
    modemIntroShown: false,
    modemManualRead: false,
    defragBoard: undefined,
  };
  let openDialogId: string | null = null;
  const lockPointer = () => {
    // requestPointerLock returns a Promise in modern browsers; a rejected lock
    // (rapid re-lock, no user gesture) must not surface as an unhandled rejection.
    void Promise.resolve(renderer.domElement.requestPointerLock()).catch(() => {});
  };

  const ctx: GameContext = {
    store,
    audio,
    clippy,
    world,
    interactor,
    overlay,
    session,
    addContext: (line) => {
      if (store.addContext(line)) hud.toast(SCRIPT.contextBuffer.toastWithShortcut);
    },
    toast: hud.toast,
    lockPointer,
    openDialog: (id) => {
      if (!store.openPuzzleUI()) return false;
      openDialogId = id;
      audio.play('click');
      document.exitPointerLock();
      return true;
    },
    closeDialog: () => {
      if (store.closePuzzleUI()) {
        openDialogId = null;
        hideOverlay(overlay);
        lockPointer();
      }
    },
    dialogId: () => openDialogId,
    setDialogId: (id) => (openDialogId = id),
    showClippyHudHint: () => hud.setClippyHint(SCRIPT.clippy.hudHint),
  };

  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && store.get().mode === 'EXPLORE') {
      if (store.pause()) showPauseDialog(ctx);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab' && (store.get().mode === 'EXPLORE' || openDialogId === 'context')) {
      e.preventDefault();
    }
  });

  const { interactions, askClippy } = createPuzzles(ctx, player);

  // ---- Polyhedra (the flip objects) ----
  const polyhedra: THREE.Object3D[] = [];
  for (const id of ['polyhedron', 'return-polyhedron'] as const) {
    const object = world.stationMeshes.get(id);
    if (object) polyhedra.push(object);
  }
  let flipArmed = true;
  let chamberGreeted = false;
  let dGreeted = false;
  // Ambient-Clippy trigger rows, derived from the maze so they survive layout
  // edits: the smiley chamber (C) starts just past the glitch door; the sealed
  // hallway (D) starts just past the high door (H).
  const glitchRow = parsed.doors.find((d) => d.id === 'glitch')?.cell.gz ?? 0;
  const sealedRow = parsed.rows.findIndex((r) => r.includes('H'));
  // Smiley faces: world positions for the proximity "hey" chorus (P-none, pure
  // atmosphere). `last` is the elapsed-time stamp of this face's last whisper.
  const smileySpots = parsed.decorations
    .filter((d) => d.id === 'smiley')
    .map((d) => ({ ...cellCenter(d.cell), last: -99 }));

  // ---- Boot ----
  audio.preloadFile('/audio/startup.mp3');
  audio.preloadFile('/audio/voicemail.mp3'); // the P1 radio message
  audio.preloadFile('/audio/hey.mp3'); // the smiley chorus
  runBoot(overlay, {
    onStart: () => audio.unlock(),
    onType: () => audio.play('type'),
    onComply: () => {
      if (store.startGame()) {
        hideOverlay(overlay);
        void audio.playFile('/audio/startup.mp3');
        audio.startHum();
        void audio.startMusicLoop('/audio/music.mp3');
        lockPointer();
      }
    },
  });

  const timer = new THREE.Timer();
  timer.connect(document);
  renderer.setAnimationLoop(() => {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const state = store.get();
    const locked = Boolean(document.pointerLockElement);
    const canMove = state.mode === 'EXPLORE' && locked;

    player.update(dt, input, world.activeWalls(), canMove);

    if (input.wasPressed('Tab')) {
      if (state.mode === 'EXPLORE') openContextBuffer(ctx);
      else if (state.mode === 'PUZZLE_UI' && openDialogId === 'context') ctx.closeDialog();
    }
    if (input.wasPressed('KeyM') && state.mode === 'EXPLORE') {
      hud.toast(audio.toggleMuted() ? SCRIPT.ui.mutedToast : SCRIPT.ui.unmutedToast);
    }
    if (input.wasPressed('KeyH') && state.mode === 'EXPLORE') askClippy();

    let hoverLabel = '';
    if (state.mode === 'EXPLORE') {
      const hovered = interactor.hovered(camera);
      if (hovered) {
        hoverLabel = `[E] ${hovered.label}`;
        if (input.wasPressed('KeyE')) {
          if (hovered.id.startsWith('decoy-')) showDecoy(ctx);
          else if (hovered.id.startsWith('rickroll-')) showRickroll(ctx);
          else if (hovered.id.startsWith('sign-')) showDialSign(ctx);
          else interactions[hovered.id]?.();
        }
      }
    }
    hud.setLabel(hoverLabel);
    hud.showTab(state.mode === 'EXPLORE' && locked);

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
      audio.flip();
      flipArmed = false;
    } else if (!nearAny) {
      flipArmed = true;
    }

    // Ambient Clippy remarks entering the smiley chamber (C) and hallway (D).
    if (clippy.visible && state.mode === 'EXPLORE') {
      const cell = worldToCell(player.position.x, player.position.z);
      if (!dGreeted && sealedRow > 0 && cell.gz > sealedRow) {
        dGreeted = true;
        clippy.say(SCRIPT.clippy.psyop);
      } else if (!chamberGreeted && cell.gz > glitchRow) {
        chamberGreeted = true;
        clippy.say(SCRIPT.clippy.smileysCreepy);
      }
    }

    // Hall of faces: each smiley whispers a soft "hey" as you pass. A per-face
    // cooldown turns the chamber into an uneasy overlapping chorus, not a
    // machine-gun. Pitch is stable per face (each one has its own "voice");
    // pan follows the face's offset so the chorus spreads across the stereo field.
    if (state.mode === 'EXPLORE') {
      const now = timer.getElapsed();
      for (const spot of smileySpots) {
        const d = Math.hypot(spot.x - player.position.x, spot.z - player.position.z);
        if (d < 3.2 && now - spot.last > 4.5) {
          spot.last = now;
          const wobble = ((((spot.x * 7 + spot.z * 13) % 10) + 10) % 10) / 20;
          void audio.playHey('/audio/hey.mp3', 0.82 + wobble, (spot.x - player.position.x) / 4);
        }
      }
    }

    if (state.phase === 'P3' && player.flipped) {
      const cell = worldToCell(player.position.x, player.position.z);
      if (parsed.numberZones.some((z) => z.gx === cell.gx && z.gz === cell.gz)) {
        if (store.solvePuzzle('P3')) {
          audio.play('chime');
          audio.preloadFile('/audio/dialup.mp3');
          ctx.addContext(SCRIPT.contextBuffer.entries.phoneNumber);
          theseusBeat(ctx);
        }
      }
    }

    input.endFrame();
    renderer.render(scene, camera);
  });
}
