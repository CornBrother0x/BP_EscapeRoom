/**
 * Clippy — the in-world hint system, revealed mid-game by the Defrag puzzle.
 * Authentic sprite (public/clippy.png), DOM-based so he lives above the 3D
 * canvas and inside every 2D screen, including the finale.
 */

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const STYLE = `
@keyframes clippy-bounce {
  0% { transform: translateY(420px) scale(0.6); opacity: 0; }
  60% { transform: translateY(-16px) scale(1.05); opacity: 1; }
  80% { transform: translateY(8px) scale(0.98); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes clippy-idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
.clippy-root { position: fixed; right: 28px; bottom: 24px; z-index: 60; display: none; }
.clippy-root.visible { display: block; }
.clippy-img { height: 340px; image-rendering: pixelated; animation: clippy-idle 3.2s ease-in-out infinite;
  filter: drop-shadow(3px 4px 3px rgba(0,0,0,0.45)); }
.clippy-img.entering { animation: clippy-bounce 0.9s ease-out; }
.clippy-balloon {
  position: absolute; right: 12px; bottom: 356px; width: 320px; display: none;
  background: #ffffcc; color: #000; border: 1px solid #000; border-radius: 10px;
  padding: 12px 14px; font: 14px monospace; line-height: 1.4;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.35);
}
.clippy-balloon.visible { display: block; }
.clippy-balloon button { margin-top: 10px; font: 12px monospace; }
`;

export class ClippyWidget {
  private readonly root: HTMLDivElement;
  private readonly img: HTMLImageElement;
  private readonly balloon: HTMLDivElement;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private shown = false;

  constructor() {
    if (!document.getElementById('clippy-style')) {
      const style = document.createElement('style');
      style.id = 'clippy-style';
      style.textContent = STYLE;
      document.head.appendChild(style);
    }
    this.root = document.createElement('div');
    this.root.className = 'clippy-root';
    this.img = document.createElement('img');
    this.img.className = 'clippy-img';
    this.img.src = '/clippy.png';
    this.img.alt = 'Clippy';
    this.balloon = document.createElement('div');
    this.balloon.className = 'clippy-balloon';
    this.root.append(this.balloon, this.img);
    document.body.appendChild(this.root);
  }

  get visible(): boolean {
    return this.shown;
  }

  /** The reveal: boing in from below. */
  async reveal(): Promise<void> {
    if (this.shown) return;
    this.shown = true;
    this.root.classList.add('visible');
    this.img.classList.add('entering');
    await sleep(950);
    this.img.classList.remove('entering');
  }

  /** Speak; auto-hides after holdMs (0 = stay until replaced/hidden). */
  say(text: string, holdMs = 6500): void {
    clearTimeout(this.hideTimer);
    this.balloon.textContent = text;
    this.balloon.classList.add('visible');
    if (holdMs > 0) {
      this.hideTimer = setTimeout(() => this.hideBalloon(), holdMs);
    }
  }

  /** Speak with a single button; resolves when clicked. Needs a free cursor. */
  sayWithButton(text: string, buttonLabel: string): Promise<void> {
    clearTimeout(this.hideTimer);
    return new Promise((resolve) => {
      this.balloon.innerHTML = '';
      const p = document.createElement('div');
      p.textContent = text;
      const btn = document.createElement('button');
      btn.textContent = buttonLabel;
      btn.addEventListener('click', () => {
        this.hideBalloon();
        resolve();
      });
      this.balloon.append(p, btn);
      this.balloon.classList.add('visible');
    });
  }

  hideBalloon(): void {
    this.balloon.classList.remove('visible');
    this.balloon.innerHTML = '';
  }
}
