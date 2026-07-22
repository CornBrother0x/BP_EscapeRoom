/** 98.css window rendering into the fullscreen overlay. */

export interface DialogButton {
  label: string;
  onClick: () => void;
}

export interface DialogOptions {
  title: string;
  bodyHtml: string;
  buttons: DialogButton[];
  width?: number;
}

/**
 * Render a bare window and return its body element — for dialogs that need
 * custom inputs/behavior (admin console, terminal, context buffer).
 */
export function renderWindow(
  overlay: HTMLElement,
  opts: { title: string; bodyHtml: string; width?: number },
): HTMLElement {
  overlay.innerHTML = `
    <div class="window" style="width: ${opts.width ?? 420}px">
      <div class="title-bar">
        <div class="title-bar-text">${opts.title}</div>
      </div>
      <div class="window-body">${opts.bodyHtml}</div>
    </div>`;
  overlay.classList.remove('hidden');
  const body = overlay.querySelector<HTMLElement>('.window-body');
  if (!body) throw new Error('renderWindow: missing body');
  return body;
}

export function showWindow(overlay: HTMLElement, opts: DialogOptions): void {
  overlay.innerHTML = `
    <div class="window" style="width: ${opts.width ?? 420}px">
      <div class="title-bar">
        <div class="title-bar-text">${opts.title}</div>
      </div>
      <div class="window-body">
        ${opts.bodyHtml}
        <section style="text-align:center; margin-top: 10px; display:flex; gap:8px; justify-content:center">
          ${opts.buttons.map((b, i) => `<button data-dialog-btn="${i}">${b.label}</button>`).join('')}
        </section>
      </div>
    </div>`;
  overlay.classList.remove('hidden');
  opts.buttons.forEach((b, i) => {
    overlay.querySelector(`[data-dialog-btn="${i}"]`)?.addEventListener('click', b.onClick);
  });
}

export function hideOverlay(overlay: HTMLElement): void {
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}
