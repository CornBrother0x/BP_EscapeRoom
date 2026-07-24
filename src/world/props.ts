/** 3D props for the maze — pure Three.js builders, no game state. */
import * as THREE from 'three';
import { makeTextTexture } from './textures';

/** A beige IBM-style desktop: monitor + horizontal case + green DOS screen. */
export function makeRetroPC(caseMat: THREE.Material, darkMat: THREE.Material, label: string): THREE.Group {
  const pc = new THREE.Group();
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.56, 0.58), caseMat);
  monitor.position.set(0, 1.16, 0);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42), darkMat);
  bezel.position.set(0, 1.18, 0.3);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.34),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(label, {
        bg: '#001a06',
        fg: '#3be24a',
        width: 256,
        height: 200,
        font: 'bold 30px monospace',
      }),
    }),
  );
  screen.position.set(0, 1.18, 0.305);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.26, 0.6), caseMat);
  base.position.set(0, 0.61, 0.02);
  const floppy = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.02), darkMat);
  floppy.position.set(0.09, 0.66, 0.33);
  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.016, 10),
    new THREE.MeshBasicMaterial({ color: 0x8fff5a }),
  );
  led.position.set(-0.24, 0.6, 0.33);
  pc.add(monitor, bezel, screen, base, floppy, led);
  return pc;
}

/** An oversized Windows-era 3.5" floppy disk on a small stand (defrag prop). */
export function makeFloppyDisk(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x24387f, roughness: 0.55 });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc2c6cf,
    roughness: 0.4,
    metalness: 0.5,
  });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.74, 0.08), bodyMat);
  body.position.y = 1.0;
  const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.17, 0.11), metalMat);
  shutter.position.set(0.02, 1.29, 0);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.34),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#efe9d2',
        fg: '#20205a',
        width: 256,
        height: 150,
        font: 'bold 26px monospace',
      }),
    }),
  );
  label.position.set(0, 0.9, 0.045);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.32), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.07), standMat);
  post.position.y = 0.36;
  g.add(body, shutter, label, stand, post);
  return g;
}

/** A little transistor radio on a stand — plays the spoken password (P1). */
export function makeRadio(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x8a2f22, roughness: 0.75 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c1c18, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc2c6cf,
    roughness: 0.4,
    metalness: 0.5,
  });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const bodyM = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.44, 0.24), caseMat);
  bodyM.position.y = 1.02;
  // Speaker grille (a dark textured face)
  const grille = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.32),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('▦▦▦', { bg: '#141410', fg: '#33ff33', width: 128, height: 128, font: 'bold 60px monospace' }),
    }),
  );
  grille.position.set(-0.18, 1.02, 0.121);
  // Tuning dial / label with the station text
  const dial = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.18),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, { bg: '#efe6c8', fg: '#20205a', width: 200, height: 120, font: 'bold 30px monospace' }),
    }),
  );
  dial.position.set(0.16, 1.09, 0.121);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), darkMat);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.16, 0.92, 0.13);
  // Telescopic antenna
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 8), metalMat);
  antenna.position.set(0.3, 1.5, -0.08);
  antenna.rotation.z = -0.35;
  // Blinking "new message" LED
  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.02, 12),
    new THREE.MeshBasicMaterial({ color: 0xff4a3a }),
  );
  led.position.set(-0.32, 1.2, 0.121);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.3), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.07), standMat);
  post.position.set(0, 0.4, -0.05);
  g.add(stand, post, bodyM, grille, dial, knob, antenna, led);
  return g;
}

/** A clipboard on a small stand (the modem reference sheet). */
export function makeClipboard(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x6e4a29, roughness: 0.85 });
  const clipMat = new THREE.MeshStandardMaterial({
    color: 0xb8bcc4,
    roughness: 0.4,
    metalness: 0.5,
  });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const lean = -0.18;
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.66, 0.03), boardMat);
  board.position.set(0, 1.05, 0);
  board.rotation.x = lean;
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.56),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#f4f1e6',
        fg: '#222222',
        width: 220,
        height: 288,
        font: 'bold 28px monospace',
      }),
    }),
  );
  paper.position.set(0, 1.05, 0.02);
  paper.rotation.x = lean;
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.05), clipMat);
  clip.position.set(0, 1.37, 0.02);
  clip.rotation.x = lean;
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.34), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), standMat);
  post.position.set(0, 0.4, -0.05);
  g.add(stand, post, board, paper, clip);
  return g;
}

/** A shiny CD-ROM on a stand — the disk-like decoy (a dead end). */
export function makeCD(labelText: string): THREE.Group {
  const g = new THREE.Group();
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xccd0d8,
    roughness: 0.18,
    metalness: 0.75,
  });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 40), discMat);
  disc.rotation.x = Math.PI / 2; // flat faces point ±z
  disc.position.y = 1.0;
  const label = new THREE.Mesh(
    new THREE.CircleGeometry(0.33, 40),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(labelText, {
        bg: '#d6b6e6',
        fg: '#3a1a5a',
        width: 256,
        height: 256,
        font: 'bold 24px monospace',
      }),
    }),
  );
  label.position.set(0, 1.0, 0.017);
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20),
    new THREE.MeshBasicMaterial({ color: 0x1a1a16 }),
  );
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 1.0, 0.02);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.28), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), standMat);
  post.position.set(0, 0.35, -0.05);
  g.add(stand, post, disc, label, hole);
  return g;
}

/** A media "play" button on a stand — the Rickroll dead end. */
export function makePlayButton(): THREE.Group {
  const g = new THREE.Group();
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.5 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.85 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.12), panelMat);
  panel.position.y = 1.05;
  const icon = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('▶', {
        bg: '#0a0a0a',
        fg: '#3be24a',
        width: 128,
        height: 128,
        font: 'bold 90px sans-serif',
      }),
    }),
  );
  icon.position.set(0, 1.05, 0.065);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.28), standMat);
  stand.position.y = 0.05;
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.06), standMat);
  post.position.set(0, 0.36, -0.05);
  g.add(stand, post, panel, icon);
  return g;
}

/** A phone booth housing the dial-out terminal (P4). Open front faces +z. */
export function makePhoneBooth(): THREE.Group {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a1c1c, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x201a1a, roughness: 0.8 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.2, 0.98), frameMat);
  roof.position.y = 2.15;
  const postGeo = new THREE.BoxGeometry(0.1, 2.05, 0.1);
  for (const [px, pz] of [
    [-0.44, -0.44],
    [0.44, -0.44],
    [-0.44, 0.44],
    [0.44, 0.44],
  ] as const) {
    const post = new THREE.Mesh(postGeo, frameMat);
    post.position.set(px, 1.05, pz);
    g.add(post);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.7, 0.06), frameMat);
  back.position.set(0, 1.15, -0.44);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.4),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('COM1', {
        bg: '#001a06',
        fg: '#3be24a',
        width: 256,
        height: 200,
        font: 'bold 34px monospace',
      }),
    }),
  );
  screen.position.set(0, 1.4, -0.4);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.2), darkMat);
  shelf.position.set(0, 1.02, -0.34);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.22, 0.06),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture('PHONE', {
        bg: '#111111',
        fg: '#ffd24a',
        width: 256,
        height: 80,
        font: 'bold 40px monospace',
      }),
    }),
  );
  sign.position.set(0, 1.98, 0.46);
  g.add(roof, back, screen, shelf, sign);
  return g;
}
