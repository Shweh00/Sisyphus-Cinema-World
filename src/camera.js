import { H } from "./config.js";

export class Camera {
  constructor() {
    this.y = 0;
  }

  reset() {
    this.y = 0;
  }

  update(player, dt) {
    const target = player.y - H * 0.58;
    if (target < this.y) this.y += (target - this.y) * Math.min(1, dt * 3.8);
  }

  worldToScreenY(y) {
    return y - this.y;
  }
}
