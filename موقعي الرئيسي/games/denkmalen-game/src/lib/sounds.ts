/**
 * Sound Effects Manager for Denkmalen
 * 
 * Uses Web Audio API for lightweight sound effects.
 * No external dependencies needed.
 */

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.5

  constructor() {
    // Lazy initialization - create context on first use
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(this.volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {
      // Silently fail if audio context is not available
    }
  }

  private playNoise(duration: number): void {
    if (!this.enabled) return

    try {
      const ctx = this.getContext()
      const bufferSize = ctx.sampleRate * duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      noise.connect(gainNode)
      gainNode.connect(ctx.destination)

      noise.start()
    } catch {
      // Silently fail
    }
  }

  // ── Public Methods ──────────────────────────────────────────────

  /** Button click sound */
  click(): void {
    this.playTone(800, 0.05, 'sine')
  }

  /** Success/confirm sound */
  success(): void {
    this.playTone(523, 0.1, 'sine')
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100)
    setTimeout(() => this.playTone(784, 0.15, 'sine'), 200)
  }

  /** Error/cancel sound */
  error(): void {
    this.playTone(330, 0.15, 'square')
    setTimeout(() => this.playTone(220, 0.2, 'square'), 150)
  }

  /** Drawing stroke sound */
  draw(): void {
    this.playNoise(0.02)
  }

  /** Timer warning sound (for last 10 seconds) */
  timerWarning(): void {
    this.playTone(880, 0.08, 'sine')
  }

  /** Timer up sound */
  timerUp(): void {
    this.playTone(440, 0.1, 'square')
    setTimeout(() => this.playTone(440, 0.1, 'square'), 150)
    setTimeout(() => this.playTone(440, 0.1, 'square'), 300)
  }

  /** Vote submitted sound */
  vote(): void {
    this.playTone(660, 0.08, 'sine')
    setTimeout(() => this.playTone(880, 0.1, 'sine'), 80)
  }

  /** Winner celebration sound */
  celebrate(): void {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.1, 'sine'), i * 80)
    })
  }

  /** Page transition sound */
  transition(): void {
    this.playTone(440, 0.05, 'sine')
    setTimeout(() => this.playTone(660, 0.05, 'sine'), 50)
  }

  /** Enable/disable sounds */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /** Set volume (0-1) */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  /** Check if sounds are enabled */
  isEnabled(): boolean {
    return this.enabled
  }

  /** Resume audio context (needed after user interaction) */
  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }
  }
}

// Singleton instance
export const sounds = new SoundManager()