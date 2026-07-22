import '98.css';
import { startGame } from './game/game';
import { startSpike } from './spike/flipSpike';

const app = document.querySelector<HTMLDivElement>('#app');
const overlay = document.querySelector<HTMLDivElement>('#overlay');
if (!app || !overlay) throw new Error('Missing #app / #overlay mount points');

// The Sprint 2 flip spike stays reachable at ?spike for reference.
if (new URLSearchParams(location.search).has('spike')) {
  startSpike(app, overlay);
} else {
  startGame(app, overlay);
}
