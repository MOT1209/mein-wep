// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Letter Challenge
// Draw starting with a specific letter
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const letterChallenge: Challenge = {
  id: 'letter',
  name: 'Letter Challenge',
  description: 'Your drawing must start with the specified letter! Plan your strokes carefully.',
  icon: '📝',
  category: 'creative',
  difficulty: 2,
  bonusPoints: 15,
  
  apply: (context: ChallengeContext) => {
    // Pick a random letter if none specified
    const letter = context.currentLetter || LETTERS[Math.floor(Math.random() * LETTERS.length)]
    
    return {
      currentLetter: letter,
    }
  },
  
  check: ({ context, state }: { context: ChallengeContext; state: ChallengeState }) => {
    // This challenge requires player acknowledgment
    // In practice, the "check" is handled by the game UI showing the letter
    // and the player confirming they followed it
    return state.isActive
  },
  
  getHints: () => [
    'Plan your first stroke before starting',
    'Letters like A, E, F make good starting shapes',
    'Think about how the letter connects to your drawing',
  ],
  
  canApply: (context: ChallengeContext) => {
    // Letter challenge can be applied to any word
    return true
  },
}

export default letterChallenge
