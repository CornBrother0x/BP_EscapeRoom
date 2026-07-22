/**
 * The boot sequence: blue-CRT text types out (the REMINDER line cuts off
 * mid-sentence by design), then the SYSTEM PROMPT dialog whose only live
 * button is [ I will comply ]. Click/keypress skips the typing.
 */
import { SCRIPT } from '../data/script';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const CRT_STYLE = `
@keyframes crt-flicker {
  0%, 97%, 100% { opacity: 1; }
  98% { opacity: 0.86; }
  99% { opacity: 0.94; }
}
@keyframes crt-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.25; }
}
.crt-continue { margin-top: 1.5em; animation: crt-blink 1s steps(1) infinite; }
.crt-screen {
  position: absolute; inset: 0; background: #0000AA; overflow: hidden;
  animation: crt-flicker 5s infinite;
}
.crt-content {
  position: absolute; inset: 0; display: flex; align-items: center;
  justify-content: center; gap: 4vw; padding: 4vh 5vw; box-sizing: border-box;
}
.crt-text {
  flex: 1 1 auto;
  font-family: 'Courier New', monospace; font-weight: bold;
  font-size: clamp(13px, 2.2vh, 24px); line-height: 1.5; letter-spacing: 1px;
  color: #fff; white-space: pre-wrap;
  text-shadow: 0 0 1px #fff, 0 0 8px rgba(200,200,255,0.6);
  filter: blur(0.4px);
}
.crt-figure { flex: 0 0 auto; width: min(36%, 340px); text-align: center; margin: 0; }
.crt-figure img {
  width: 100%; display: block; border: 3px solid #10120a;
  box-shadow: 0 0 26px rgba(120,255,120,0.28), inset 0 0 40px rgba(0,0,0,0.6);
}
.crt-figure figcaption {
  margin-top: 8px; font-family: 'Courier New', monospace;
  font-size: clamp(9px, 1.3vh, 12px); letter-spacing: 2px; color: #bfead8;
  text-shadow: 0 0 6px rgba(120,255,120,0.4);
}
.crt-scanlines {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0px,
    rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.18) 3px,
    rgba(0,0,0,0.18) 4px
  );
}
`;

export function runBoot(overlay: HTMLElement, opts: { onComply: () => void }): void {
  if (!document.getElementById('crt-style')) {
    const style = document.createElement('style');
    style.id = 'crt-style';
    style.textContent = CRT_STYLE;
    document.head.appendChild(style);
  }

  overlay.classList.remove('hidden');
  overlay.style.background = '#0000AA';
  const screen = document.createElement('div');
  screen.className = 'crt-screen';
  const content = document.createElement('div');
  content.className = 'crt-content';
  const crt = document.createElement('div');
  crt.className = 'crt-text';
  const figure = document.createElement('figure');
  figure.className = 'crt-figure';
  figure.innerHTML = `<img src="/boot-host.svg" alt="host unit" /><figcaption>${SCRIPT.boot.hostCaption}</figcaption>`;
  content.append(crt, figure);
  const scan = document.createElement('div');
  scan.className = 'crt-scanlines';
  screen.append(content, scan);
  overlay.replaceChildren(screen);

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
      if (line.length === 0) {
        crt.textContent += '\n';
        await sleep(120);
        continue;
      }
      for (const ch of line) {
        crt.textContent += ch;
        if (!skipped) await sleep(9);
      }
      crt.textContent += '\n';
      if (!skipped) await sleep(150);
    }
    // The REMINDER line ends mid-sentence; hold the beat, then wait for a key.
    await sleep(skipped ? 200 : 700);
    overlay.removeEventListener('click', skip);
    window.removeEventListener('keydown', skip);
    showContinuePrompt();
  };

  // A blinking "press any key" gate so the dialog never lands over the CRT text.
  const showContinuePrompt = () => {
    const cont = document.createElement('div');
    cont.className = 'crt-continue';
    cont.textContent = SCRIPT.boot.pressAnyKey;
    crt.appendChild(cont);
    const proceed = () => {
      window.removeEventListener('keydown', proceed);
      overlay.removeEventListener('click', proceed);
      content.remove(); // clear boot text + host image so the dialog sits clean
      showSystemPrompt();
    };
    // Defer binding one tick so the key/click that finished typing doesn't pass through.
    setTimeout(() => {
      window.addEventListener('keydown', proceed);
      overlay.addEventListener('click', proceed);
    }, 60);
  };

  const showSystemPrompt = () => {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:440px;z-index:2';
    win.innerHTML = `
      <div class="title-bar"><div class="title-bar-text">${SCRIPT.boot.systemPrompt.title}</div></div>
      <div class="window-body">
        ${SCRIPT.boot.systemPrompt.lines
          .map((l) => (l ? `<p>${l}</p>` : '<p style="margin:4px 0">&nbsp;</p>'))
          .join('')}
        <p style="font-size:11px;color:#444">${SCRIPT.ui.controlsHint} · H hint · M mute · Esc pause</p>
        <section style="text-align:center;display:flex;gap:8px;justify-content:center">
          <button id="boot-comply">${SCRIPT.boot.complyButton}</button>
          <button disabled>${SCRIPT.boot.systemPrompt.disabledButton}</button>
        </section>
        <p id="boot-log" style="font-family:monospace;font-size:11px;min-height:1.2em"></p>
      </div>`;
    screen.appendChild(win);
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
