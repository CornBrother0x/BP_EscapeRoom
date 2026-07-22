import '98.css';
import { mountDefrag } from './defrag';

const container = document.querySelector<HTMLElement>('#defrag-harness');
if (!container) throw new Error('Missing #defrag-harness mount point');

mountDefrag(container, {
  onSolved: () => console.info('Defrag onSolved callback fired'),
});
