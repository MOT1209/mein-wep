export class SoundManager {
  constructor() {
    this._ctx = null;
    this._enabled = true;
    this._volume = 0.3;
    this._stepTimer = 0;
  }

  _ensure() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this._enabled = false;
      }
    }
    if (this._ctx && this._ctx.state === "suspended") this._ctx.resume();
    return this._ctx;
  }

  _noise(len) {
    const s = this._ctx.sampleRate * len;
    const b = this._ctx.createBuffer(1, s, this._ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < s; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  _play(src, volMul = 1, pitch = 1) {
    if (!this._enabled) return;
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * volMul;
    g.connect(ctx.destination);
    const n = ctx.createBufferSource();
    n.buffer = src;
    n.playbackRate.value = pitch;
    n.connect(g);
    n.start();
  }

  playBreak() {
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.08);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 800;
    f.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.5;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playPlace() {
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.03);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 600;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.4;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playPickup() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.2;
    g.connect(ctx.destination);
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      const gg = ctx.createGain();
      gg.gain.value = 0.15;
      gg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 + i * 0.06);
      o.connect(gg); gg.connect(g);
      o.start(ctx.currentTime + i * 0.06);
      o.stop(ctx.currentTime + 0.15 + i * 0.06);
    });
  }

  playHurt() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.4;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  }

  playEat() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.3;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    g.connect(ctx.destination);
    const n = this._noise(0.2);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 2000;
    f.Q.value = 5;
    const src = ctx.createBufferSource();
    src.buffer = n;
    src.connect(f); f.connect(g);
    src.start();
  }

  playDeath() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.5;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + 1);
  }

  // ===== أصوات جديدة للمرحلة 4 =====
  playStep() {
    // خطوات خفيفة blend مع ضوضاء
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.04);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 400;
    f.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.2;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playJump() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.15;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + 0.1);
  }

  playLand() {
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.06);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 300;
    f.Q.value = 1;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.25;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playDig() {
    // صوت حفر أثناء التعدين (يتكرر بنسبة التقدم)
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.06);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 600;
    f.Q.value = 4;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.15;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playMobHurt() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.3;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  }

  playMobDeath() {
    const ctx = this._ensure();
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.35;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    g.connect(ctx.destination);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(600, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
    o.connect(g);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  }

  playSplash() {
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.15);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1200;
    f.Q.value = 3;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.4;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }

  playSwing() {
    const ctx = this._ensure();
    if (!ctx) return;
    const b = this._noise(0.03);
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 2000;
    const g = ctx.createGain();
    g.gain.value = this._volume * 0.1;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    const n = ctx.createBufferSource();
    n.buffer = b;
    n.connect(f); f.connect(g); g.connect(ctx.destination);
    n.start();
  }
}
