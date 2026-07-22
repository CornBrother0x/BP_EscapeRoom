/** Center-screen raycast interaction: look at a thing, press E. */
import * as THREE from 'three';

export interface Interactable {
  id: string;
  label: string;
  object: THREE.Object3D;
}

const CENTER = new THREE.Vector2(0, 0);

export class Interactor {
  private readonly ray = new THREE.Raycaster();
  private items: Interactable[] = [];

  constructor(maxDistance = 3.2) {
    this.ray.far = maxDistance;
  }

  add(item: Interactable): void {
    this.items.push(item);
  }

  remove(id: string): void {
    this.items = this.items.filter((i) => i.id !== id);
  }

  hovered(camera: THREE.Camera): Interactable | null {
    this.ray.setFromCamera(CENTER, camera);
    let best: { item: Interactable; dist: number } | null = null;
    for (const item of this.items) {
      const hits = this.ray.intersectObject(item.object, true);
      const first = hits[0];
      if (first && (!best || first.distance < best.dist)) {
        best = { item, dist: first.distance };
      }
    }
    return best?.item ?? null;
  }
}
