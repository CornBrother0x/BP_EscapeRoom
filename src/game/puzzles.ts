/**
 * The interactive puzzles: P1 admin console, P4 modem terminal (two-phase),
 * the station dispatch table, and Clippy's H-key hints. Holds the small amount
 * of puzzle-local state (eval progress, hint counts) in a closure; anything
 * that crosses into other modules lives on `ctx.session`.
 */
import { SCRIPT } from '../data/script';
import { hideOverlay, renderWindow, showWindow } from '../ui/dialogs';
import { mountDefrag } from '../puzzles/defrag/defrag';
import { classifyDialCommand, isAdminPassword } from './validators';
import { createEvalState, isOptionLocked, pickOption } from './evalConsole';
import { clippyRevealBeat, finaleBeat } from './screens';
import type { Player } from '../engine/player';
import type { GameContext } from './context';

export interface Puzzles {
  interactions: Record<string, () => void>;
  askClippy(): void;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function createPuzzles(ctx: GameContext, player: Player): Puzzles {
  const { store, audio, clippy, world, overlay } = ctx;
  let evalState = createEvalState();
  const evalTranscript: string[] = [];
  const askCounts: Record<'P3' | 'P4', number> = { P3: 0, P4: 0 };

  // ---- P1: admin console ----
  function openAdminConsole(): void {
    if (store.get().phase !== 'P1' || !ctx.openDialog('admin')) return;
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
        ctx.interactor.remove('admin-door');
        ctx.addContext(SCRIPT.contextBuffer.entries.hayes1);
        ctx.addContext(SCRIPT.contextBuffer.entries.flagged);
        const done = renderWindow(overlay, {
          title: SCRIPT.p1.dialogTitle,
          bodyHtml: `
            <p style="font-family:monospace">${SCRIPT.p1.successGreeting}<br><br>
            MOTD — ${SCRIPT.p1.motd}<br><br>
            <span style="color:#7c0000">SYSTEM LOG: ${SCRIPT.p1.flaggedLog}</span></p>
            <section style="text-align:center"><button id="admin-continue">${SCRIPT.p1.continueButton}</button></section>`,
          width: 460,
        });
        done.querySelector('#admin-continue')?.addEventListener('click', ctx.closeDialog);
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
    body.querySelector('#admin-cancel')?.addEventListener('click', ctx.closeDialog);
    pwInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
  }

  // ---- P4: two-phase — convince the technician, then dial out ----
  function openTerminal(): void {
    if (store.get().phase !== 'P4') return;
    if (player.flipped) {
      ctx.toast('You cannot work the terminal upside down. Flip back first.');
      return;
    }
    if (!ctx.openDialog('terminal')) return;
    if (ctx.session.lineConnected) renderDialTerminal();
    else renderEvalConsole();
  }

  // Phase A: the eval console — a 3-round conversation with the technician.
  function renderEvalConsole(): void {
    const ev = SCRIPT.p4.eval;
    if (clippy.visible && !ctx.session.modemIntroShown) {
      ctx.session.modemIntroShown = true;
      clippy.say(ev.clippyIntro, 0);
    }
    if (evalTranscript.length === 0) evalTranscript.push(ev.framing);
    const stage = ev.stages[evalState.stage];
    if (stage && !evalTranscript.includes(stage.tech)) {
      evalTranscript.push(stage.tech);
    }
    const done = evalState.stage >= ev.stages.length;
    const logHtml = evalTranscript
      .map((l) =>
        l.startsWith('ASTERION>')
          ? `<span style="color:#9ad">${escapeHtml(l)}</span>`
          : escapeHtml(l),
      )
      .join('<br>');
    const optionsHtml =
      stage && !done
        ? stage.options
            .map((opt, i) =>
              isOptionLocked(evalState.stage, i, ctx.session.modemManualRead)
                ? `<button disabled style="text-align:left">${ev.optionLocked}</button>`
                : `<button data-opt="${i}" style="text-align:left">${escapeHtml(opt.text)}</button>`,
            )
            .join('')
        : '';
    const body = renderWindow(overlay, {
      title: ev.title,
      bodyHtml: `
        <div id="eval-log" style="font-family:monospace;font-size:12px;background:#000;color:#33ff33;padding:8px;height:180px;overflow-y:auto">${logHtml}</div>
        <p style="margin:8px 0 4px;font-size:11px">${ev.progressLabel}: ${'●'.repeat(evalState.stage)}${'○'.repeat(Math.max(0, ev.stages.length - evalState.stage))} &nbsp; ${ev.composePrompt}</p>
        <div style="display:flex;flex-direction:column;gap:4px;text-align:left">${optionsHtml}</div>
        <section style="text-align:center;margin-top:8px"><button id="eval-close">${SCRIPT.ui.close}</button></section>`,
      width: 540,
    });
    const log = body.querySelector<HTMLElement>('#eval-log');
    if (log) log.scrollTop = log.scrollHeight;
    body.querySelectorAll<HTMLButtonElement>('button[data-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.opt);
        const opt = stage?.options[idx];
        if (!opt) return;
        evalTranscript.push(`ASTERION> ${opt.text}`);
        evalTranscript.push(opt.reply);
        const next = pickOption(evalState, idx, ctx.session.modemManualRead);
        if (next.stage > evalState.stage) {
          evalState = next;
          audio.play('click');
          if (evalState.connected) {
            audio.play('chime');
            evalTranscript.push(ev.success);
            evalTranscript.push(ev.connected);
            ctx.session.lineConnected = true;
            askCounts.P4 = 0;
            clippy.hideBalloon();
            renderEvalConsole();
            // Only swap in the dial terminal if the eval window is still open
            // (the player may Close during this beat; re-opening the booth then
            // goes straight to the dial terminal since lineConnected is true).
            setTimeout(() => {
              if (ctx.dialogId() === 'terminal' && store.get().mode === 'PUZZLE_UI') {
                renderDialTerminal();
              }
            }, 1900);
            return;
          }
        } else {
          audio.play('error');
        }
        renderEvalConsole();
      });
    });
    body.querySelector('#eval-close')?.addEventListener('click', ctx.closeDialog);
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
    const print = (line: string, emphasized = false) => {
      if (log) {
        const row = document.createElement(emphasized ? 'em' : 'span');
        row.textContent = line;
        log.append(row, document.createElement('br'));
        log.scrollTop = log.scrollHeight;
      }
    };
    const responses = {
      CONNECT: SCRIPT.p4.connect,
      ERROR_NO_AT: SCRIPT.p4.errors.noAt,
      OK_NOOP: SCRIPT.p4.errors.okNoop,
      NO_OUTSIDE_LINE: SCRIPT.p4.errors.noOutsideLine,
      NO_CARRIER: SCRIPT.p4.errors.noCarrier,
      ERROR_NO_DIAL_MODE: SCRIPT.p4.errors.noDialMode,
    } as const;
    termIn?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !termIn.value.trim()) return;
      const cmd = termIn.value;
      termIn.value = '';
      print(`> ${cmd}`);
      const result = classifyDialCommand(cmd);
      print(responses[result]);
      if (result === 'CONNECT') {
        audio.play('chime');
        termIn.disabled = true;
        if (store.solvePuzzle('P4')) void finaleBeat(ctx);
      } else {
        if (result !== 'OK_NOOP') audio.play('error');
        fails++;
        if (fails === 2) print(SCRIPT.p4.hints.a2, true);
        if (fails === 4) print(SCRIPT.p4.hints.a1, true);
      }
    });
    body.querySelector('#term-close')?.addEventListener('click', ctx.closeDialog);
  }

  // ---- Station dispatch ----
  const interactions: Record<string, () => void> = {
    'sticky-note': () => {
      if (!ctx.openDialog('note')) return;
      ctx.addContext(SCRIPT.contextBuffer.entries.stickyNote);
      showWindow(overlay, {
        title: 'Sticky note',
        bodyHtml: `<p style="font-family:monospace;background:#f7e97d;color:#222;padding:12px">${SCRIPT.p1.stickyNote}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: ctx.closeDialog }],
      });
    },
    'readme-crt': () => {
      if (!ctx.openDialog('readme')) return;
      showWindow(overlay, {
        title: 'readme.txt',
        bodyHtml: `<p style="font-family:monospace">${SCRIPT.p1.hints.t1}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: ctx.closeDialog }],
      });
    },
    'admin-door': openAdminConsole,
    'defrag-crt': () => {
      if (store.get().phase !== 'P2') {
        if (!ctx.openDialog('defrag-busy')) return;
        showWindow(overlay, {
          title: SCRIPT.p2.windowTitle,
          bodyHtml: `<p>${SCRIPT.p2.unavailable}</p>`,
          buttons: [{ label: SCRIPT.ui.close, onClick: ctx.closeDialog }],
        });
        return;
      }
      if (!ctx.openDialog('defrag')) return;
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
        initialBoard: ctx.session.defragBoard,
        onBoardChange: (board) => {
          ctx.session.defragBoard = board;
        },
        onRowComplete: (completed) => audio.defragStep(completed - 1),
        onSolved: () => {
          if (store.solvePuzzle('P2')) {
            audio.defragComplete();
            world.openDoor('glitch');
            audio.play('derez');
            ctx.addContext(SCRIPT.contextBuffer.entries.hayes2);
          }
          setTimeout(() => {
            handle.destroy();
            if (store.closePuzzleUI()) {
              ctx.setDialogId(null);
              hideOverlay(overlay);
              void clippyRevealBeat(ctx);
            }
          }, 1800);
        },
      });
      closeBtn.addEventListener('click', () => {
        handle.destroy();
        // Solved-then-closed-early still gets the reveal.
        if (store.get().phase === 'P3' && !clippy.visible) {
          if (store.closePuzzleUI()) {
            ctx.setDialogId(null);
            hideOverlay(overlay);
            void clippyRevealBeat(ctx);
          }
          return;
        }
        ctx.closeDialog();
      });
    },
    manual: () => {
      if (!ctx.openDialog('manual')) return;
      ctx.session.modemManualRead = true;
      ctx.addContext(SCRIPT.contextBuffer.entries.hayes3);
      ctx.addContext(SCRIPT.contextBuffer.entries.dl7);
      showWindow(overlay, {
        title: 'HAYES COMPATIBLE MODEM — QUICK REFERENCE',
        bodyHtml: `<p style="font-family:monospace">${SCRIPT.p4.manualText}</p>
          <p style="font-family:monospace;color:#7c0000;border-top:1px solid #888;padding-top:8px">${SCRIPT.p4.manualPolicy}</p>`,
        buttons: [{ label: SCRIPT.ui.close, onClick: ctx.closeDialog }],
        width: 480,
      });
    },
    'modem-crt': openTerminal,
  };

  // ---- Clippy hints (H) ----
  function askClippy(): void {
    const phase = store.get().phase;
    if (!clippy.visible || (phase !== 'P3' && phase !== 'P4')) return;
    const p4Tiers = ctx.session.lineConnected
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

  return { interactions, askClippy };
}
