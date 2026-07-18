// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Audio Plugin — Sound Effects (Web Audio API)
// No external files — all sounds are synthesized offline via oscillators
// ═══════════════════════════════════════════════════════════════════════════════

/** Shared AudioContext singleton (created lazily for browser compatibility) */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  if (typeof window === 'undefined') return null
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    return ctx
  } catch {
    return null
  }
}

/** Resume context if suspended (mobile browsers) */
export function resumeContext() {
  const c = getCtx()
  if (c && c.state === 'suspended') c.resume()
}

// ─── Core Tone Primitive ─────────────────────────────────────────────────────

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0,
) {
  const c = getCtx()
  if (!c) return

  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.connect(gain)
  gain.connect(c.destination)

  osc.frequency.value = frequency
  osc.type = type

  const startTime = c.currentTime + delay
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  osc.start(startTime)
  osc.stop(startTime + duration)
}

// ─── Named Sound Effects ────────────────────────────────────────────────────

export type SoundName =
  | 'click'
  | 'success'
  | 'error'
  | 'countdown'
  | 'end'
  | 'winner'
  | 'vote'
  | 'drawStart'
  | 'drawTick'
  | 'roundEnd'
  | 'newRound'
  | 'playerJoin'
  | 'playerLeave'
  | 'achievement'
  | 'notification'
  | 'brushStroke'

const sounds: Record<SoundName, () => void> = {
  click() {
    playTone(800, 0.08, 'sine', 0.2)
  },

  success() {
    playTone(523, 0.1, 'sine', 0.3, 0)
    playTone(659, 0.1, 'sine', 0.3, 0.1)
    playTone(784, 0.2, 'sine', 0.3, 0.2)
  },

  error() {
    playTone(200, 0.25, 'sawtooth', 0.15)
  },

  countdown() {
    playTone(440, 0.1, 'square', 0.15)
  },

  end() {
    playTone(784, 0.1, 'sine', 0.3, 0)
    playTone(659, 0.1, 'sine', 0.3, 0.1)
    playTone(523, 0.2, 'sine', 0.3, 0.2)
  },

  winner() {
    playTone(523, 0.12, 'sine', 0.35, 0)
    playTone(659, 0.12, 'sine', 0.35, 0.15)
    playTone(784, 0.12, 'sine', 0.35, 0.3)
    playTone(1047, 0.35, 'sine', 0.4, 0.45)
  },

  vote() {
    playTone(600, 0.08, 'sine', 0.2)
  },

  drawStart() {
    playTone(440, 0.08, 'triangle', 0.25, 0)
    playTone(880, 0.12, 'triangle', 0.25, 0.08)
  },

  drawTick() {
    playTone(1200, 0.03, 'sine', 0.08)
  },

  roundEnd() {
    playTone(660, 0.15, 'triangle', 0.3, 0)
    playTone(550, 0.15, 'triangle', 0.3, 0.15)
    playTone(440, 0.3, 'triangle', 0.3, 0.3)
  },

  newRound() {
    playTone(440, 0.1, 'sine', 0.25, 0)
    playTone(554, 0.1, 'sine', 0.25, 0.1)
    playTone(659, 0.1, 'sine', 0.25, 0.2)
    playTone(880, 0.15, 'sine', 0.3, 0.3)
  },

  playerJoin() {
    playTone(523, 0.08, 'sine', 0.2, 0)
    playTone(784, 0.12, 'sine', 0.25, 0.08)
  },

  playerLeave() {
    playTone(784, 0.08, 'sine', 0.2, 0)
    playTone(523, 0.15, 'sine', 0.2, 0.08)
  },

  achievement() {
    playTone(523, 0.1, 'sine', 0.3, 0)
    playTone(659, 0.1, 'sine', 0.3, 0.1)
    playTone(784, 0.1, 'sine', 0.3, 0.2)
    playTone(1047, 0.1, 'sine', 0.35, 0.3)
    playTone(1319, 0.2, 'sine', 0.35, 0.4)
  },

  notification() {
    playTone(880, 0.06, 'sine', 0.15, 0)
    playTone(1100, 0.1, 'sine', 0.18, 0.06)
  },

  brushStroke() {
    playTone(200 + Math.random() * 100, 0.02, 'triangle', 0.03)
  },
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Play a named sound effect */
export function playSound(name: SoundName) {
  resumeContext()
  const fn = sounds[name]
  if (fn) fn()
}

/** Play an arbitrary tone (exposed for extensibility) */
export function playToneRaw(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0,
) {
  resumeContext()
  playTone(frequency, duration, type, volume, delay)
}
