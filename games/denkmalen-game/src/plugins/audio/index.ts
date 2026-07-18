// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Audio Plugin
// Manages all game audio: sound effects, background music, and special effects.
// Uses Web Audio API exclusively — zero external file dependencies.
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin, PluginContext } from '@/plugin-system/base'
import { useGameStore } from '@/store/gameStore'

import {
  playSound as playSoundEffect,
  resumeContext,
  SoundName,
} from './sounds'

import {
  startMusic,
  stopMusic as stopBGMusic,
  setMusicVolume,
  onPhaseChange,
  playCountdownTick,
  playFanfare,
} from './music'

import {
  playVictory,
  playDefeat,
  playDrawingStarted,
  playTimeWarning,
  playVoteCast,
  playScoreReveal,
  playNewRound,
  playRoundComplete,
  playPlayerJoin,
  playPlayerLeave,
  playAchievement,
  playUIClick,
  playError,
  playSuccess,
  playCountdown,
  playGameOver,
} from './effects'

// ─── Plugin Config ───────────────────────────────────────────────────────────

interface AudioConfig {
  enabled: boolean
  masterVolume: number      // 0..1
  soundVolume: number       // 0..1
  musicVolume: number       // 0..1
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSoundEnabled(): boolean {
  try {
    return useGameStore.getState().settings.sound
  } catch {
    return true
  }
}

function isMusicEnabled(): boolean {
  try {
    return useGameStore.getState().settings.music
  } catch {
    return true
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Play a named sound effect (respects settings.sound toggle) */
export function playSound(name: SoundName) {
  if (!isSoundEnabled()) return
  playSoundEffect(name)
}

/** Start background music (respects settings.music toggle) */
export function playMusic() {
  if (!isMusicEnabled()) return
  startMusic()
}

/** Stop background music */
export function stopMusic() {
  stopBGMusic()
}

/** Set master volume for all audio (0..1) */
export function setVolume(v: number) {
  setMusicVolume(v)
}

// Re-export effects for direct access
export {
  playVictory,
  playDefeat,
  playDrawingStarted,
  playTimeWarning,
  playVoteCast,
  playScoreReveal,
  playNewRound,
  playRoundComplete,
  playPlayerJoin,
  playPlayerLeave,
  playAchievement,
  playUIClick,
  playError,
  playSuccess,
  playCountdown,
  playGameOver,
}
export type { SoundName } from './sounds'

// ─── Plugin Definition ───────────────────────────────────────────────────────

const AudioPlugin = createPlugin<AudioConfig>(
  {
    id: 'audio',
    name: 'Audio System',
    version: '1.0.0',
    description:
      'Manages all game audio via Web Audio API: sound effects, background music, and special event sounds.',
    author: 'Sketch Battle Team',
    dependencies: [],
    optional: true,
  },
  (ctx: PluginContext, config: AudioConfig) => {
    // Store handlers so we can clean up on deactivate
    const handlers: Array<[string, (...args: unknown[]) => void]> = []

    function on(event: string, handler: (...args: unknown[]) => void) {
      ctx.on(event, handler)
      handlers.push([event, handler])
    }

    function cleanup() {
      handlers.forEach(([event, handler]) => ctx.off(event, handler))
      handlers.length = 0
      stopBGMusic()
    }

    return {
      onInit() {
        // Ensure AudioContext is created & ready
        resumeContext()
      },

      onActivate() {
        // ── Subscribe to core game events ────────────────────────────────

        on('game:start', () => {
          if (isMusicEnabled()) playMusic()
          playSuccess()
        })

        on('game:round:start', () => {
          playNewRound()
          if (isMusicEnabled()) playMusic()
        })

        on('game:round:end', () => {
          playRoundComplete()
          stopBGMusic()
        })

        on('game:drawing:save', () => {
          // Subtle confirmation on drawing save
          playSoundEffect('click')
        })

        on('game:vote:cast', () => {
          playVoteCast()
        })

        on('game:score:calculate', () => {
          playScoreReveal()
        })

        on('game:end', () => {
          stopBGMusic()
          playVictory()
        })

        on('player:join', () => {
          playPlayerJoin()
        })

        on('player:leave', () => {
          playPlayerLeave()
        })

        on('room:create', () => {
          playSuccess()
        })

        on('room:join', () => {
          playSoundEffect('click')
        })

        // ── Subscribe to audio plugin events ─────────────────────────────

        on('audio:countdown', (secondsLeft?: unknown) => {
          if (typeof secondsLeft === 'number') {
            playCountdownTick(secondsLeft)
          }
        })

        on('audio:achievement', () => {
          playAchievement()
        })

        // ── Listen to phase changes for automatic music control ──────────

        on('game:phase:change', (phase?: unknown) => {
          if (typeof phase === 'string') {
            onPhaseChange(phase, isMusicEnabled())
          }
        })
      },

      onDeactivate() {
        cleanup()
      },

      onDestroy() {
        cleanup()
      },
    }
  },
)

// ─── Export singleton ────────────────────────────────────────────────────────

export default AudioPlugin.create()
