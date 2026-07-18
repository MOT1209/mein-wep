// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — No Eraser Challenge
// Draw without using the eraser tool
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

export const noEraserChallenge: Challenge = {
  id: 'no-eraser',
  name: 'No Eraser Allowed',
  description: 'Once you make a mark, it stays! No erasing allowed in this challenge.',
  icon: '🚫',
  category: 'restrictive',
  difficulty: 3,
  bonusPoints: 15,
  
  apply: (_context: ChallengeContext) => {
    // Signal to disable eraser tool
    return {
      currentTool: 'brush', // Force brush tool
    }
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // Challenge completion is tracked by canvas component
    // Canvas will prevent eraser tool usage when challenge is active
    return state.isActive
  },
  
  getHints: () => [
    'Take your time before making each stroke',
    'Use lighter colors that blend well',
    'Mistakes can become happy accidents!',
    'Think of Bob Ross - "We don\'t make mistakes, just happy little accidents"',
    'Plan your layers from light to dark',
  ],
  
  canApply: (context: ChallengeContext) => {
    // Can be applied when brush tool is available
    return context.availableColors.length > 0
  },
}

export default noEraserChallenge
