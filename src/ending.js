import { COLORS, H, W } from "./config.js";
import { seededNoise } from "./utils.js";

export class Ending {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase = "approach";
    this.t = 0;
    this.tvY = 510;
  }

  startFall(player) {
    this.phase = "fall";
    this.t = 0;
    player.vx = 0;
    player.vy = 0;
    player.x = W / 2 - player.w / 2;
    player.y = -60;
  }

  update(dt, player) {
    this.t += dt;
    if (this.phase === "fall") {
      player.y += 260 * dt + this.t * 160 * dt;
      if (player.y > 442) {
        this.phase = "stopped";
        this.t = 0;
        return "stopped";
      }
    }
    return null;
  }

  drawFall(ctx, player) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
    this.drawDust(ctx, this.t * 20);
    if (this.phase === "fall") {
      ctx.fillStyle = "#070708";
      ctx.fillRect(player.x + 3, player.y, 8, 8);
      ctx.fillRect(player.x + 2, player.y + 8, 10, 13);
    }
  }

  drawStopped(ctx) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);
    this.drawDust(ctx, this.t * 40);
    this.drawCrt(ctx, 76, this.tvY, 208, 86, true);
  }

  drawCrt(ctx, x, y, w, h, glitch) {
    ctx.fillStyle = "#1B1B1F";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#111114";
    ctx.fillRect(x + 14, y + 13, w - 48, h - 30);
    ctx.strokeStyle = COLORS.silver;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(x + 13, y + 12, w - 46, h - 28);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#2A292B";
    ctx.fillRect(x + w - 27, y + 24, 12, 12);
    ctx.fillRect(x + w - 26, y + 43, 10, 5);
    ctx.fillRect(x + 24, y + h, w - 48, 10);
    if (!glitch) return;
    const sx = x + 17;
    const sy = y + 16;
    const sw = w - 54;
    const sh = h - 36;
    ctx.fillStyle = "#D8D2C0";
    for (let i = 0; i < 140; i++) {
      ctx.globalAlpha = 0.12 + seededNoise(i + this.t * 30) * 0.65;
      ctx.fillRect(sx + seededNoise(i * 4) * sw, sy + seededNoise(i * 6) * sh, 1 + (i % 4), 1);
    }
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = COLORS.glitchCyan;
    ctx.fillRect(sx + 8, sy + 14, sw - 16, 2);
    ctx.fillRect(sx + 36, sy + 31, 58, 3);
    ctx.fillStyle = COLORS.glitchMagenta;
    ctx.fillRect(sx + 18, sy + 22, 48, 2);
    ctx.fillRect(sx + 92, sy + 38, 34, 3);
    ctx.globalAlpha = 1;
  }

  drawDust(ctx, offset) {
    ctx.fillStyle = "rgba(216,210,192,0.12)";
    for (let i = 0; i < 90; i++) {
      const x = seededNoise(i * 5) * W;
      const y = (seededNoise(i * 9) * H + offset) % H;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}
