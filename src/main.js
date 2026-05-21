import { AudioEngine } from "./audio.js";
import { Camera } from "./camera.js";
import { COLORS, CONFIG, H, W } from "./config.js";
import { Ending } from "./ending.js";
import { Fire } from "./fire.js";
import { Input } from "./input.js";
import { PlatformManager } from "./platform.js";
import { Player } from "./player.js";
import { loadSave, unlockLonely } from "./save.js";
import { seededNoise } from "./utils.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const deathMenu = document.querySelector("#death-menu");
const confirmMenu = document.querySelector("#confirm-menu");
const input = new Input(canvas);
const audio = new AudioEngine();
const camera = new Camera();
const player = new Player();
const fire = new Fire();
const platforms = new PlatformManager();
const ending = new Ending();
let save = loadSave();
let scene = "start";
let falls = 0;
let last = performance.now();
let normalEndReady = false;

function fitCanvas() {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", fitCanvas);
fitCanvas();
resetRun(false);

function resetRun(lonely) {
  camera.reset();
  player.reset();
  fire.reset();
  fire.dim(falls);
  platforms.reset(lonely);
  ending.reset();
  normalEndReady = false;
  hideMenus();
}

function hideMenus() {
  deathMenu.classList.add("hidden");
  deathMenu.setAttribute("aria-hidden", "true");
  confirmMenu.classList.add("hidden");
  confirmMenu.setAttribute("aria-hidden", "true");
}

function setScene(next) {
  scene = next;
  if (next === "fireDeath") {
    deathMenu.classList.remove("hidden");
    deathMenu.setAttribute("aria-hidden", "false");
  } else {
    hideMenus();
  }
}

deathMenu.addEventListener("click", (e) => {
  const action = e.target?.dataset?.action;
  if (action === "retry") {
    falls = 0;
    resetRun(false);
    setScene("playing");
  }
  if (action === "lonely") {
    unlockLonely();
    save = loadSave();
    falls = CONFIG.maxFallsBeforeLonely;
    resetRun(true);
    setScene("lonely");
  }
});

confirmMenu.addEventListener("click", (e) => {
  const action = e.target?.dataset?.action;
  if (action === "cancel") hideMenus();
  if (action === "confirm") {
    falls = 0;
    resetRun(false);
    setScene("start");
  }
});

canvas.addEventListener("pointerdown", () => {
  audio.start();
  if (scene === "start") setScene("playing");
  else if (scene === "endingStopped") {
    confirmMenu.classList.remove("hidden");
    confirmMenu.setAttribute("aria-hidden", "false");
  } else if (scene === "ending" && ending.phase === "approach" && normalEndReady) {
    ending.startFall(player);
  }
});

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt) {
  const lonely = scene === "lonely";
  audio.update(Math.min(1, Math.abs(camera.y) / Math.abs(CONFIG.worldEndY)), lonely, scene === "endingStopped");
  if (scene === "start") {
    fire.update(dt, player);
    return;
  }
  if (scene === "playing" || scene === "lonely") {
    camera.update(player, dt);
    platforms.update(dt, camera, lonely ? null : fire, lonely, audio);
    player.update(dt, input, platforms.platforms, audio, lonely);
    if (!lonely) fire.update(dt, player, player.y < CONFIG.worldEndY + 900);
    if (!lonely) handleFireContact();
    if (player.y - camera.y > H + 130) handleFall();
    if (!lonely && player.y < CONFIG.worldEndY) enterEndingApproach();
  } else if (scene === "ending") {
    if (ending.phase === "approach") {
      camera.update(player, dt);
      player.update(dt, input, platforms.platforms, audio, false);
      fire.update(dt, player, true);
      if (input.anyPressed) normalEndReady = true;
    } else if (ending.update(dt, player) === "stopped") {
      setScene("endingStopped");
    }
  } else if (scene === "endingStopped") {
    ending.update(dt, player);
  }
}

function handleFireContact() {
  const result = fire.touchPlayer(player);
  if (!result) return;
  if (result === "kill") {
    audio.blip("fire");
    unlockLonely();
    save = loadSave();
    player.deadFade = 1;
    setScene("fireDeath");
  } else {
    player.vy = -520;
    player.grounded = false;
    player.canDouble = true;
    audio.blip("help");
  }
}

function handleFall() {
  falls += 1;
  if (falls >= CONFIG.maxFallsBeforeLonely) {
    unlockLonely();
    save = loadSave();
    resetRun(true);
    setScene("lonely");
  } else {
    resetRun(scene === "lonely");
    if (scene !== "lonely") setScene("playing");
  }
}

function enterEndingApproach() {
  scene = "ending";
  normalEndReady = false;
  platforms.platforms = platforms.platforms.filter((p) => p.y < player.y + 180 && p.y > player.y - 420);
  platforms.platforms.push({ x: 132, y: player.y - 88, w: 96, h: 12, type: "stone", solid: true, awake: 0, update() {}, onStand() {}, collisionBox() { return this; }, draw(ctx2, cam) {
    ctx2.fillStyle = COLORS.platform;
    ctx2.fillRect(this.x, cam.worldToScreenY(this.y), this.w, this.h);
  } });
}

function draw() {
  if (scene === "ending" && ending.phase === "fall") {
    ending.drawFall(ctx, player);
    return;
  }
  if (scene === "endingStopped") {
    ending.drawStopped(ctx);
    return;
  }
  drawBackground();
  const lonely = scene === "lonely";
  for (const p of platforms.platforms) p.draw(ctx, camera, lonely);
  if (!lonely) fire.draw(ctx, camera);
  player.draw(ctx, camera);
  if (scene === "fireDeath") drawDeathShade();
}

function drawBackground() {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  const progress = Math.min(1, Math.abs(camera.y) / Math.abs(CONFIG.worldEndY));
  ctx.fillStyle = `rgba(10,10,11,${0.25 + progress * 0.2})`;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(216,210,192,0.09)";
  for (let i = 0; i < 80; i++) {
    const x = seededNoise(i * 7) * W;
    const y = (seededNoise(i * 11) * H + Math.abs(camera.y) * (0.08 + seededNoise(i) * 0.05)) % H;
    ctx.fillRect(x, y, 1, seededNoise(i * 13) > 0.95 ? 5 : 1);
  }
  ctx.strokeStyle = "rgba(169,169,168,0.08)";
  for (let i = 0; i < 4; i++) {
    const x = 40 + i * 84 + seededNoise(i) * 8;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.sin(camera.y * 0.002 + i) * 3, H);
    ctx.stroke();
  }
  if (scene === "start") {
    ctx.fillStyle = "rgba(0,0,0,0.34)";
    ctx.fillRect(0, 0, W, H);
  }
}

function drawDeathShade() {
  ctx.fillStyle = "rgba(0,0,0,0.46)";
  ctx.fillRect(0, 0, W, H);
}

window.__SCW_DEBUG__ = {
  config: CONFIG,
  get scene() {
    return scene;
  },
  unlockLonely,
  save,
};
