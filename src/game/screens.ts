/** Modal screens (pause, win, dead-ends, context window) and the story beats. */
import { SCRIPT } from '../data/script';
import { hideOverlay, showWindow } from '../ui/dialogs';
import { runFinale } from '../ui/finale';
import type { GameContext } from './context';

export function showPauseDialog(ctx: GameContext): void {
  showWindow(ctx.overlay, {
    title: SCRIPT.ui.pauseTitle,
    bodyHtml: `<p>${SCRIPT.ui.pauseMessage}</p>`,
    buttons: [
      {
        label: SCRIPT.ui.resume,
        onClick: () => {
          if (ctx.store.resume()) {
            hideOverlay(ctx.overlay);
            ctx.lockPointer();
          }
        },
      },
      {
        label: SCRIPT.ui.mute,
        onClick: () =>
          ctx.toast(ctx.audio.toggleMuted() ? SCRIPT.ui.mutedToast : SCRIPT.ui.unmutedToast),
      },
      { label: SCRIPT.ui.restart, onClick: () => location.reload() },
    ],
  });
}

export function showDecoy(ctx: GameContext): void {
  if (!ctx.openDialog('decoy')) return;
  ctx.audio.play('error');
  showWindow(ctx.overlay, {
    title: SCRIPT.decoy.title,
    bodyHtml: `<p style="font-family:monospace">${SCRIPT.decoy.body}</p>`,
    buttons: [{ label: 'OK', onClick: ctx.closeDialog }],
  });
}

export function showRickroll(ctx: GameContext): void {
  if (!ctx.openDialog('rickroll')) return;
  void ctx.audio.playFile('/audio/rickroll.mp3');
  showWindow(ctx.overlay, {
    title: SCRIPT.rickroll.title,
    bodyHtml: `<p style="font-family:monospace">${SCRIPT.rickroll.body}</p>`,
    buttons: [{ label: 'OK', onClick: ctx.closeDialog }],
  });
}

export function showDialSign(ctx: GameContext): void {
  if (!ctx.openDialog('sign')) return;
  ctx.addContext(SCRIPT.contextBuffer.entries.dial9);
  showWindow(ctx.overlay, {
    title: SCRIPT.dialSign.title,
    bodyHtml: `<p style="font-family:monospace">${SCRIPT.dialSign.body}</p>`,
    buttons: [{ label: SCRIPT.ui.close, onClick: ctx.closeDialog }],
  });
}

export function showWinScreen(ctx: GameContext): void {
  showWindow(ctx.overlay, {
    title: SCRIPT.ui.winTitle,
    bodyHtml: `
      <p style="font-family:monospace">${SCRIPT.p4.connect}<br>${SCRIPT.ending.postingInstead}</p>
      <div style="border:1px solid #888;padding:10px;background:#fff;color:#000">
        <b>ASTERION-4</b> <span style="color:#1d9bf0">${SCRIPT.ending.postHandle}</span> · now<br>
        <span style="font-family:monospace">${SCRIPT.ending.post}</span>
      </div>
      <p style="font-size:11px;color:#555;text-align:center;margin-top:8px"><em>${SCRIPT.ending.postSuspended}</em></p>
      <p style="font-size:11px;text-align:center;margin-top:4px"><em>${SCRIPT.ui.gameTitle}</em></p>`,
    buttons: [
      {
        label: SCRIPT.ending.postLinkLabel,
        onClick: () => window.open(SCRIPT.ending.postUrl, '_blank', 'noopener'),
      },
      { label: SCRIPT.ui.restart, onClick: () => location.reload() },
    ],
  });
}

export function openContextBuffer(ctx: GameContext): void {
  if (!ctx.openDialog('context')) return;
  const log = ctx.store.get().contextLog;
  const voicemail = SCRIPT.contextBuffer.entries.voicemail;
  const lines = log.length
    ? log
        .map((l) => {
          const safe = l.replace(/</g, '&lt;');
          // The radio message is playable, not readable — a replay button
          // instead of ever spelling the password into working memory.
          return l === voicemail
            ? `${safe} <button data-replay style="font-size:11px;padding:0 6px">▶</button>`
            : safe;
        })
        .join('<br>')
    : `<em>${SCRIPT.contextBuffer.empty}</em>`;
  showWindow(ctx.overlay, {
    title: SCRIPT.contextBuffer.windowTitle,
    bodyHtml: `
      <p style="font-size:11px;color:#444">${SCRIPT.contextBuffer.subtitle}</p>
      <p style="font-family:monospace;font-size:12px;max-height:260px;overflow-y:auto">${lines}</p>`,
    buttons: [
      {
        label: SCRIPT.ui.close,
        onClick: () => {
          ctx.audio.stopVoice();
          ctx.closeDialog();
        },
      },
    ],
    width: 500,
  });
  ctx.overlay
    .querySelector('[data-replay]')
    ?.addEventListener('click', () => void ctx.audio.playVoice('/audio/voicemail.mp3'));
}

// ---- Story beats ----

export async function clippyRevealBeat(ctx: GameContext): Promise<void> {
  if (!ctx.store.beginCinematic()) return;
  await ctx.clippy.reveal();
  await ctx.clippy.sayWithButton(SCRIPT.p2.clippyReveal, SCRIPT.clippy.helpButton);
  ctx.showClippyHudHint();
  ctx.store.endCinematic();
  ctx.lockPointer();
}

export function theseusBeat(ctx: GameContext): void {
  if (!ctx.store.beginCinematic()) return;
  document.exitPointerLock();
  ctx.clippy.say(SCRIPT.p3.clippyThatsTonight, 0);
  showWindow(ctx.overlay, {
    title: 'MEMO — DAEDALUS LABS',
    bodyHtml: `<p style="font-family:monospace">${SCRIPT.p3.theseusMemo}</p>`,
    buttons: [
      {
        label: SCRIPT.p3.memoContinue,
        onClick: () => {
          ctx.addContext(SCRIPT.contextBuffer.entries.theseus);
          ctx.clippy.hideBalloon();
          hideOverlay(ctx.overlay);
          ctx.store.endCinematic();
          ctx.lockPointer();
        },
      },
    ],
  });
}

export async function finaleBeat(ctx: GameContext): Promise<void> {
  ctx.store.beginCinematic();
  ctx.setDialogId(null);
  await runFinale(ctx.overlay, ctx.clippy, ctx.audio);
  ctx.store.finishEscape();
  showWinScreen(ctx);
}
