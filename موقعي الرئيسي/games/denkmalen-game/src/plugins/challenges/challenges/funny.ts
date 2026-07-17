// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Funny Challenge
// Silly and absurd prompts for laughs
// ═══════════════════════════════════════════════════════════════════════════════

import { Challenge, ChallengeContext, ChallengeState } from '../types'

const FUNNY_PROMPTS = [
  { word: 'Cat riding a unicycle', emoji: '🐱🎪', category: 'animals' as const },
  { word: 'Penguin DJ', emoji: '🐧🎧', category: 'animals' as const },
  { word: 'Pig flying', emoji: '🐷✈️', category: 'animals' as const },
  { word: 'Dog wearing sunglasses', emoji: '🐶😎', category: 'animals' as const },
  { word: 'Banana phone', emoji: '🍌📞', category: 'food' as const },
  { word: 'Dancing broccoli', emoji: '🥦💃', category: 'food' as const },
  { word: 'Pizza superhero', emoji: '🍕🦸', category: 'food' as const },
  { word: 'Toilet winning Olympics', emoji: '🏆🚽', category: 'objects' as const },
  { word: 'Fridge disco', emoji: '🕺🧊', category: 'objects' as const },
  { word: 'Alien doing laundry', emoji: '👽🧺', category: 'fantasy' as const },
  { word: 'Ghost eating ice cream', emoji: '👻🍦', category: 'fantasy' as const },
  { word: 'Ninja shopping', emoji: '🥷🛒', category: 'jobs' as const },
  { word: 'Robot doing yoga', emoji: '🤖🧘', category: 'technology' as const },
  { word: 'Moon sleeping', emoji: '🌙😴', category: 'nature' as const },
  { word: 'Rocket surfing', emoji: '🚀🏄', category: 'space' as const },
  { word: 'Dinosaur cooking', emoji: '🦕🍳', category: 'history' as const },
]

export const funnyChallenge: Challenge = {
  id: 'funny',
  name: 'Funny Business',
  description: 'Get ready to laugh! Draw these ridiculous prompts and let the comedy flow!',
  icon: '😂',
  category: 'fun',
  difficulty: 1,
  bonusPoints: 10,
  
  apply: (context: ChallengeContext) => {
    // Pick a random funny prompt
    const prompt = FUNNY_PROMPTS[Math.floor(Math.random() * FUNNY_PROMPTS.length)]
    
    // Return the word to be used
    return {
      currentWord: prompt.word,
    }
  },
  
  check: ({ state }: { state: ChallengeState }) => {
    // Funny challenge is simply completing the round
    // Laughter is the real reward!
    return state.isActive
  },
  
  getHints: () => [
    'Exaggeration is your friend!',
    'The funnier, the better',
    'Don\'t take it too seriously - have fun!',
    'Silly details make the best punchlines',
    'Think "meme" energy',
  ],
  
  canApply: (_context: ChallengeContext) => {
    // Funny challenge can always be applied
    return true
  },
}

/** Get random funny prompts */
export function getRandomFunnyPrompts(count: number = 5) {
  const shuffled = [...FUNNY_PROMPTS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default funnyChallenge
