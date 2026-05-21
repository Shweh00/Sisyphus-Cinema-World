import { COLORS, CONFIG } from "./config.js";

export class Fire {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 228;
    this.y = 428;
    this.vx = 0;
    this.vy = 0;
    this.t = 0;
    this.brightness = 1;
    this.alive = true;
    this.cooldown = 1.4;
    this.remote = false;
  }

  dim(falls) {
    this.brightness = Math.max(0, 1 - falls * CONFIG.fireFadePerFall);
    if (falls >= CONFIG.maxFallsBeforeLonely) this.alive = false;
  }

  update(dt, player, endingNear = false) {
    if (!this.alive) return;
    this.t += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    const orbit = endingNear ? 150 : 62 + Math.sin(this.t * 1.3) * 34;
    const targetX = player.x + 7 + Math.cos(this.t * 0.93) * orbit;
    const targetY = player.y - 34 + Math.sin(this.t * 1.7) * (endingNear ? 44 : 58);
    this.vx += (targetX - this.x) * dt * 1.7;
    this.vy += (targetY - this.y) * dt * 1.5;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.x += this.vx * dt * 55;
    this.y += this.vy * dt * 55;
  }

  touchPlayer(player) {
    if (!this.alive || this.cooldown > 0) return null;
    const d = Math.hypot(this.x - (player.x + player.w / 2), this.y - (player.y + player.h / 2));
    if (d > CONFIG.fireContactRadius) return null;
    this.cooldown = 2.2;
    return Math.random() < CONFIG.fireKillChance ? "kill" : "help";
  }

  draw(ctx, camera) {
    if (!this.alive) return;
    const x = Math.round(this.x);
    const y = Math.round(camera.worldToScreenY(this.y));
    const b = this.brightness;
    ctx.save();
    ctx.globalAlpha = 0.16 * b;
    const glow = ctx.createRadialGradient(x, y, 1, x, y, 42);
    glow.addColorStop(0, COLORS.ember);
    glow.addColorStop(1, "rgba(122,27,23,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 46, y - 46, 92, 92);
    ctx.globalAlpha = 0.82 * b;
    ctx.fillStyle = COLORS.fire;
    ctx.beginPath();
    ctx.moveTo(x, y - 14 - Math.sin(this.t * 8) * 2);
    ctx.lineTo(x + 8, y - 2);
    ctx.lineTo(x + 5, y + 10);
    ctx.lineTo(x - 7, y + 10);
    ctx.lineTo(x - 9, y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.75 * b;
    ctx.fillStyle = COLORS.ember;
    ctx.fillRect(x - 3, y - 5, 6, 12);
    ctx.fillRect(x + 2, y - 10, 4, 8);
    ctx.restore();
  }
}
