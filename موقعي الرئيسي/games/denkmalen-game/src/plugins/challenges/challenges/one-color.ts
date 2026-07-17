// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — One Color Challenge
// Use only one color for the entire drawing
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

const POPULAR_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
]

export const oneColorChallenge: Challenge = {
  id: 'one-color',
  name: 'One Color Only',
  description: 'Complete your entire drawing using only one color! No switching allowed.',
  icon: '🎨',
  category: 'restrictive',
  difficulty: 3,
  bonusPoints: 20,
  
  apply: (context: ChallengeContext) => {
    // Pick a random color or use current
    const color = context.currentColor || 
      POPULAR_COLORS[Math.floor(Math.random() * POPULAR_COLORS.length)].hex
    
    return {
      currentColor: color,
    }
  },
  
  check: ({ context, state }: { context: ChallengeContext; state: ChallengeState }) => {
    // The challenge is considered complete if player acknowledged the rule
    // Actual color usage tracking would be done by the canvas component
    return state.isActive
  },
  
  getHints: () => [
    'Use varying pressure and stroke width for depth',
    'Negative space becomes your second "color"',
    'Cross-hatching can create the illusion of shading',
    'Choose a color that contrasts well with the background',
  ],
  
  canApply: (context: ChallengeContext) => {
    // Can be applied as long as there are colors available
    return context.availableColors.length > 0
  },
}

export default oneColorChallenge
