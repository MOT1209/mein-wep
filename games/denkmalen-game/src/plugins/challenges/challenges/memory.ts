// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Memory Challenge
// Reference image hidden after 5 seconds - draw from memory
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

interface MemoryChallengeData {
  /** How long to show the reference (in seconds) */
  previewDuration: number
  /** Whether the word hint remains visible */
  showWordHint: boolean
}

const MEMORY_PRESETS = {
  easy: { previewDuration: 8, showWordHint: true },
  medium: { previewDuration: 5, showWordHint: true },
  hard: { previewDuration: 3, showWordHint: false },
  extreme: { previewDuration: 1, showWordHint: false },
}

type MemoryPreset = keyof typeof MEMORY_PRESETS

export const memoryChallenge: Challenge = {
  id: 'memory',
  name: 'Photographic Memory',
  description: 'Study the reference carefully - it disappears after a few seconds! Draw from memory.',
  icon: '🧠',
  category: 'difficulty',
  difficulty: 3,
  bonusPoints: 20,
  
  apply: (_context: ChallengeContext) => {
    // Pick a random memory preset
    const presets = Object.keys(MEMORY_PRESETS) as MemoryPreset[]
    const preset = presets[Math.floor(Math.random() * presets.length)]
    const config = MEMORY_PRESETS[preset]
    
    // Return challenge data to be stored in state
    return {
      // Custom data is stored in the challenge state
    }
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // Memory challenge completion is tracked by the timer system
    // Reference is hidden after the duration, then player draws
    return state.isActive
  },
  
  getHints: () => [
    'Focus on the main shapes and proportions',
    'Try to remember relative positions',
    'Colors can be approximate',
    'Mental snapshots work better than trying to memorize details',
    'Glance at the word hint periodically',
  ],
  
  canApply: (context: ChallengeContext) => {
    // Memory challenge works best with visual reference words
    return true
  },
}

/** Get random memory configuration for use in the game */
export function getRandomMemoryConfig(): MemoryChallengeData {
  const presets = Object.keys(MEMORY_PRESETS) as MemoryPreset[]
  const preset = presets[Math.floor(Math.random() * presets.length)]
  return MEMORY_PRESETS[preset]
}

export default memoryChallenge
