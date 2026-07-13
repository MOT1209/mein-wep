// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Speed Challenge
// Very short timer - quick drawing required
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

const SPEED_MODES = {
  turbo: { time: 15, name: 'Turbo', bonus: 30 },
  blitz: { time: 20, name: 'Blitz', bonus: 25 },
  rush: { time: 25, name: 'Rush', bonus: 20 },
}

type SpeedMode = keyof typeof SPEED_MODES

export const speedChallenge: Challenge = {
  id: 'speed',
  name: 'Speed Draw',
  description: 'You only have seconds to draw! Think fast and draw faster!',
  icon: '⚡',
  category: 'difficulty',
  difficulty: 4,
  bonusPoints: 25,
  
  apply: (context: ChallengeContext) => {
    // Pick a random speed mode
    const modes = Object.keys(SPEED_MODES) as SpeedMode[]
    const mode = modes[Math.floor(Math.random() * modes.length)]
    const config = SPEED_MODES[mode]
    
    return {
      drawingTime: config.time,
    }
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // Speed challenge completion is simply surviving the timer
    return state.isActive
  },
  
  getHints: () => [
    'Focus on simple shapes and outlines',
    'Color fills can be quick with the bucket tool',
    'Less detail, more recognizable shapes',
    'Speed over perfection!',
    'Draw the essence, not the details',
  ],
  
  canApply: (context: ChallengeContext) => {
    // Speed challenge makes sense with any time > 15 seconds
    return context.drawingTime > 15
  },
}

export default speedChallenge
