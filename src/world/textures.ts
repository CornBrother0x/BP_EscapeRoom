/** Canvas-generated textures: painted text, glitch static. */
import * as THREE from 'three';

export function makeTextTexture(
  text: string,
  opts: { bg: string; fg: string; width?: number; height?: number; font?: string },
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = opts.width ?? 512;
  canvas.height = opts.height ?? 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = opts.fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Auto-fit: shrink the font until the whole string fits the canvas width,
    // so long labels (passwords, sign text) never get cropped.
    const baseFont = opts.font ?? 'bold 72px monospace';
    let size = Number(baseFont.match(/(\d+)px/)?.[1] ?? 72);
    const maxWidth = canvas.width * 0.9;
    const setSize = (px: number) => (ctx.font = baseFont.replace(/\d+px/, `${px}px`));
    setSize(size);
    while (ctx.measureText(text).width > maxWidth && size > 8) {
      size -= 2;
      setSize(size);
    }
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

export function textPlane(
  text: string,
  w: number,
  h: number,
  bg: string,
  fg: string,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: makeTextTexture(text, { bg, fg }) }),
  );
}

/** TV-static texture for the glitch wall. */
export function makeNoiseTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 256);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}
