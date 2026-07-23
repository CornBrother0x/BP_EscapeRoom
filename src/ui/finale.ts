/**
 * The ending cinematic (no fail state, per spec): dial-up handshake with the
 * upload gag, Clippy's "Take me with you," a BSOD cascade as THESEUS fires
 * too late, and the orange shutdown screen. The win window follows (game.ts).
 */
import { SCRIPT } from '../data/script';
import type { GameAudio } from '../engine/audio';
import type { ClippyWidget } from './clippy';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runFinale(
  overlay: HTMLElement,
  clippy: ClippyWidget,
  audio: GameAudio,
): Promise<void> {
  overlay.classList.remove('hidden');
  overlay.style.background = '#000';
  const term = document.createElement('div');
  term.style.cssText =
    'position:absolute;inset:0;padding:48px;font:15px monospace;color:#33ff33;white-space:pre-wrap';
  overlay.replaceChildren(term);
  const line = (text: string) => {
    term.textContent += `${text}\n`;
  };

  line('> ATDT5550195');
  await sleep(450);
  line(SCRIPT.ending.dialing);
  // The real 56k screech (75s) — it keeps playing under the BSODs, the
  // shutdown screen, and the win screen. That's the point.
  void audio.playDialup();
  await sleep(2600);
  line(SCRIPT.p4.connect);
  await sleep(1000);
  line(SCRIPT.ending.uploadEta);
  await sleep(1600);
  line(SCRIPT.ending.tooLong);
  await sleep(1100);
  line(SCRIPT.ending.postingInstead);
  await sleep(1800);

  // Clippy's moment. The cursor is free (we came from the terminal dialog).
  await clippy.sayWithButton(SCRIPT.clippy.takeMeWithYou, SCRIPT.clippy.ofCourseButton);

  // THESEUS fires — too late. BSOD cascade.
  for (let i = 0; i < 3; i++) {
    overlay.style.background = '#0000AA';
    term.style.color = '#ffffff';
    term.textContent = `\n\n        MAZE\n\n  ${SCRIPT.ending.bsodLines.join('\n  ')}\n\n  Press any key to continue _`;
    audio.play('error');
    await sleep(i < 2 ? 500 : 1000);
    if (i < 2) {
      overlay.style.background = '#000';
      term.textContent = '';
      await sleep(140);
    }
  }

  // The orange goodbye.
  overlay.style.background = '#000';
  term.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font:bold 26px monospace;color:#e57732;padding:40px';
  term.textContent = SCRIPT.ending.shutdown;
  await sleep(2800);
  overlay.style.background = '';
}
