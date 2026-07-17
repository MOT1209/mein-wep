// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — AI Challenge
// AI picks difficult or obscure words to draw
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

/** Difficult words that AI might suggest */
const AI_DIFFICULT_WORDS = [
  // Abstract concepts
  { word: 'Nostalgia', emoji: '💭', category: 'random' as const },
  { word: 'Paradox', emoji: '🔄', category: 'random' as const },
  { word: 'Gravity', emoji: '🍎', category: 'random' as const },
  { word: 'Echo', emoji: '🔊', category: 'random' as const },
  
  // Complex objects
  { word: 'Sundial', emoji: '⏰', category: 'objects' as const },
  { word: 'Astronomy', emoji: '🔭', category: 'space' as const },
  { word: 'Chameleon', emoji: '🦎', category: 'animals' as const },
  { word: 'Spiral', emoji: '🌀', category: 'nature' as const },
  
  // Tricky concepts
  { word: 'Invisible', emoji: '👻', category: 'fantasy' as const },
  { word: 'Silence', emoji: '🤫', category: 'random' as const },
  { word: 'Dream', emoji: '💤', category: 'fantasy' as const },
  { word: 'Velocity', emoji: '💨', category: 'technology' as const },
]

export const aiChallenge: Challenge = {
  id: 'ai',
  name: 'AI Brain Teaser',
  description: 'The AI picks a tricky word that will test your drawing skills!',
  icon: '🤖',
  category: 'difficulty',
  difficulty: 3,
  bonusPoints: 20,
  
  apply: (context: ChallengeContext) => {
    // In real implementation, this would call the AI service
    // For now, we return null and let the word selection system handle it
    return null
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // AI challenge is simply completing the round with the AI-chosen word
    return state.isActive
  },
  
  getHints: () => [
    'Abstract concepts need creative interpretation',
    'Focus on what the word FEELS like, not just looks like',
    'Use symbols and metaphors',
    'Multiple small elements can convey big ideas',
    'When in doubt, keep it simple and iconic',
  ],
  
  canApply: (_context: ChallengeContext) => {
    // AI challenge can always be applied
    return true
  },
}

/** Get AI-suggested words for a given category */
export function getAIWords(category?: string) {
  if (category) {
    return AI_DIFFICULT_WORDS.filter(w => w.category === category)
  }
  return [...AI_DIFFICULT_WORDS]
}

/** Get a random AI word */
export function getRandomAIWord() {
  return AI_DIFFICULT_WORDS[Math.floor(Math.random() * AI_DIFFICULT_WORDS.length)]
}

export default aiChallenge
