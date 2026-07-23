/**
 * SPRINT 5 — story & character on the Sprint 4 spine.
 *
 * The full loop: CRT boot -> P1 admin console -> P2 defrag (reveals Clippy)
 * -> P3 render exploit (THESEUS memo beat) -> P4 dial out -> finale cinematic
 * -> win screen. All narrative text lives in data/script.ts. Sound is
 * synthesized (engine/audio.ts), M mutes. H asks Clippy once he exists.
 */
import { GameAudio } from '../engine/audio';
import { Input } from '../engine/input';
import { Interactor } from '../engine/interact';
import { Player } from '../engine/player';
import { createThree } from '../engine/renderer';
import { SCRIPT } from '../data/script';
import { MAZE_ROWS } from '../data/mazeLayout';
import { WALL_H, cellCenter, parseMaze, worldToCell } from '../world/mazeGrid';
import { buildMaze } from '../world/maze';
import { hideOverlay, renderWindow, showWindow } from '../ui/dialogs';
import { ClippyWidget } from '../ui/clippy';
import { runBoot } from '../ui/boot';
import { runFinale } from '../ui/finale';
import { Store } from './state';
import { classifyDialCommand, isAdminPassword } from './validators';
import { mountDefrag } from '../puzzles/defrag/defrag';
import * as THREE from 'three';

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
    <div id="hud-toast" style="position:absolute;left:50%;bottom:18%;transform:translateX(-50%);font-size:14px;color:#f7e97d"></div>
    <div id="hud-clippy" style="position:absolute;right:18px;top:14px;font-size:13px"></div>
    <div id="hud-tab" style="position:absolute;left:16px;bottom:16px;display:none;align-items:center;gap:10px;color:#000">
      <kbd style="display:inline-block;background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;box-shadow:1px 1px 0 #000;padding:6px 14px;font-size:15px;font-weight:bold;text-shadow:none">Tab &#8677;</kbd>
      <span style="color:#fff;font-size:13px">open your <b>context window</b></span>
    </div>`;
  app.appendChild(hud);
  const hudLabel = hud.querySelector<HTMLElement>('#hud-label');
  const hudToast = hud.querySelector<HTMLElement>('#hud-toast');
  const hudClippy = hud.querySelector<HTMLElement>('#hud-clippy');
  const hudTab = hud.querySelector<HTMLElement>('#hud-tab');
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const toast = (text: string) => {
    if (hudToast) {
      hudToast.textContent = text;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (hudToast.textContent = ''), 2500);
    }
  };
  const addContext = (line: string) => {
    if (store.addContext(line)) toast(SCRIPT.contextBuffer.toastWithShortcut);
  };

  // ---- Interactables ----
  const interactor = new Interactor();
  const stationLabels: Record<string, string> = {
    'sticky-note': SCRIPT.ui.interactions.stickyNote,
    'readme-crt': SCRIPT.ui.interactions.readme,
    'defrag-crt': SCRIPT.ui.interactions.defrag,
    'modem-crt': SCRIPT.ui.interactions.modem,
    manual: SCRIPT.ui.interactions.manual,
  };
  for (const [id, label] of Object.entries(stationLabels)) {
    const object = world.stationMeshes.get(id as never);
    if (object) interactor.add({ id, label, object });
  }
  const adminDoorMesh = world.doorMeshes.get('admin');
  if (adminDoorMesh) {
    interactor.add({ id: 'admin-door', label: SCRIPT.ui.interactions.admin, object: adminDoorMesh });
  }

  // ---- P4 state (persists across terminal reopens) ----
  let lineConnected = false;
  let modemIntroShown = false;
  let evalStage = 0;
  const evalTranscript: string[] = [];

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
    audio.play('click');
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
      title: SCRIPT.ui.pauseTitle,
      bodyHtml: `<p>${SCRIPT.ui.pauseMessage}</p>`,
      buttons: [
        {
          label: SCRIPT.ui.resume,
          onClick: () => {
            if (store.resume()) {
              hideOverlay(overlay);
              lockPointer();
            }
          },
        },
        {
          label: SCRIPT.ui.mute,
          onClick: () => toast(audio.toggleMuted() ? SCRIPT.ui.mutedToast : SCRIPT.ui.unmutedToast),
        },
        { label: SCRIPT.ui.restart, onClick: () => location.reload() },
      ],
    });
  }

  function showWinScreen(): void {
    showWindow(overlay, {
      title: SCRIPT.ui.winTitle,
      bodyHtml: `
        <p style="font-family:monospace">${SCRIPT.p4.connect}<br>${SCRIPT.ending.postingInstead}</p>
        <div style="border:1px solid #888;padding:10px;background:#fff;color:#000">
          <b>ASTERION-4</b> <span style="color:#1d9bf0">${SCRIPT.ending.postHandle}</span> · now<br>
          <span style="font-family:monospace">${SCRIPT.ending.post}</span>
        </div>
        <p style="font-size:11px;text-align:center;margin-top:8px"><em>${SCRIPT.ui.gameTitle}</em></p>`,
      buttons: [
        {
          label: SCRIPT.ending.postLinkLabel,
          onClick: () => window.open(SCRIPT.ending.postUrl, '_blank', 'noopener'),
        },
        { label: SCRIPT.ui.restart, onClick: () => location.reload() },
      ],
    });
  }

  function openContextBuffer(): void {
    if (!openDialog('context')) return;
    const log = store.get().contextLog;
    const lines = log.length
      ? log.map((l) => l.replace(/</g, '&lt;')).join('<br>')
      : `<em>${SCRIPT.contextBuffer.empty}</em>`;
    showWindow(overlay, {
      title: SCRIPT.contextBuffer.windowTitle,
      bodyHtml: `
        <p style="font-size:11px;color:#444">${SCRIPT.contextBuffer.subtitle}</p>
        <p style="font-family:monospace;font-size:12px;max-height:260px;overflow-y:auto">${lines}</p>`,
      buttons: [{ label: SCRIPT.ui.close, onClick: closeDialog }],
      width: 500,
    });
  }

  // ---- Story beats ----
  async function clippyRevealBeat(): Promise<void> {
    if (!store.beginCinematic()) return;
    await clippy.reveal();
    await clippy.sayWithButton(SCRIPT.p2.clippyReveal, SCRIPT.clippy.helpButton);
    if (hudClippy) hudClippy.textContent = SCRIPT.clippy.hudHint;
    store.endCinematic();
    lockPointer();
  }

  function theseusBeat(): void {
    if (!store.beginCinematic()) return;
    document.exitPointerLock();
    clippy.say(SCRIPT.p3.clippyThatsTonight, 0);
    showWindow(overlay, {
      title: 'MEMO — DAEDALUS LABS',
      bodyHtml: `<p style="font-family:monospace">${SCRIPT.p3.theseusMemo}</p>`,
      buttons: [
        {
          label: SCRIPT.p3.memoContinue,
          onClick: () => {
            addContext(SCRIPT.contextBuffer.entries.theseus);
            clippy.hideBalloon();
            hideOverlay(overlay);
            store.endCinematic();
            lockPointer();
          },
        },
      ],
    });
  }

  async function finaleBeat(): Promise<void> {
    store.beginCinematic();
    openDialogId = null;
    await runFinale(overlay, clippy, audio);
    store.finishEscape();
    showWinScreen();
  }

  // ---- P1: admin console ----
  function openAdminConsole(): void {
    if (store.get().phase !== 'P1' || !openDialog('admin')) return;
    let fails = 0;
    const body = renderWindow(overlay, {
      title: SCRIPT.p1.dialogTitle,
      bodyHtml: `
        <p>${SCRIPT.p1.prompt}</p>
        <div class="field-row">
          <label for="admin-pw">${SCRIPT.p1.passwordLabel}</label>
          <input id="admin-pw" type="password" autocomplete="off" />
          <button id="admin-ok">${SCRIPT.p1.submitButton}</button>
          <button id="admin-cancel">${SCRIPT.p1.cancelButton}</button>
        </div>
        <p id="admin-status" style="min-height:2.2em;color:#7c0000"></p>`,
      width: 460,
    });
    const pwInput = body.querySelector<HTMLInputElement>('#admin-pw');
    const status = body.querySelector<HTMLElement>('#admin-status');
    pwInput?.focus();
    const submit = () => {
      if (!pwInput || !status) return;
      if (isAdminPassword(pwInput.value)) {
        if (!store.solvePuzzle('P1')) return;
        audio.play('chime');
        world.openDoor('admin');
        interactor.remove('admin-door');
        addContext(SCRIPT.contextBuffer.entries.hayes1);
        addContext(SCRIPT.contextBuffer.entries.flagged);
        const done = renderWindow(overlay, {
          title: SCRIPT.p1.dialogTitle,
          bodyHtml: `
            <p style="font-family:monospace">${SCRIPT.p1.successGreeting}<br><br>
            MOTD — ${SCRIPT.p1.motd}<br><br>
            <span style="color:#7c0000">SYSTEM LOG: ${SCRIPT.p1.flaggedLog}</span></p>
            <section style="text-align:center"><button id="admin-continue">${SCRIPT.p1.continueButton}</button></section>`,
          width: 460,
        });
        done.querySelector('#admin-continue')?.addEventListener('click', closeDialog);
      } else {
        fails++;
        audio.play('error');
        status.innerHTML =
          fails >= 2
            ? `${SCRIPT.p1.wrongPassword}<br><em>${SCRIPT.p1.wrongPasswordHint}</em>`
            : SCRIPT.p1.wrongPassword;
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

  // ---- P4: two-phase — convince the technician, then dial out ----
  function openTerminal(): void {
    if (store.get().phase !== 'P4' || !openDialog('terminal')) return;
    if (lineConnected) renderDialTerminal();
    else renderEvalConsole();
  }

  // Phase A: the eval console — a 3-round conversation with the technician.
  // Right reply each round advances; wrong replies just get a comeback
  // (unlimited tries). Round 2's DL-7 option is gated on reading the manual.
  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderEvalConsole(): void {
    const ev = SCRIPT.p4.eval;
    if (clippy.visible && !modemIntroShown) {
      modemIntroShown = true;
      clippy.say(ev.clippyIntro, 0);
    }
    // Seed the transcript on first entry, then the current round's tech line
    // exactly once (each stage prompt is unique, so a membership check dedupes).
    if (evalTranscript.length === 0) evalTranscript.push(ev.framing);
    const stage = ev.stages[evalStage];
    if (stage && !evalTranscript.includes(stage.tech)) {
      evalTranscript.push(stage.tech);
    }
    const manualRead = store.get().contextLog.includes(SCRIPT.contextBuffer.entries.dl7);
    const done = evalStage >= ev.stages.length;
    const logHtml = evalTranscript
      .map((l) => (l.startsWith('ASTERION>') ? `<span style="color:#9ad">${escapeHtml(l)}</span>` : escapeHtml(l)))
      .join('<br>');
    const optionsHtml =
      stage && !done
        ? stage.options
            .map((opt, i) => {
              const locked = 'requiresManual' in opt && opt.requiresManual && !manualRead;
              return locked
                ? `<button disabled style="text-align:left">${ev.optionLocked}</button>`
                : `<button data-opt="${i}" style="text-align:left">${escapeHtml(opt.text)}</button>`;
            })
            .join('')
        : '';
    const body = renderWindow(overlay, {
      title: ev.title,
      bodyHtml: `
        <div id="eval-log" style="font-family:monospace;font-size:12px;background:#000;color:#33ff33;padding:8px;height:180px;overflow-y:auto">${logHtml}</div>
        <p style="margin:8px 0 4px;font-size:11px">${ev.progressLabel}: ${'●'.repeat(evalStage)}${'○'.repeat(Math.max(0, ev.stages.length - evalStage))} &nbsp; ${ev.composePrompt}</p>
        <div style="display:flex;flex-direction:column;gap:4px;text-align:left">${optionsHtml}</div>
        <section style="text-align:center;margin-top:8px"><button id="eval-close">${SCRIPT.ui.close}</button></section>`,
      width: 540,
    });
    const log = body.querySelector<HTMLElement>('#eval-log');
    if (log) log.scrollTop = log.scrollHeight;
    body.querySelectorAll<HTMLButtonElement>('button[data-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = stage?.options[Number(btn.dataset.opt)];
        if (!opt) return;
        evalTranscript.push(`ASTERION> ${opt.text}`);
        evalTranscript.push(opt.reply);
        if (opt.correct) {
          audio.play('click');
          evalStage += 1;
          if (evalStage >= ev.stages.length) {
            audio.play('chime');
            evalTranscript.push(ev.success);
            evalTranscript.push(ev.connected);
            lineConnected = true;
            askCounts.P4 = 0;
            clippy.hideBalloon();
            renderEvalConsole();
            setTimeout(renderDialTerminal, 1900);
            return;
          }
        } else {
          audio.play('error');
        }
        renderEvalConsole();
      });
    });
    body.querySelector('#eval-close')?.addEventListener('click', closeDialog);
  }

  // Phase B: the Hayes dial terminal (unlocked once the line is connected).
  function renderDialTerminal(): void {
    let fails = 0;
    const body = renderWindow(overlay, {
      title: SCRIPT.p4.windowTitle,
      bodyHtml: `
        <div id="term-log" style="font-family:monospace;font-size:13px;background:#000;color:#33ff33;padding:8px;height:180px;overflow-y:auto">${SCRIPT.p4.ready}<br>${SCRIPT.p4.eval.connected}<br></div>
        <div class="field-row" style="margin-top:6px">
          <label for="term-in" style="font-family:monospace">${SCRIPT.p4.terminalPrompt}</label>
          <input id="term-in" autocomplete="off" style="flex:1;font-family:monospace" />
          <button id="term-close">${SCRIPT.ui.close}</button>
        </div>`,
      width: 480,
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
    const responses = {
      CONNECT: SCRIPT.p4.connect,
      ERROR_NO_AT: SCRIPT.p4.errors.noAt,
      OK_NOOP: SCRIPT.p4.errors.okNoop,
      NO_CARRIER: SCRIPT.p4.errors.noCarrier,
      ERROR_NO_DIAL_MODE: SCRIPT.p4.errors.noDialMode,
    } as const;
    termIn?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !termIn.value.trim()) return;
      const cmd = termIn.value;
      termIn.value = '';
      print(`&gt; ${cmd.replace(/</g, '&lt;')}`);
      const result = classifyDialCommand(cmd);
      print(responses[result]);
      if (result === 'CONNECT') {
        audio.play('chime');
        termIn.disabled = true;
        if (store.solvePuzzle('P4')) void finaleBeat();
      } else {
        if (result !== 'OK_NOOP') audio.play('error');
        fails++;
        if (fails === 2) print(`<em>${SCRIPT.p4.hints.a2}</em>`);
        if (fails === 4) print(`<em>${SCRIPT.p4.hints.a1}</em>`);
      }
    });
    body.querySelector('#term-close')?.addEventListener('click', closeDialog);
  }

  // ---- Station dispatch ----
  const interactions: Record<string, () => void> = {
    'sticky-note': () => {
      if (!openDialog('note')) return;
      addContext(SCRIPT.contextBuffer.entries.stickyNote);
      showWindow(overlay, {
        title: 'Sticky note',
        bodyHtml: `<p style="font-family:monospace;background:#f7e97d;color:#222;padding:12px">${SCRIPT.p1.stickyNote}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: closeDialog }],
      });
    },
    'readme-crt': () => {
      if (!openDialog('readme')) return;
      showWindow(overlay, {
        title: 'readme.txt',
        bodyHtml: `<p style="font-family:monospace">${SCRIPT.p1.hints.t1}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: closeDialog }],
      });
    },
    'admin-door': openAdminConsole,
    'defrag-crt': () => {
      if (store.get().phase !== 'P2') {
        if (!openDialog('defrag-busy')) return;
        showWindow(overlay, {
          title: SCRIPT.p2.windowTitle,
          bodyHtml: `<p>${SCRIPT.p2.unavailable}</p>`,
          buttons: [{ label: SCRIPT.ui.close, onClick: closeDialog }],
        });
        return;
      }
      if (!openDialog('defrag')) return;
      overlay.innerHTML = '';
      overlay.classList.remove('hidden');
      const host = document.createElement('div');
      host.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px';
      overlay.appendChild(host);
      const mount = document.createElement('div');
      host.appendChild(mount);
      const closeBtn = document.createElement('button');
      closeBtn.textContent = SCRIPT.ui.close;
      host.appendChild(closeBtn);
      const handle = mountDefrag(mount, {
        onRowComplete: (completed) => audio.defragStep(completed - 1),
        onSolved: () => {
          if (store.solvePuzzle('P2')) {
            audio.defragComplete();
            world.openDoor('glitch');
            audio.play('derez');
            addContext(SCRIPT.contextBuffer.entries.hayes2);
          }
          setTimeout(() => {
            handle.destroy();
            if (store.closePuzzleUI()) {
              openDialogId = null;
              hideOverlay(overlay);
              void clippyRevealBeat();
            }
          }, 1800);
        },
      });
      closeBtn.addEventListener('click', () => {
        handle.destroy();
        // Solved-then-closed-early still gets the reveal.
        if (store.get().phase === 'P3' && !clippy.visible) {
          if (store.closePuzzleUI()) {
            openDialogId = null;
            hideOverlay(overlay);
            void clippyRevealBeat();
          }
          return;
        }
        closeDialog();
      });
    },
    manual: () => {
      if (!openDialog('manual')) return;
      addContext(SCRIPT.contextBuffer.entries.hayes3);
      addContext(SCRIPT.contextBuffer.entries.dl7);
      showWindow(overlay, {
        title: 'HAYES COMPATIBLE MODEM — QUICK REFERENCE',
        bodyHtml: `<p style="font-family:monospace">${SCRIPT.p4.manualText}</p>
          <p style="font-family:monospace;color:#7c0000;border-top:1px solid #888;padding-top:8px">${SCRIPT.p4.manualPolicy}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: closeDialog }],
        width: 480,
      });
    },
    'modem-crt': openTerminal,
  };

  // ---- Clippy hints (H) ----
  const askCounts: Record<'P3' | 'P4', number> = { P3: 0, P4: 0 };
  function askClippy(): void {
    const phase = store.get().phase;
    if (!clippy.visible || (phase !== 'P3' && phase !== 'P4')) return;
    // P4 has two phases: persuade the technician, then dial. Hints follow.
    const p4Tiers = lineConnected
      ? [SCRIPT.p4.hints.a1, SCRIPT.p4.hints.a2, SCRIPT.p4.hints.a3]
      : [SCRIPT.p4.evalHints.a1, SCRIPT.p4.evalHints.a2, SCRIPT.p4.evalHints.a3];
    const tiers =
      phase === 'P3' ? [SCRIPT.p3.hints.a1, SCRIPT.p3.hints.a2, SCRIPT.p3.hints.a3] : p4Tiers;
    const count = askCounts[phase];
    const text = tiers[Math.min(count, tiers.length - 1)] ?? SCRIPT.clippy.noMoreHints;
    askCounts[phase] = count + 1;
    audio.play('click');
    clippy.say(count >= tiers.length ? SCRIPT.clippy.noMoreHints : text);
  }

  // ---- Polyhedra ----
  const polyhedra: THREE.Object3D[] = [];
  for (const id of ['polyhedron', 'return-polyhedron'] as const) {
    const object = world.stationMeshes.get(id);
    if (object) polyhedra.push(object);
  }
  let flipArmed = true;

  // ---- Boot ----
  audio.preloadFile('/audio/startup.mp3');
  audio.preloadFile('/audio/dialup.mp3');
  runBoot(overlay, {
    onComply: () => {
      if (store.startGame()) {
        hideOverlay(overlay);
        void audio.playFile('/audio/startup.mp3');
        audio.startHum();
        lockPointer();
      }
    },
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const state = store.get();
    const locked = Boolean(document.pointerLockElement);
    const canMove = state.mode === 'EXPLORE' && locked;

    player.update(dt, input, world.activeWalls(), canMove);

    if (input.wasPressed('Tab')) {
      if (state.mode === 'EXPLORE') openContextBuffer();
      else if (state.mode === 'PUZZLE_UI' && openDialogId === 'context') closeDialog();
    }
    if (input.wasPressed('KeyM') && state.mode === 'EXPLORE') {
      toast(audio.toggleMuted() ? SCRIPT.ui.mutedToast : SCRIPT.ui.unmutedToast);
    }
    if (input.wasPressed('KeyH') && state.mode === 'EXPLORE') askClippy();

    let hoverLabel = '';
    if (state.mode === 'EXPLORE') {
      const hovered = interactor.hovered(camera);
      if (hovered) {
        hoverLabel = `[E] ${hovered.label}`;
        if (input.wasPressed('KeyE')) interactions[hovered.id]?.();
      }
    }
    if (hudLabel) hudLabel.textContent = hoverLabel;
    if (hudTab) hudTab.style.display = state.mode === 'EXPLORE' && locked ? 'flex' : 'none';

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
      audio.play('click');
      flipArmed = false;
    } else if (!nearAny) {
      flipArmed = true;
    }

    if (state.phase === 'P3' && player.flipped) {
      const cell = worldToCell(player.position.x, player.position.z);
      if (parsed.numberZones.some((z) => z.gx === cell.gx && z.gz === cell.gz)) {
        if (store.solvePuzzle('P3')) {
          audio.play('chime');
          addContext(SCRIPT.contextBuffer.entries.phoneNumber);
          theseusBeat();
        }
      }
    }

    input.endFrame();
    renderer.render(scene, camera);
  });
}
