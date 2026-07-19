// ═══════════════════════════════════════════════════════════════════════════════
// Test: Audio Plugin — Sounds, Music, Effects
// ═══════════════════════════════════════════════════════════════════════════════

// Mock AudioContext globally
const mockAudioContext = {
  state: 'running',
  sampleRate: 44100,
  currentTime: 0,
  destination: {},
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
    disconnect: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      value: 1,
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      cancelScheduledValues: jest.fn(),
    },
    disconnect: jest.fn(),
  })), 
  createBuffer: jest.fn((channels, length, sampleRate) => ({
    getChannelData: jest.fn(() => new Float32Array(length)),
    numberOfChannels: channels,
    length,
    sampleRate,
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null,
    disconnect: jest.fn(),
  })),
  createBiquadFilter: jest.fn(() => ({
    connect: jest.fn(),
    type: 'lowpass',
    frequency: { value: 0 },
    Q: { value: 0 },
  })),
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
}

// @ts-ignore
window.AudioContext = jest.fn(() => mockAudioContext)
// @ts-ignore
window.webkitAudioContext = jest.fn(() => mockAudioContext)

// Mock game store (needed by audio plugin)
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      settings: { sound: true, music: true },
    })),
  },
}))

// Import after mock
import {
  playSound,
  resumeContext,
  playToneRaw,
} from '@/plugins/audio/sounds'

import {
  startMusic,
  stopMusic,
  setMusicVolume,
  isMusicPlaying,
  onPhaseChange,
  playCountdownTick,
  playFanfare,
} from '@/plugins/audio/music'

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
} from '@/plugins/audio/effects'

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Audio - Sounds Module', () => {
  it('should export playSound function', () => {
    expect(typeof playSound).toBe('function')
  })

  it('should export resumeContext function', () => {
    expect(typeof resumeContext).toBe('function')
  })

  it('should export playToneRaw function', () => {
    expect(typeof playToneRaw).toBe('function')
  })

  it('playSound should not throw for valid sound names', () => {
    const names = [
      'click', 'success', 'error', 'countdown', 'end', 'winner',
      'vote', 'drawStart', 'drawTick', 'roundEnd', 'newRound',
      'playerJoin', 'playerLeave', 'achievement', 'notification', 'brushStroke',
    ] as const

    names.forEach(name => {
      expect(() => playSound(name)).not.toThrow()
    })
  })

  it('playToneRaw should not throw', () => {
    expect(() => playToneRaw(440, 0.1, 'sine', 0.3, 0)).not.toThrow()
  })

  it('resumeContext should not throw', () => {
    expect(() => resumeContext()).not.toThrow()
  })
})

describe('Audio - Music Module', () => {
  beforeEach(() => {
    // Stop music if playing
    stopMusic()
  })

  it('should export startMusic', () => {
    expect(typeof startMusic).toBe('function')
  })

  it('should export stopMusic', () => {
    expect(typeof stopMusic).toBe('function')
  })

  it('should export setMusicVolume', () => {
    expect(typeof setMusicVolume).toBe('function')
  })

  it('should export isMusicPlaying', () => {
    expect(typeof isMusicPlaying).toBe('function')
  })

  it('isMusicPlaying should return false initially', () => {
    stopMusic()
    expect(isMusicPlaying()).toBe(false)
  })

  it('startMusic should not throw', () => {
    expect(() => startMusic()).not.toThrow()
  })

  it('stopMusic should not throw', () => {
    startMusic()
    expect(() => stopMusic()).not.toThrow()
  })

  it('setMusicVolume should not throw', () => {
    expect(() => setMusicVolume(0.5)).not.toThrow()
    expect(() => setMusicVolume(0)).not.toThrow()
    expect(() => setMusicVolume(1)).not.toThrow()
  })

  it('onPhaseChange should not throw', () => {
    expect(() => onPhaseChange('drawing', true)).not.toThrow()
    expect(() => onPhaseChange('voting', true)).not.toThrow()
    expect(() => onPhaseChange('results', true)).not.toThrow()
    expect(() => onPhaseChange('menu', true)).not.toThrow()
    expect(() => onPhaseChange('lobby', true)).not.toThrow()
    expect(() => onPhaseChange('setup', true)).not.toThrow()
    expect(() => onPhaseChange('drawing', false)).not.toThrow()
  })

  it('playCountdownTick should not throw', () => {
    expect(() => playCountdownTick(10)).not.toThrow()
    expect(() => playCountdownTick(3)).not.toThrow()
    expect(() => playCountdownTick(1)).not.toThrow()
  })

  it('playFanfare should not throw', () => {
    expect(() => playFanfare()).not.toThrow()
  })

  it('onPhaseChange with musicEnabled false should stop music', () => {
    startMusic()
    onPhaseChange('drawing', false)
    expect(isMusicPlaying()).toBe(false)
  })

  it('onPhaseChange drawing with musicEnabled should start music', () => {
    onPhaseChange('drawing', true)
    expect(isMusicPlaying()).toBe(true)
    stopMusic()
  })

  it('onPhaseChange voting should stop music', () => {
    startMusic()
    onPhaseChange('voting', true)
    expect(isMusicPlaying()).toBe(false)
  })

  it('onPhaseChange results should stop music', () => {
    startMusic()
    onPhaseChange('results', true)
    expect(isMusicPlaying()).toBe(false)
  })
})

describe('Audio - Effects Module', () => {
  it('playVictory should not throw', () => {
    expect(() => playVictory()).not.toThrow()
  })

  it('playDefeat should not throw', () => {
    expect(() => playDefeat()).not.toThrow()
  })

  it('playDrawingStarted should not throw', () => {
    expect(() => playDrawingStarted()).not.toThrow()
  })

  it('playTimeWarning should not throw for various values', () => {
    expect(() => playTimeWarning(10)).not.toThrow()
    expect(() => playTimeWarning(5)).not.toThrow()
    expect(() => playTimeWarning(3)).not.toThrow()
    expect(() => playTimeWarning(1)).not.toThrow()
  })

  it('playTimeWarning should not throw for zero or negative', () => {
    expect(() => playTimeWarning(0)).not.toThrow()
    expect(() => playTimeWarning(-1)).not.toThrow()
  })

  it('playVoteCast should not throw', () => {
    expect(() => playVoteCast()).not.toThrow()
  })

  it('playScoreReveal should not throw', () => {
    expect(() => playScoreReveal()).not.toThrow()
  })

  it('playNewRound should not throw', () => {
    expect(() => playNewRound()).not.toThrow()
  })

  it('playRoundComplete should not throw', () => {
    expect(() => playRoundComplete()).not.toThrow()
  })

  it('playPlayerJoin should not throw', () => {
    expect(() => playPlayerJoin()).not.toThrow()
  })

  it('playPlayerLeave should not throw', () => {
    expect(() => playPlayerLeave()).not.toThrow()
  })

  it('playAchievement should not throw', () => {
    expect(() => playAchievement()).not.toThrow()
  })

  it('playUIClick should not throw', () => {
    expect(() => playUIClick()).not.toThrow()
  })

  it('playError should not throw', () => {
    expect(() => playError()).not.toThrow()
  })

  it('playSuccess should not throw', () => {
    expect(() => playSuccess()).not.toThrow()
  })

  it('playCountdown should not throw', () => {
    expect(() => playCountdown()).not.toThrow()
  })

  it('playGameOver should not throw', () => {
    expect(() => playGameOver()).not.toThrow()
  })
})

describe('Audio Plugin (default export)', () => {
  it('should export default audio plugin', () => {
    const audioPlugin = require('@/plugins/audio/index').default
    expect(audioPlugin).toBeDefined()
    expect(audioPlugin.manifest).toBeDefined()
    expect(audioPlugin.manifest.id).toBe('audio')
  })

  it('should have lifecycle methods', () => {
    const audioPlugin = require('@/plugins/audio/index').default
    expect(typeof audioPlugin.onInit).toBe('function')
    expect(typeof audioPlugin.onActivate).toBe('function')
    expect(typeof audioPlugin.onDeactivate).toBe('function')
  })

  it('should have exported public API functions', () => {
    const audioModule = require('@/plugins/audio/index')
    expect(typeof audioModule.playSound).toBe('function')
    expect(typeof audioModule.playMusic).toBe('function')
    expect(typeof audioModule.stopMusic).toBe('function')
    expect(typeof audioModule.setVolume).toBe('function')
  })
})
