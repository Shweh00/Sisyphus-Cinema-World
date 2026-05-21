import { CONFIG, COLORS } from "./config.js";
import { clamp, rectsOverlap } from "./utils.js";

export class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 173;
    this.y = 548;
    this.w = CONFIG.playerW;
    this.h = CONFIG.playerH;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.grounded = false;
    this.canDouble = true;
    this.state = "idle";
    this.anim = 0;
    this.deadFade = 0;
    this.hangPlatform = null;
    this.climbT = 0;
  }

  bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt, input, platforms, audio, lonely) {
    this.anim += dt;
    const dir = input.direction();
    if (dir) this.facing = dir;

    if (this.state === "ledge") {
      this.vx = 0;
      this.vy = 0;
      if (!this.hangPlatform) {
        this.state = "fall";
      } else {
        const wantsClimb = input.up || input.consumeJump() || dir === this.facing;
        if (wantsClimb) {
          this.state = "climb";
          this.climbT = 0;
        }
      }
      return;
    }

    if (this.state === "climb") {
      this.climbT += dt;
      const p = this.hangPlatform;
      if (p) {
        this.y = p.y - this.h + 7 - this.climbT * CONFIG.climbSpeed;
        this.x += this.facing * dt * 12;
        if (this.climbT > 0.34) {
          this.y = p.y - this.h;
          this.state = "idle";
          this.grounded = true;
          this.canDouble = true;
          this.hangPlatform = null;
        }
      }
      input.consumeJump();
      return;
    }

    this.vx = dir * CONFIG.moveSpeed;
    if (input.consumeJump()) {
      if (this.grounded) {
        this.vy = -CONFIG.jumpSpeed;
        this.grounded = false;
        this.canDouble = true;
        this.state = "jump";
      } else if (this.canDouble) {
        this.vy = -CONFIG.doubleJumpSpeed;
        this.vx += this.facing * 38;
        this.canDouble = false;
        this.state = "struggle";
        audio.blip("help");
      }
    }

    this.vy += CONFIG.gravity * dt;
    const old = { x: this.x, y: this.y, w: this.w, h: this.h };
    this.x = clamp(this.x + this.vx * dt, 5, 341);
    this.y += this.vy * dt;
    this.grounded = false;

    const body = this.bounds();
    for (const p of platforms) {
      if (!p.solid) continue;
      const pb = p.collisionBox(lonely);
      if (this.vy >= 0 && old.y + old.h <= pb.y + 7 && rectsOverlap(body, pb)) {
        this.y = pb.y - this.h;
        this.vy = 0;
        this.grounded = true;
        this.canDouble = true;
        this.state = dir ? "run" : "idle";
        p.onStand(this, lonely);
        break;
      }
    }

    if (!this.grounded && this.vy > 80) this.tryGrabLedge(old, platforms, lonely);
    if (!this.grounded && !["ledge", "climb", "struggle"].includes(this.state)) this.state = "fall";
    if (this.grounded && !dir) this.state = "idle";
  }

  tryGrabLedge(old, platforms, lonely) {
    for (const p of platforms) {
      const pb = p.collisionBox(lonely);
      const closeY = this.y > pb.y - 5 && this.y < pb.y + pb.h + 10;
      const leftEdge = Math.abs(this.x + this.w - pb.x) < CONFIG.ledgeWindow && old.x + old.w <= pb.x + 5;
      const rightEdge = Math.abs(this.x - (pb.x + pb.w)) < CONFIG.ledgeWindow && old.x >= pb.x + pb.w - 5;
      if (closeY && (leftEdge || rightEdge)) {
        this.state = "ledge";
        this.hangPlatform = p;
        this.facing = leftEdge ? 1 : -1;
        this.x = leftEdge ? pb.x - this.w + 2 : pb.x + pb.w - 2;
        this.y = pb.y + 2;
        this.vx = 0;
        this.vy = 0;
        break;
      }
    }
  }

  draw(ctx, camera) {
    if (this.deadFade > 0) ctx.globalAlpha = Math.max(0, 1 - this.deadFade);
    const x = Math.round(this.x);
    const y = Math.round(camera.worldToScreenY(this.y));
    const bob = this.state === "idle" ? -1 : 0;
    ctx.fillStyle = "#070708";
    ctx.fillRect(x + 3, y + bob, 8, 8);
    if (this.state === "idle") ctx.fillRect(x + 5, y - 2, 7, 4);
    ctx.fillStyle = "#1A191A";
    ctx.fillRect(x + 2, y + 8, 10, 7);
    ctx.fillStyle = COLORS.overalls;
    ctx.fillRect(x + 3, y + 12, 8, 9);
    ctx.fillRect(x + 2, y + 9, 2, 6);
    ctx.fillRect(x + 10, y + 9, 2, 6);
    ctx.fillStyle = "#BBA88F";
    if (this.state === "ledge") {
      ctx.fillRect(x + (this.facing > 0 ? 11 : 0), y - 2, 3, 5);
      ctx.fillRect(x + (this.facing > 0 ? 7 : 4), y - 2, 3, 5);
    } else if (this.state === "struggle") {
      ctx.fillRect(x - 1, y + 10, 3, 8);
      ctx.fillRect(x + 12, y + 9, 3, 8);
    } else {
      ctx.fillRect(x + 1, y + 10, 3, 7);
      ctx.fillRect(x + 11, y + 10, 3, 7);
    }
    ctx.fillStyle = "#151517";
    const step = Math.floor(this.anim * 10) % 2;
    const crouch = this.state === "jump" || this.state === "struggle" ? -2 : 0;
    ctx.fillRect(x + 3, y + 21 + crouch, 3, 5);
    ctx.fillRect(x + 8, y + 21 + (step && this.state === "run" ? 1 : crouch), 3, 5);
    ctx.globalAlpha = 1;
  }
}
