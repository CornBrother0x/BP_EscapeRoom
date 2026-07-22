/**
 * Keyboard + pointer-lock mouse input. Accumulates mouse deltas between
 * frames; held keys are cleared on blur and pointer-lock loss so nothing
 * "sticks" across mode changes (see input modes in docs/puzzles.md).
 */
export class Input {
  private keys = new Set<string>();
  private mouseDx = 0;
  private mouseDy = 0;

  constructor() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement) this.clear();
    });
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.mouseDx += e.movementX;
        this.mouseDy += e.movementY;
      }
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  /** Read and reset accumulated mouse movement. */
  consumeMouse(): { dx: number; dy: number } {
    const out = { dx: this.mouseDx, dy: this.mouseDy };
    this.mouseDx = 0;
    this.mouseDy = 0;
    return out;
  }

  clear(): void {
    this.keys.clear();
    this.mouseDx = 0;
    this.mouseDy = 0;
  }
}
