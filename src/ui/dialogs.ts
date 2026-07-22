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
