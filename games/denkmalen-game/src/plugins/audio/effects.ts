// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Audio Plugin — Special Effects
// Higher-level compound sound effects for game moments
// ═══════════════════════════════════════════════════════════════════════════════

import { playSound, playToneRaw } from './sounds'

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

// ─── White Noise Generator (for whoosh / applause textures) ──────────────────

function playNoise(duration: number, volume = 0.05, delay = 0) {
  const c = getCtx()
  if (!c) return

  const bufferSize = Math.floor(c.sampleRate * duration)
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5
  }

  const source = c.createBufferSource()
  source.buffer = buffer

  const gain = c.createGain()
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2000

  source.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)

  const start = c.currentTime + delay
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  source.start(start)
  source.stop(start + duration)
}

// ─── Compound Effects ────────────────────────────────────────────────────────

/** Victory fanfare — multi-layered celebration */
export function playVictory() {
  playSound('winner')
  playNoise(0.8, 0.03, 0.45)
}

/** Defeat — descending sad tones */
export function playDefeat() {
  playToneRaw(440, 0.3, 'sine', 0.25, 0)
  playToneRaw(370, 0.3, 'sine', 0.2, 0.3)
  playToneRaw(311, 0.3, 'sine', 0.15, 0.6)
  playToneRaw(261, 0.6, 'sine', 0.15, 0.9)
}

/** Drawing started — whoosh + tone */
export function playDrawingStarted() {
  playNoise(0.3, 0.06, 0)
  playSound('drawStart')
}

/** Time running low warning — rapid ticks */
export function playTimeWarning(secondsLeft: number) {
  if (secondsLeft <= 0) return
  const freq = secondsLeft <= 3 ? 880 : secondsLeft <= 5 ? 660 : 440
  const vol = secondsLeft <= 3 ? 0.25 : 0.15
  playToneRaw(freq, 0.12, 'square', vol)
}

/** Vote cast — satisfying double-click */
export function playVoteCast() {
  playSound('vote')
}

/** Score reveal — ascending arpeggio */
export function playScoreReveal() {
  const notes = [261, 329, 392, 523]
  notes.forEach((freq, i) => {
    playToneRaw(freq, 0.15, 'sine', 0.2, i * 0.12)
  })
}

/** New round transition — energetic sequence */
export function playNewRound() {
  playSound('newRound')
}

/** Round complete — descending jingle */
export function playRoundComplete() {
  playSound('roundEnd')
}

/** Player join — ascending chime */
export function playPlayerJoin() {
  playSound('playerJoin')
}

/** Player leave — descending chime */
export function playPlayerLeave() {
  playSound('playerLeave')
}

/** Achievement unlocked — sparkle cascade */
export function playAchievement() {
  playSound('achievement')
  // Add sparkle noise
  const freqs = [1319, 1568, 2093, 2637, 3136]
  freqs.forEach((f, i) => {
    playToneRaw(f, 0.08, 'sine', 0.1, 0.4 + i * 0.06)
  })
}

/** UI interaction — subtle click */
export function playUIClick() {
  playSound('click')
}

/** Error — harsh buzz */
export function playError() {
  playSound('error')
}

/** Success — bright chime */
export function playSuccess() {
  playSound('success')
}

/** Countdown tick */
export function playCountdown() {
  playSound('countdown')
}

/** Game over — dramatic sequence */
export function playGameOver() {
  playToneRaw(784, 0.15, 'sine', 0.3, 0)
  playToneRaw(659, 0.15, 'sine', 0.3, 0.15)
  playToneRaw(523, 0.15, 'sine', 0.3, 0.3)
  playToneRaw(392, 0.15, 'sine', 0.25, 0.45)
  playToneRaw(330, 0.4, 'sine', 0.2, 0.6)
}
