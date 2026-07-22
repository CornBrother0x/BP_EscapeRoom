import '98.css';
import { startSpike } from './spike/flipSpike';

const app = document.querySelector<HTMLDivElement>('#app');
const overlay = document.querySelector<HTMLDivElement>('#overlay');
if (!app || !overlay) throw new Error('Missing #app / #overlay mount points');

startSpike(app, overlay);
