/**
 * First-person controller with the flip mechanic (promoted from the Sprint 2
 * spike after the keep decision). Owns the camera rig; movement respects
 * height-band collision so the flip trick works everywhere.
 */
import * as THREE from 'three';
import { resolveMove, type Band, type WallBox } from './collision';
import type { Input } from './input';

const EYE = 1.7;
const SPEED = 5.0;
const RADIUS = 0.35;
const FLIP_SECONDS = 0.9;
const LOOK_SPEED = 0.0022;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export class Player {
  readonly rig = new THREE.Object3D();
  private readonly pitchObj = new THREE.Object3D();
  private yaw = 0;
  private pitch = 0;
  private flipT = 0;
  private flipTarget: 0 | 1 = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly roomHeight: number,
  ) {
    this.rig.add(this.pitchObj);
    this.pitchObj.add(camera);
  }

  place(x: number, z: number, yaw = 0): void {
    this.rig.position.set(x, EYE, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.flipT = 0;
    this.flipTarget = 0;
  }

  get flipped(): boolean {
    return this.flipT > 0.5;
  }

  get animatingFlip(): boolean {
    return this.flipT !== this.flipTarget;
  }

  get position(): THREE.Vector3 {
    return this.rig.position;
  }

  /** The vertical slab of space the body occupies — drives band collision. */
  get band(): Band {
    return this.flipped
      ? { yMin: this.roomHeight - 1.9, yMax: this.roomHeight - 0.1 }
      : { yMin: 0.1, yMax: 1.9 };
  }

  toggleFlip(): void {
    this.flipTarget = this.flipTarget === 1 ? 0 : 1;
  }

  update(dt: number, input: Input, walls: readonly WallBox[], canMove: boolean): void {
    if (this.animatingFlip) {
      const dir = this.flipTarget === 1 ? 1 : -1;
      this.flipT = Math.max(0, Math.min(1, this.flipT + (dir * dt) / FLIP_SECONDS));
    }
    const ease = smoothstep(this.flipT);
    this.camera.rotation.z = Math.PI * ease;
    this.rig.position.y = EYE + (this.roomHeight - 2 * EYE) * ease;

    const inv = this.flipped ? -1 : 1;
    if (canMove) {
      const m = input.consumeMouse();
      this.yaw -= m.dx * LOOK_SPEED * inv;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - m.dy * LOOK_SPEED * inv));

      if (!this.animatingFlip) {
        const f = (input.isDown('KeyW') ? 1 : 0) - (input.isDown('KeyS') ? 1 : 0);
        const s = ((input.isDown('KeyD') ? 1 : 0) - (input.isDown('KeyA') ? 1 : 0)) * inv;
        if (f !== 0 || s !== 0) {
          const dx = -Math.sin(this.yaw) * f + Math.cos(this.yaw) * s;
          const dz = -Math.cos(this.yaw) * f - Math.sin(this.yaw) * s;
          const len = Math.hypot(dx, dz);
          const next = resolveMove(
            this.rig.position.x,
            this.rig.position.z,
            (dx / len) * SPEED * dt,
            (dz / len) * SPEED * dt,
            RADIUS,
            this.band,
            walls,
          );
          this.rig.position.x = next.x;
          this.rig.position.z = next.z;
        }
      }
    } else {
      input.consumeMouse();
    }

    this.rig.rotation.y = this.yaw;
    this.pitchObj.rotation.x = this.pitch;
  }
}
