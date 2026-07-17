// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Audio Plugin — Background Music Manager
// Procedural music via Web Audio API — no external files needed
// ═══════════════════════════════════════════════════════════════════════════════

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null
let currentLoop: ReturnType<typeof setInterval> | null = null
let isPlaying = false
let volume = 0.25

// Musical note frequencies (A4 = 440Hz)
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  if (typeof window === 'undefined') return null
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = volume
    masterGain.connect(ctx.destination)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0.6
    musicGain.connect(masterGain)
    return ctx
  } catch {
    return null
  }
}

function playNote(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.15,
  delay = 0,
  dest?: AudioNode,
) {
  const c = getCtx()
  if (!c || !musicGain) return

  const osc = c.createOscillator()
  const gain = c.createGain()

  osc.connect(gain)
  gain.connect(dest || musicGain)

  osc.frequency.value = freq
  osc.type = type

  const start = c.currentTime + delay
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(vol, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  osc.start(start)
  osc.stop(start + duration)
}

// ─── Music Patterns ──────────────────────────────────────────────────────────

/** Simple cheerful melody (drawing phase) — repeats every ~8s */
const MELODY_PATTERN: Array<[string, number, number]> = [
  ['C4', 0.3, 0],    ['E4', 0.3, 0.35],  ['G4', 0.3, 0.7],
  ['C5', 0.5, 1.1],  ['B4', 0.3, 1.7],   ['G4', 0.3, 2.1],
  ['E4', 0.3, 2.5],  ['G4', 0.3, 2.9],   ['A4', 0.3, 3.3],
  ['G4', 0.3, 3.7],  ['F4', 0.3, 4.1],   ['E4', 0.5, 4.5],
  ['D4', 0.3, 5.1],  ['C4', 0.3, 5.5],   ['E4', 0.3, 5.9],
  ['G4', 0.6, 6.3],
]

/** Bass line to accompany melody */
const BASS_PATTERN: Array<[string, number, number]> = [
  ['C3', 0.8, 0],   ['G3', 0.8, 1.2],   ['A3', 0.8, 2.4],
  ['E3', 0.8, 3.6], ['F3', 0.8, 4.8],    ['G3', 0.8, 5.6],
  ['C3', 1.0, 6.4],
]

/** Countdown music — tense, ascending notes */
function playCountdownTick(secondsLeft: number) {
  const freq = secondsLeft <= 3 ? NOTE['C5'] : secondsLeft <= 5 ? NOTE['A4'] : NOTE['E4']
  const vol = secondsLeft <= 3 ? 0.25 : 0.15
  playNote(freq, 0.15, 'square', vol)
}

/** Results fanfare — triumphant */
function playFanfare() {
  const melody: Array<[string, number, number, number]> = [
    ['C5', 0.15, 0, 0.2], ['E5', 0.15, 0.18, 0.2],
    ['G5', 0.15, 0.36, 0.2], ['C6', 0.4, 0.54, 0.25],
    ['G5', 0.1, 0.98, 0.15], ['E5', 0.1, 1.1, 0.15],
    ['C5', 0.5, 1.22, 0.2],
  ]
  melody.forEach(([note, dur, delay, vol]) => {
    const freq = NOTE[note] || NOTE['C5']
    playNote(freq, dur, 'sine', vol, delay)
  })
}

// ─── Loop Control ────────────────────────────────────────────────────────────

function scheduleLoop() {
  if (!isPlaying) return

  MELODY_PATTERN.forEach(([note, dur, delay]) => {
    playNote(NOTE[note] || NOTE['C4'], dur, 'sine', 0.12, delay)
  })

  BASS_PATTERN.forEach(([note, dur, delay]) => {
    playNote(NOTE[note] || NOTE['C3'], dur, 'triangle', 0.08, delay)
  })

  const loopDuration = 7500 // ms — slightly less than 8s for seamless feel
  currentLoop = setTimeout(scheduleLoop, loopDuration) as unknown as ReturnType<typeof setInterval>
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Start background music loop */
export function startMusic() {
  const c = getCtx()
  if (!c || !musicGain) return

  if (c.state === 'suspended') c.resume()

  if (isPlaying) return
  isPlaying = true
  scheduleLoop()
}

/** Stop background music */
export function stopMusic() {
  isPlaying = false
  if (currentLoop) {
    clearTimeout(currentLoop as unknown as number)
    currentLoop = null
  }
  // Fade out
  if (musicGain) {
    musicGain.gain.linearRampToValueAtTime(0, (ctx?.currentTime || 0) + 0.3)
    setTimeout(() => {
      if (musicGain) musicGain.gain.value = 0.6
    }, 350)
  }
}

/** Set master music volume (0..1) */
export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (masterGain) masterGain.gain.value = volume
}

/** Get current playing state */
export function isMusicPlaying(): boolean {
  return isPlaying
}

// ─── Event-Driven Music ─────────────────────────────────────────────────────

export { playCountdownTick, playFanfare }

/**
 * React to game phase changes.
 * Call this when the game phase changes to control music automatically.
 */
export function onPhaseChange(phase: string, musicEnabled: boolean) {
  if (!musicEnabled) {
    stopMusic()
    return
  }

  switch (phase) {
    case 'drawing':
      startMusic()
      break
    case 'voting':
      stopMusic()
      break
    case 'results':
      stopMusic()
      playFanfare()
      break
    case 'menu':
    case 'lobby':
    case 'setup':
      stopMusic()
      break
    default:
      break
  }
}
