import { COLORS, CONFIG, OBJECT_TYPES, W } from "./config.js";
import { clamp, seededNoise } from "./utils.js";

export class Platform {
  constructor(x, y, w, h, type = "stone", seed = 0) {
    this.x = x;
    this.y = y;
    this.baseW = w;
    this.w = w;
    this.h = h;
    this.type = type;
    this.seed = seed;
    this.awake = 0;
    this.wasAwake = false;
    this.solid = true;
    this.roll = seededNoise(seed) > 0.5 ? 1 : -1;
  }

  update(dt, fire, lonely, audio) {
    const canWake = !lonely && fire && fire.alive && this.type !== "stone";
    let target = 0;
    if (canWake) {
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2;
      const d = Math.hypot(cx - fire.x, cy - fire.y);
      target = d < CONFIG.fireWakeRadius ? 1 : 0;
    }
    this.awake += (target - this.awake) * Math.min(1, dt * 5);
    if (target && !this.wasAwake) audio.blip(this.type);
    this.wasAwake = !!target;

    if (this.type === "newspaper") this.w = this.baseW + this.awake * 48;
    if (this.type === "frame" && this.awake > 0.2) this.y += Math.sin(performance.now() / 400 + this.seed) * dt * 4;
  }

  collisionBox(lonely) {
    const awake = lonely ? 0 : this.awake;
    const w = this.type === "newspaper" ? this.baseW + awake * 48 : this.w;
    if (this.type === "frame" && awake > 0.35) return { x: this.x, y: this.y + 3, w, h: this.h };
    return { x: this.x, y: this.y, w, h: this.h };
  }

  onStand(player, lonely) {
    if (lonely) return;
    if (this.awake > 0.35 && this.type === "tv") player.vy = Math.min(player.vy, -120);
    if (this.awake > 0.35 && this.type === "film") {
      player.x += this.roll * 1.8;
      player.vy = Math.min(player.vy, -45);
    }
  }

  draw(ctx, camera, lonely) {
    const y = Math.round(camera.worldToScreenY(this.y));
    const awake = lonely ? 0 : this.awake;
    if (y > 680 || y < -80) return;
    ctx.save();
    if (this.type === "tv") this.drawTv(ctx, y, awake, lonely);
    else if (this.type === "newspaper") this.drawNewspaper(ctx, y, awake, lonely);
    else if (this.type === "film") this.drawFilm(ctx, y, awake, lonely);
    else if (this.type === "frame") this.drawFrame(ctx, y, awake, lonely);
    else this.drawStone(ctx, y, lonely);
    ctx.restore();
  }

  drawStone(ctx, y, lonely) {
    ctx.fillStyle = lonely ? COLORS.dull : COLORS.platform;
    ctx.fillRect(this.x, y, this.w, this.h);
    ctx.fillStyle = "rgba(169,169,168,0.18)";
    ctx.fillRect(this.x + 2, y + 2, this.w - 4, 2);
    this.noise(ctx, this.x, y, this.w, this.h, 8, 0.12);
  }

  drawTv(ctx, y, awake, lonely) {
    this.drawStone(ctx, y + 20, lonely);
    ctx.fillStyle = lonely ? COLORS.dull : "#202025";
    ctx.fillRect(this.x + 8, y - 10, this.w - 16, 30);
    ctx.strokeStyle = COLORS.silver;
    ctx.globalAlpha = lonely ? 0.25 : 0.45;
    ctx.strokeRect(this.x + 10, y - 8, this.w - 28, 22);
    ctx.globalAlpha = 1;
    const sx = this.x + 13;
    const sy = y - 5;
    const sw = this.w - 34;
    ctx.fillStyle = awake ? `rgba(216,210,192,${0.1 + awake * 0.45})` : "#101013";
    ctx.fillRect(sx, sy, sw, 16);
    if (awake) {
      for (let i = 0; i < 22; i++) {
        ctx.fillStyle = i % 5 === 0 ? COLORS.ember : COLORS.ivory;
        ctx.globalAlpha = 0.12 + seededNoise(this.seed + i + performance.now() * 0.01) * 0.4 * awake;
        ctx.fillRect(sx + seededNoise(this.seed + i) * sw, sy + seededNoise(i * 7) * 16, 1 + (i % 3), 1);
      }
      ctx.globalAlpha = 0.55 * awake;
      ctx.fillStyle = COLORS.glitchCyan;
      ctx.fillRect(sx + 2, sy + 6, sw - 4, 1);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = COLORS.dull;
    ctx.fillRect(this.x + this.w - 14, y - 5, 4, 4);
  }

  drawNewspaper(ctx, y, awake, lonely) {
    const w = this.baseW + awake * 48;
    const x = this.x - awake * 24;
    ctx.fillStyle = lonely ? COLORS.dull : COLORS.paper;
    ctx.globalAlpha = lonely ? 0.52 : 0.72 + awake * 0.2;
    ctx.fillRect(x, y, w, this.h + 9 * awake);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(5,5,6,0.35)";
    ctx.strokeRect(x + 2, y + 2, w - 4, this.h + 5 * awake);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(5,5,6,0.25)";
      ctx.fillRect(x + 7, y + 5 + i * 4, w * (0.3 + 0.08 * (i % 2)), 1);
      if (awake > 0.4) ctx.fillRect(x + w * 0.52, y + 5 + i * 4, w * 0.32, 1);
    }
  }

  drawFilm(ctx, y, awake, lonely) {
    this.drawStone(ctx, y + 24, lonely);
    const cx = this.x + this.w / 2;
    ctx.strokeStyle = lonely ? COLORS.dull : COLORS.silver;
    ctx.lineWidth = 3;
    ctx.globalAlpha = lonely ? 0.45 : 0.75;
    ctx.beginPath();
    ctx.arc(cx - 8, y + 7, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + awake * performance.now() * 0.006;
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(cx - 10 + Math.cos(a) * 8, y + 5 + Math.sin(a) * 8, 4, 4);
    }
    ctx.fillStyle = lonely ? COLORS.dull : "#2A292B";
    ctx.fillRect(this.x + 8, y + 21, this.w - 16, 8);
    for (let i = 0; i < this.w - 24; i += 10) {
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(this.x + 12 + ((i + awake * 20) % (this.w - 28)), y + 22, 3, 2);
    }
    if (awake > 0.2) {
      ctx.globalAlpha = awake * 0.5;
      ctx.fillStyle = COLORS.ember;
      ctx.fillRect(this.x + this.w - 16, y + 9, 12, 2);
      ctx.fillRect(this.x + this.w - 12, y + 14, 8, 2);
      ctx.globalAlpha = 1;
    }
  }

  drawFrame(ctx, y, awake, lonely) {
    this.drawStone(ctx, y + 26, lonely);
    ctx.strokeStyle = lonely ? COLORS.dull : COLORS.silver;
    ctx.lineWidth = 4;
    ctx.globalAlpha = lonely ? 0.55 : 0.72;
    ctx.strokeRect(this.x + 7, y - 7, this.w - 14, 32);
    ctx.globalAlpha = 1;
    ctx.fillStyle = awake ? `rgba(216,210,192,${0.12 + awake * 0.25})` : "#09090A";
    ctx.fillRect(this.x + 13, y - 1, this.w - 26, 20);
    if (awake) {
      ctx.globalAlpha = awake * 0.45;
      ctx.fillStyle = COLORS.ember;
      ctx.fillRect(this.x + 10, y - 4, this.w - 20, 1);
      ctx.fillStyle = COLORS.ivory;
      this.noise(ctx, this.x + 15, y + 2, this.w - 30, 14, 16, 0.5);
      ctx.globalAlpha = 1;
    }
  }

  noise(ctx, x, y, w, h, count, alpha) {
    ctx.fillStyle = `rgba(216,210,192,${alpha})`;
    for (let i = 0; i < count; i++) {
      const nx = x + seededNoise(this.seed + i) * w;
      const ny = y + seededNoise(this.seed + i * 4) * h;
      ctx.fillRect(nx, ny, 1, 1);
    }
  }
}

export class PlatformManager {
  constructor() {
    this.platforms = [];
    this.nextY = 520;
    this.seed = 10;
  }

  reset(lonely = false) {
    this.platforms = [new Platform(72, 574, 216, 24, "stone", 1)];
    this.nextY = 485;
    this.seed = lonely ? 6000 : 10;
    this.generateTo(-900, lonely);
  }

  update(dt, camera, fire, lonely, audio) {
    this.generateTo(camera.y - 760, lonely);
    this.platforms = this.platforms.filter((p) => p.y < camera.y + 780);
    for (const p of this.platforms) p.update(dt, fire, lonely, audio);
  }

  generateTo(minY, lonely) {
    while (this.nextY > minY) {
      const n = this.seed++;
      const route = clamp(Math.abs(this.nextY) / Math.abs(CONFIG.worldEndY), 0, 1);
      const gap = CONFIG.platformGapMin + seededNoise(n) * (CONFIG.platformGapMax + route * 30 - CONFIG.platformGapMin);
      this.nextY -= gap;
      const stageBias = route * OBJECT_TYPES.length;
      const pick = lonely ? "stone" : OBJECT_TYPES[Math.floor((seededNoise(n * 3) * 2.2 + stageBias) % OBJECT_TYPES.length)];
      const type = seededNoise(n * 9) < 0.22 ? "stone" : pick;
      const w = type === "newspaper" ? 58 : type === "frame" ? 76 : type === "tv" ? 82 : type === "film" ? 88 : 70 + seededNoise(n * 5) * 35;
      const x = 24 + seededNoise(n * 11) * (W - w - 48);
      this.platforms.push(new Platform(x, this.nextY, w, type === "stone" ? 13 : 11, type, n));
    }
  }
}
