import type { MaterialKind } from "../content/blocks";

export type SfxKind = "dig" | "break" | "place" | "step" | "hurt" | "craft" | "eat" | "pickup";

export interface NoiseVoice {
  type: "noise";
  filter: BiquadFilterType;
  frequency: number;
  q: number;
  duration: number;
  gain: number;
  delay: number;
}

export interface ToneVoice {
  type: "tone";
  wave: OscillatorType;
  from: number;
  to: number;
  duration: number;
  gain: number;
  delay: number;
}

export type Voice = NoiseVoice | ToneVoice;

const MATERIAL_TONE: Readonly<Record<MaterialKind, { freq: number; q: number; filter: BiquadFilterType }>> = {
  stone: { freq: 1700, q: 1.2, filter: "bandpass" },
  dirt: { freq: 520, q: 0.8, filter: "lowpass" },
  grass: { freq: 900, q: 0.7, filter: "bandpass" },
  sand: { freq: 3200, q: 0.6, filter: "highpass" },
  wood: { freq: 760, q: 3, filter: "bandpass" },
  plant: { freq: 4200, q: 0.8, filter: "bandpass" },
  glass: { freq: 3600, q: 8, filter: "bandpass" },
  metal: { freq: 2400, q: 12, filter: "bandpass" },
  wool: { freq: 380, q: 0.5, filter: "lowpass" },
  snow: { freq: 2600, q: 0.5, filter: "highpass" },
  liquid: { freq: 700, q: 2, filter: "lowpass" },
  gem: { freq: 3000, q: 10, filter: "bandpass" }
};

function noise(material: MaterialKind, duration: number, gain: number, delay = 0, scale = 1): NoiseVoice {
  const tone = MATERIAL_TONE[material] ?? MATERIAL_TONE.stone;
  return { type: "noise", filter: tone.filter, frequency: tone.freq * scale, q: tone.q, duration, gain, delay };
}

export function voicesFor(kind: SfxKind, material: MaterialKind = "stone"): Voice[] {
  switch (kind) {
    case "dig":
      return [noise(material, 0.06, 0.35)];
    case "break":
      return [noise(material, 0.16, 0.6), noise(material, 0.1, 0.35, 0.05, 0.7)];
    case "place":
      return [noise(material, 0.08, 0.5, 0, 0.8), { type: "tone", wave: "sine", from: 180, to: 120, duration: 0.07, gain: 0.25, delay: 0 }];
    case "step":
      return [noise(material, 0.05, 0.18, 0, 0.9)];
    case "hurt":
      return [
        { type: "tone", wave: "square", from: 320, to: 140, duration: 0.18, gain: 0.25, delay: 0 },
        { type: "noise", filter: "lowpass", frequency: 900, q: 0.7, duration: 0.12, gain: 0.3, delay: 0 }
      ];
    case "craft":
      return [
        { type: "tone", wave: "triangle", from: 660, to: 660, duration: 0.09, gain: 0.22, delay: 0 },
        { type: "tone", wave: "triangle", from: 990, to: 990, duration: 0.12, gain: 0.2, delay: 0.08 }
      ];
    case "eat":
      return [0, 0.12, 0.24].map((delay) => ({ type: "noise", filter: "bandpass", frequency: 1400, q: 1.5, duration: 0.06, gain: 0.3, delay }) as NoiseVoice);
    case "pickup":
      return [{ type: "tone", wave: "sine", from: 700, to: 1300, duration: 0.08, gain: 0.18, delay: 0 }];
    default:
      return [];
  }
}

const MIN_GAP_SECONDS = 0.035;

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private volume = 0.7;
  private lastPlayed = new Map<string, number>();

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.master) this.master.gain.value = this.volume;
  }

  get muted(): boolean {
    return this.volume <= 0;
  }

  unlock(): void {
    if (this.volume <= 0) return;
    const ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!ctor) return;
    if (!this.ctx) {
      this.ctx = new ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      const length = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      let seed = 0x2468ace;
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        data[i] = seed / 2147483648 - 1;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  play(kind: SfxKind, material: MaterialKind = "stone"): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.volume <= 0 || ctx.state !== "running") return;
    const key = `${kind}:${material}`;
    const now = ctx.currentTime;
    if (now - (this.lastPlayed.get(key) ?? -1) < MIN_GAP_SECONDS) return;
    this.lastPlayed.set(key, now);
    for (const voice of voicesFor(kind, material)) {
      const start = now + voice.delay;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(voice.gain, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration);
      gain.connect(master);
      if (voice.type === "noise" && this.noiseBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = voice.filter;
        filter.frequency.value = voice.frequency;
        filter.Q.value = voice.q;
        source.connect(filter);
        filter.connect(gain);
        source.start(start, Math.random() * 0.3, voice.duration + 0.02);
      } else if (voice.type === "tone") {
        const osc = ctx.createOscillator();
        osc.type = voice.wave;
        osc.frequency.setValueAtTime(voice.from, start);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, voice.to), start + voice.duration);
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + voice.duration + 0.02);
      }
    }
  }
}
