// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — One Line Challenge
// Draw with a continuous line without lifting the pen
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

export const oneLineChallenge: Challenge = {
  id: 'one-line',
  name: 'One Continuous Line',
  description: 'Draw your entire picture without lifting the pen! One continuous line only.',
  icon: '〰️',
  category: 'creative',
  difficulty: 4,
  bonusPoints: 25,
  
  apply: (_context: ChallengeContext) => {
    // No context changes needed - this is a rule-based challenge
    return null
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // The challenge completion is tracked by the canvas component
    // Canvas will track if pen was lifted during drawing
    return state.isActive
  },
  
  getHints: () => [
    'Plan your path before you start drawing',
    'Use loops and curves to revisit areas',
    'Overlapping lines add detail without lifting',
    'Start from the outside and work inward',
    'Practice famous one-line art for inspiration',
  ],
  
  canApply: (_context: ChallengeContext) => {
    // One line challenge can be applied to any word
    return true
  },
}

export default oneLineChallenge
