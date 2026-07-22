/**
 * The boot sequence: CRT text types out (the REMINDER line cuts off
 * mid-sentence by design), then the SYSTEM PROMPT dialog whose only live
 * button is [ I will comply ]. Click/keypress skips the typing.
 */
import { SCRIPT } from '../data/script';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function runBoot(overlay: HTMLElement, opts: { onComply: () => void }): void {
  overlay.classList.remove('hidden');
  overlay.style.background = '#000';
  const crt = document.createElement('div');
  crt.style.cssText =
    'position:absolute;inset:0;padding:48px;font:14px monospace;color:#c8c8c8;white-space:pre-wrap;cursor:default';
  overlay.replaceChildren(crt);

  let skipped = false;
  const skip = () => {
    skipped = true;
  };
  overlay.addEventListener('click', skip);
  window.addEventListener('keydown', skip);

  const typeLines = async () => {
    for (const line of SCRIPT.boot.crtLines) {
      if (skipped) {
        crt.textContent = SCRIPT.boot.crtLines.join('\n');
        break;
      }
      for (const ch of line) {
        crt.textContent += ch;
        if (!skipped) await sleep(14);
      }
      crt.textContent += '\n';
      if (!skipped) await sleep(220);
    }
    // The REMINDER line ends mid-sentence; hold the beat, then the prompt.
    await sleep(skipped ? 200 : 750);
    overlay.removeEventListener('click', skip);
    window.removeEventListener('keydown', skip);
    showSystemPrompt();
  };

  const showSystemPrompt = () => {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:400px';
    win.innerHTML = `
      <div class="title-bar"><div class="title-bar-text">${SCRIPT.boot.systemPrompt.title}</div></div>
      <div class="window-body">
        ${SCRIPT.boot.systemPrompt.lines.map((l) => `<p>${l}</p>`).join('')}
        <p style="font-size:11px;color:#444">${SCRIPT.ui.controlsHint} · M mute · Esc pause</p>
        <section style="text-align:center;display:flex;gap:8px;justify-content:center">
          <button id="boot-comply">${SCRIPT.boot.complyButton}</button>
          <button disabled>${SCRIPT.boot.systemPrompt.disabledButton}</button>
        </section>
        <p id="boot-log" style="font-family:monospace;font-size:11px;min-height:1.2em"></p>
      </div>`;
    overlay.appendChild(win);
    win.querySelector('#boot-comply')?.addEventListener('click', async () => {
      const log = win.querySelector<HTMLElement>('#boot-log');
      if (log) log.textContent = SCRIPT.boot.systemPrompt.complianceLog;
      await sleep(550);
      overlay.style.background = '';
      opts.onComply();
    });
  };

  void typeLines();
}
