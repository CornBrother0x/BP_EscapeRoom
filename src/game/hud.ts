/** The heads-up overlay: crosshair, interaction label, toast, Clippy + Tab hints. */

export interface Hud {
  setLabel(text: string): void;
  setClippyHint(text: string): void;
  showTab(show: boolean): void;
  toast(text: string): void;
}

export function createHud(app: HTMLElement): Hud {
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

  const label = hud.querySelector<HTMLElement>('#hud-label');
  const toastEl = hud.querySelector<HTMLElement>('#hud-toast');
  const clippy = hud.querySelector<HTMLElement>('#hud-clippy');
  const tab = hud.querySelector<HTMLElement>('#hud-tab');
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    setLabel: (text) => {
      if (label) label.textContent = text;
    },
    setClippyHint: (text) => {
      if (clippy) clippy.textContent = text;
    },
    showTab: (show) => {
      if (tab) tab.style.display = show ? 'flex' : 'none';
    },
    toast: (text) => {
      if (!toastEl) return;
      toastEl.textContent = text;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => (toastEl.textContent = ''), 2500);
    },
  };
}
