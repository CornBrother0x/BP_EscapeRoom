import '98.css';
import { startGame } from './game/game';

const app = document.querySelector<HTMLDivElement>('#app');
const overlay = document.querySelector<HTMLDivElement>('#overlay');
if (!app || !overlay) throw new Error('Missing #app / #overlay mount points');

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

if (webglAvailable()) {
  startGame(app, overlay);
} else {
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="window" style="width: 380px">
      <div class="title-bar"><div class="title-bar-text">M.A.Z.E. — ERROR</div></div>
      <div class="window-body">
        <p>This machine cannot run M.A.Z.E.</p>
        <p style="font-size:11px">WebGL is unavailable in this browser. Try a recent
        desktop version of Chrome, Firefox, or Safari with hardware acceleration enabled.</p>
      </div>
    </div>`;
}
