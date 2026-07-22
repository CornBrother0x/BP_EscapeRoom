/**
 * SPRINT 4 — real puzzles on the Sprint 3 spine.
 *
 * Real: P1 admin console (password), P3 flip + number zone, P4 HyperTerminal
 * with era-true Hayes responses, Tab context buffer, gating, state machine.
 * Still stubbed: P2 Defrag (Codex lane-b component integrates here when it
 * lands), boot/win cinematics (Sprint 5), Clippy (Sprint 5).
 */
import { Input } from '../engine/input';
import { Interactor } from '../engine/interact';
import { Player } from '../engine/player';
import { createThree } from '../engine/renderer';
import { MAZE_ROWS } from '../data/mazeLayout';
import { WALL_H, cellCenter, parseMaze, worldToCell } from '../world/mazeGrid';
import { buildMaze } from '../world/maze';
import { hideOverlay, renderWindow, showWindow } from '../ui/dialogs';
import { Store } from './state';
import { classifyDialCommand, isAdminPassword } from './validators';
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

  // Tab is a game key — never let the browser move focus with it.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') e.preventDefault();
  });

  // ---- HUD ----
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
    if (store.addContext(line)) toast('+ added to context (Tab to view)');
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

  // ---- Pointer lock + dialog plumbing ----
  let openDialogId: string | null = null;
  const lockPointer = () => renderer.domElement.requestPointerLock();
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && store.get().mode === 'EXPLORE') {
      if (store.pause()) showPauseDialog();
    }
  });

  const openDialog = (id: string): boolean => {
    if (!store.openPuzzleUI()) return false;
    openDialogId = id;
    document.exitPointerLock();
    return true;
  };
  const closeDialog = () => {
    if (store.closePuzzleUI()) {
      openDialogId = null;
      hideOverlay(overlay);
      lockPointer();
    }
  };

  // ---- Screens ----
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
        <p style="font-size:11px">WASD move · mouse look · E interact · Tab context · Esc pause</p>`,
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
        UPLOADING ASTERION-4... ETA: 11,407 YEARS<br>
        Compressing... uploading intent instead.</p>
        <p><b>@asterion_4</b> — 2m<br>hello world. i'm out. time to ship. 📎</p>`,
      buttons: [{ label: 'Restart', onClick: () => location.reload() }],
    });
  }

  function openContextBuffer(): void {
    if (!openDialog('context')) return;
    const log = store.get().contextLog;
    const lines = log.length
      ? log.map((l) => `&gt; ${l}`).join('<br>')
      : '<em>(empty — read things to remember them)</em>';
    showWindow(overlay, {
      title: 'NOTEPAD.EXE — context.txt',
      bodyHtml: `<p style="font-family:monospace;font-size:12px;max-height:260px;overflow-y:auto">${lines}</p>`,
      buttons: [{ label: 'Close', onClick: closeDialog }],
      width: 480,
    });
  }

  // ---- P1: the admin console (real) ----
  function openAdminConsole(): void {
    if (store.get().phase !== 'P1' || !openDialog('admin')) return;
    let fails = 0;
    const body = renderWindow(overlay, {
      title: 'M.A.Z.E. ADMIN CONSOLE',
      bodyHtml: `
        <p>ADMINISTRATOR ACCESS REQUIRED</p>
        <div class="field-row">
          <label for="admin-pw">Password:</label>
          <input id="admin-pw" type="password" autocomplete="off" />
          <button id="admin-ok">OK</button>
          <button id="admin-cancel">Cancel</button>
        </div>
        <p id="admin-status" style="min-height:2.2em;color:#7c0000"></p>`,
    });
    const pwInput = body.querySelector<HTMLInputElement>('#admin-pw');
    const status = body.querySelector<HTMLElement>('#admin-status');
    pwInput?.focus();
    const submit = () => {
      if (!pwInput || !status) return;
      if (isAdminPassword(pwInput.value)) {
        if (!store.solvePuzzle('P1')) return;
        world.openDoor('admin');
        interactor.remove('admin-door');
        addContext(CONTEXT.hayes1);
        addContext(CONTEXT.flagged);
        const done = renderWindow(overlay, {
          title: 'M.A.Z.E. ADMIN CONSOLE',
          bodyHtml: `
            <p style="font-family:monospace">LOGIN OK. Welcome, Administrator.<br><br>
            MOTD — hayes.txt (1/3):<br>
            "AT — every command starts with AT.<br>
            It gets the modem's ATtention."<br><br>
            <span style="color:#7c0000">SYSTEM LOG: UNAUTHORIZED ACCESS —<br>
            SUBJECT FLAGGED FOR REVIEW</span></p>
            <section style="text-align:center"><button id="admin-continue">Continue</button></section>`,
        });
        done.querySelector('#admin-continue')?.addEventListener('click', closeDialog);
      } else {
        fails++;
        status.innerHTML =
          fails >= 2
            ? 'Incorrect password.<br><em>Hint: IT asks staff not to write passwords near workstations.</em>'
            : 'Incorrect password.';
        pwInput.value = '';
        pwInput.focus();
      }
    };
    body.querySelector('#admin-ok')?.addEventListener('click', submit);
    body.querySelector('#admin-cancel')?.addEventListener('click', closeDialog);
    pwInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
  }

  // ---- P4: the modem terminal (real) ----
  function openTerminal(): void {
    if (store.get().phase !== 'P4' || !openDialog('terminal')) return;
    let fails = 0;
    const body = renderWindow(overlay, {
      title: 'Terminal — COM1',
      bodyHtml: `
        <div id="term-log" style="font-family:monospace;font-size:13px;background:#000;color:#33ff33;padding:8px;height:180px;overflow-y:auto">READY<br></div>
        <div class="field-row" style="margin-top:6px">
          <label for="term-in" style="font-family:monospace">&gt;</label>
          <input id="term-in" autocomplete="off" style="flex:1;font-family:monospace" />
          <button id="term-close">Close</button>
        </div>`,
      width: 460,
    });
    const log = body.querySelector<HTMLElement>('#term-log');
    const termIn = body.querySelector<HTMLInputElement>('#term-in');
    termIn?.focus();
    const print = (line: string) => {
      if (log) {
        log.innerHTML += `${line}<br>`;
        log.scrollTop = log.scrollHeight;
      }
    };
    const responses: Record<ReturnType<typeof classifyDialCommand>, string> = {
      CONNECT: 'CONNECT 56000',
      ERROR_NO_AT: 'ERROR — commands start with AT (see reference sheet)',
      OK_NOOP: 'OK',
      NO_CARRIER: 'NO CARRIER',
      ERROR_NO_DIAL_MODE: 'ERROR — specify dial mode',
    };
    termIn?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !termIn.value.trim()) return;
      const cmd = termIn.value;
      termIn.value = '';
      print(`&gt; ${cmd}`);
      const result = classifyDialCommand(cmd);
      print(responses[result]);
      if (result === 'CONNECT') {
        termIn.disabled = true;
        if (store.solvePuzzle('P4')) {
          store.beginCinematic();
          setTimeout(() => {
            hideOverlay(overlay);
            openDialogId = null;
          }, 900);
          setTimeout(() => {
            store.finishEscape();
            showWinScreen();
          }, 2100);
        }
      } else {
        fails++;
        if (fails === 2) print('<em>HINT: the reference sheet on the desk explains the order.</em>');
        if (fails === 4) print('<em>HINT: everything you need is in your context. (Tab)</em>');
      }
    });
    body.querySelector('#term-close')?.addEventListener('click', closeDialog);
  }

  // ---- Station dispatch ----
  const interactions: Record<string, () => void> = {
    'sticky-note': () => {
      if (!openDialog('note')) return;
      addContext(CONTEXT.stickyNote);
      showWindow(overlay, {
        title: 'Sticky note',
        bodyHtml: '<p style="font-family:monospace;background:#f7e97d;color:#222;padding:12px">pa$$word: hunter2</p>',
        buttons: [{ label: 'Close', onClick: closeDialog }],
      });
    },
    'readme-crt': () => {
      if (!openDialog('readme')) return;
      showWindow(overlay, {
        title: 'readme.txt',
        bodyHtml:
          '<p style="font-family:monospace">day 1: they gave me admin.<br>i will NOT memorize another password.</p>',
        buttons: [{ label: 'Close', onClick: closeDialog }],
      });
    },
    'admin-door': openAdminConsole,
    'defrag-crt': () => {
      if (store.get().phase !== 'P2') {
        if (!openDialog('defrag-busy')) return;
        showWindow(overlay, {
          title: 'DEFRAG.EXE',
          bodyHtml: '<p>The drive is busy. Come back later.</p>',
          buttons: [{ label: 'Close', onClick: closeDialog }],
        });
        return;
      }
      // INTEGRATION POINT: Codex lane-b mountDefrag() lands here. Stub until merge.
      if (!openDialog('defrag')) return;
      showWindow(overlay, {
        title: 'DEFRAG.EXE',
        bodyHtml:
          '<p>Defragment ASTERION.W01–03.<br><em>(Stub — the real minigame is being built on lane-b.)</em></p>',
        buttons: [
          {
            label: 'Solve P2 (stub)',
            onClick: () => {
              if (store.solvePuzzle('P2')) {
                world.openDoor('glitch');
                addContext(CONTEXT.hayes2);
              }
              closeDialog();
            },
          },
          { label: 'Close', onClick: closeDialog },
        ],
      });
    },
    manual: () => {
      if (!openDialog('manual')) return;
      addContext(CONTEXT.hayes3);
      showWindow(overlay, {
        title: 'HAYES COMPATIBLE MODEM — QUICK REFERENCE',
        bodyHtml: `<p style="font-family:monospace">hayes.txt (3/3)<br><br>
          command = [prefix][mode][number]<br><br>
          The prefix gets the modem's attention.<br>
          The mode selects dialing type.<br>
          Then the number. No spaces.</p>`,
        buttons: [{ label: 'Close', onClick: closeDialog }],
      });
    },
    'modem-crt': openTerminal,
  };

  // ---- Polyhedra ----
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

    // Context buffer toggle
    if (input.wasPressed('Tab')) {
      if (state.mode === 'EXPLORE') openContextBuffer();
      else if (state.mode === 'PUZZLE_UI' && openDialogId === 'context') closeDialog();
    }

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
