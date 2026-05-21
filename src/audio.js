export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noise = null;
    this.filter = null;
    this.osc = null;
    this.started = false;
  }

  start() {
    if (this.started) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.045;
    this.master.connect(this.ctx.destination);

    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = this.ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "bandpass";
    this.filter.frequency.value = 420;
    this.filter.Q.value = 0.7;
    this.noise.connect(this.filter).connect(this.master);
    this.noise.start();

    this.osc = this.ctx.createOscillator();
    this.osc.type = "sine";
    this.osc.frequency.value = 54;
    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.035;
    this.osc.connect(oscGain).connect(this.master);
    this.osc.start();
    this.started = true;
  }

  update(heightProgress, lonely, endingStopped) {
    if (!this.started) return;
    const t = this.ctx.currentTime;
    const base = lonely ? 180 : 360 + heightProgress * 820;
    this.filter.frequency.setTargetAtTime(endingStopped ? 1400 : base, t, 0.25);
    this.master.gain.setTargetAtTime(endingStopped ? 0.028 : lonely ? 0.025 : 0.045, t, 0.25);
  }

  blip(type) {
    if (!this.started) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freqs = { tv: 900, newspaper: 260, film: 150, frame: 620, fire: 95, help: 180 };
    osc.type = type === "film" ? "sawtooth" : "square";
    osc.frequency.value = freqs[type] || 440;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}
