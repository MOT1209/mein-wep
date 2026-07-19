// ═══════════════════════════════════════════════════════════════════════════════
// Test: Challenges Plugin — Registry, challenges, plugin lifecycle
// ═══════════════════════════════════════════════════════════════════════════════

import { challengeRegistry } from '@/plugins/challenges/registry'
import {
  getChallenge,
  getAllChallenges,
  getChallengesByCategory,
  applyChallenge,
  checkChallenge,
  getRandomChallenge,
  getChallengeSummary,
  getChallengeHints,
  getRandomMemoryConfig,
  getRandomAIWord,
  getAIWords,
  getRandomFunnyPrompts,
} from '@/plugins/challenges/index'
import { Challenge, ChallengeContext, ChallengeState } from '@/plugins/challenges/types'
import letterChallenge from '@/plugins/challenges/challenges/letter'
import oneColorChallenge from '@/plugins/challenges/challenges/one-color'
import oneLineChallenge from '@/plugins/challenges/challenges/one-line'
import noEraserChallenge from '@/plugins/challenges/challenges/no-eraser'
import speedChallenge from '@/plugins/challenges/challenges/speed'
import memoryChallenge from '@/plugins/challenges/challenges/memory'
import aiChallenge from '@/plugins/challenges/challenges/ai'
import funnyChallenge from '@/plugins/challenges/challenges/funny'

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      mode: 'offline',
      phase: 'menu',
      settings: { sound: true, vibration: true, language: 'en' },
      players: [],
      currentRound: 1,
      totalRounds: 3,
      votes: [],
      aiEvaluations: {},
    })),
    setState: jest.fn(),
    subscribe: jest.fn(),
  },
}))

// Suppress console.log during tests
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

const defaultContext: ChallengeContext = {
  gamePhase: 'drawing',
  currentWord: 'cat',
  drawingTime: 60,
  availableColors: ['#000000', '#FF0000', '#0000FF', '#00FF00'],
  currentTool: 'brush',
  currentColor: '#000000',
}

describe('Challenges Plugin', () => {
  beforeEach(() => {
    // Clear all registered challenges
    challengeRegistry.getAll().forEach(c => challengeRegistry.unregister(c.id))
  })

  describe('ChallengeRegistry', () => {
    it('should register a challenge', () => {
      challengeRegistry.register(letterChallenge)
      expect(challengeRegistry.get('letter')).toBe(letterChallenge)
    })

    it('should unregister a challenge', () => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.unregister('letter')
      expect(challengeRegistry.get('letter')).toBeUndefined()
    })

    it('should get all challenges', () => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.register(speedChallenge)
      expect(challengeRegistry.getAll()).toHaveLength(2)
    })

    it('should get challenges by category', () => {
      challengeRegistry.register(letterChallenge)    // creative
      challengeRegistry.register(oneColorChallenge)   // restrictive
      challengeRegistry.register(speedChallenge)      // difficulty
      challengeRegistry.register(funnyChallenge)      // fun

      expect(challengeRegistry.getByCategory('creative')).toHaveLength(1)
      expect(challengeRegistry.getByCategory('restrictive')).toHaveLength(1)
      expect(challengeRegistry.getByCategory('difficulty')).toHaveLength(1)
      expect(challengeRegistry.getByCategory('fun')).toHaveLength(1)
    })

    it('should get available challenges', () => {
      challengeRegistry.register(letterChallenge)
      const available = challengeRegistry.getAvailable(defaultContext)
      expect(available.length).toBeGreaterThanOrEqual(1)
    })

    it('should get random challenge', () => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.register(speedChallenge)
      const random = challengeRegistry.getRandom(defaultContext)
      expect(random).not.toBeNull()
      expect(['letter', 'speed']).toContain(random!.id)
    })

    it('should return null for random when no challenges available', () => {
      const random = challengeRegistry.getRandom(defaultContext)
      expect(random).toBeNull()
    })

    it('should get challenges by difficulty', () => {
      challengeRegistry.register(letterChallenge)  // difficulty 2
      challengeRegistry.register(speedChallenge)    // difficulty 4

      expect(challengeRegistry.getByDifficulty(3)).toHaveLength(1)
      expect(challengeRegistry.getByDifficulty(5)).toHaveLength(2)
    })

    it('should apply a challenge', () => {
      challengeRegistry.register(letterChallenge)
      const result = challengeRegistry.applyChallenge('letter', defaultContext)
      expect(result).not.toBeNull()
    })

    it('should return null when applying non-existent challenge', () => {
      const result = challengeRegistry.applyChallenge('nonexistent' as any, defaultContext)
      expect(result).toBeNull()
    })

    it('should check a challenge', async () => {
      challengeRegistry.register(letterChallenge)
      const state: ChallengeState = { isActive: true }
      const result = await challengeRegistry.checkChallenge('letter', {
        context: defaultContext,
        state,
      })
      expect(result).toBe(true)
    })

    it('should return false for non-existent challenge check', async () => {
      const state: ChallengeState = { isActive: true }
      const result = await challengeRegistry.checkChallenge('nonexistent' as any, {
        context: defaultContext,
        state,
      })
      expect(result).toBe(false)
    })

    it('should get hints for a challenge', () => {
      challengeRegistry.register(letterChallenge)
      const hints = challengeRegistry.getHints('letter')
      expect(hints.length).toBeGreaterThan(0)
    })

    it('should return empty hints for non-existent challenge', () => {
      const hints = challengeRegistry.getHints('nonexistent' as any)
      expect(hints).toHaveLength(0)
    })

    it('should get summary', () => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.register(speedChallenge)
      const summary = challengeRegistry.getSummary()
      expect(summary).toHaveLength(2)
      expect(summary[0]).toHaveProperty('id')
      expect(summary[0]).toHaveProperty('name')
      expect(summary[0]).toHaveProperty('icon')
      expect(summary[0]).toHaveProperty('category')
      expect(summary[0]).toHaveProperty('difficulty')
      expect(summary[0]).toHaveProperty('bonusPoints')
    })

    it('should handle duplicate registration', () => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.register(letterChallenge) // replace
      expect(challengeRegistry.getAll()).toHaveLength(1)
    })
  })

  describe('Individual Challenges', () => {
    describe('Letter Challenge', () => {
      it('should have correct properties', () => {
        expect(letterChallenge.id).toBe('letter')
        expect(letterChallenge.name).toBe('Letter Challenge')
        expect(letterChallenge.category).toBe('creative')
        expect(letterChallenge.difficulty).toBe(2)
        expect(letterChallenge.bonusPoints).toBe(15)
      })

      it('should apply and return letter', () => {
        const result = letterChallenge.apply(defaultContext)
        expect(result).toHaveProperty('currentLetter')
      })

      it('should check correctly', () => {
        const state: ChallengeState = { isActive: true }
        expect(letterChallenge.check({ context: defaultContext, state })).toBe(true)
      })

      it('should provide hints', () => {
        expect(letterChallenge.getHints!().length).toBeGreaterThan(0)
      })

      it('should be applicable', () => {
        expect(letterChallenge.canApply!(defaultContext)).toBe(true)
      })
    })

    describe('One Color Challenge', () => {
      it('should have correct properties', () => {
        expect(oneColorChallenge.id).toBe('one-color')
        expect(oneColorChallenge.category).toBe('restrictive')
      })

      it('should apply and return color', () => {
        const result = oneColorChallenge.apply(defaultContext)
        expect(result).toHaveProperty('currentColor')
      })

      it('should not be applicable with empty colors', () => {
        expect(oneColorChallenge.canApply!({ ...defaultContext, availableColors: [] })).toBe(false)
      })
    })

    describe('One Line Challenge', () => {
      it('should have correct properties', () => {
        expect(oneLineChallenge.id).toBe('one-line')
        expect(oneLineChallenge.category).toBe('creative')
        expect(oneLineChallenge.difficulty).toBe(4)
      })

      it('should apply with null (no context changes)', () => {
        expect(oneLineChallenge.apply(defaultContext)).toBeNull()
      })

      it('should provide hints', () => {
        expect(oneLineChallenge.getHints!().length).toBeGreaterThan(0)
      })
    })

    describe('No Eraser Challenge', () => {
      it('should have correct properties', () => {
        expect(noEraserChallenge.id).toBe('no-eraser')
        expect(noEraserChallenge.category).toBe('restrictive')
      })

      it('should apply and force brush tool', () => {
        const result = noEraserChallenge.apply(defaultContext)
        expect(result).toEqual({ currentTool: 'brush' })
      })
    })

    describe('Speed Challenge', () => {
      it('should have correct properties', () => {
        expect(speedChallenge.id).toBe('speed')
        expect(speedChallenge.difficulty).toBe(4)
      })

      it('should apply and set shorter drawing time', () => {
        const result = speedChallenge.apply(defaultContext)
        expect(result).toHaveProperty('drawingTime')
      })

      it('should not apply when time is too short', () => {
        expect(speedChallenge.canApply!({ ...defaultContext, drawingTime: 10 })).toBe(false)
      })

      it('should apply when time is sufficient', () => {
        expect(speedChallenge.canApply!({ ...defaultContext, drawingTime: 30 })).toBe(true)
      })
    })

    describe('Memory Challenge', () => {
      it('should have correct properties', () => {
        expect(memoryChallenge.id).toBe('memory')
        expect(memoryChallenge.difficulty).toBe(3)
      })

      it('should provide hints', () => {
        expect(memoryChallenge.getHints!().length).toBeGreaterThan(0)
      })
    })

    describe('AI Challenge', () => {
      it('should have correct properties', () => {
        expect(aiChallenge.id).toBe('ai')
        expect(aiChallenge.difficulty).toBe(3)
      })

      it('should apply with null', () => {
        expect(aiChallenge.apply(defaultContext)).toBeNull()
      })

      it('should provide hints', () => {
        expect(aiChallenge.getHints!().length).toBeGreaterThan(0)
      })
    })

    describe('Funny Challenge', () => {
      it('should have correct properties', () => {
        expect(funnyChallenge.id).toBe('funny')
        expect(funnyChallenge.category).toBe('fun')
        expect(funnyChallenge.difficulty).toBe(1)
      })

      it('should apply and return word', () => {
        const result = funnyChallenge.apply(defaultContext)
        expect(result).toHaveProperty('currentWord')
      })
    })
  })

  describe('Exported helper functions', () => {
    beforeEach(() => {
      challengeRegistry.register(letterChallenge)
      challengeRegistry.register(speedChallenge)
      challengeRegistry.register(oneColorChallenge)
      challengeRegistry.register(noEraserChallenge)
      challengeRegistry.register(oneLineChallenge)
      challengeRegistry.register(memoryChallenge)
      challengeRegistry.register(aiChallenge)
      challengeRegistry.register(funnyChallenge)
    })

    it('getChallenge returns a challenge', () => {
      expect(getChallenge('letter')).toBe(letterChallenge)
    })

    it('getAllChallenges returns all', () => {
      expect(getAllChallenges()).toHaveLength(8)
    })

    it('getChallengesByCategory filters', () => {
      expect(getChallengesByCategory('creative')).toHaveLength(2) // letter + one-line
      expect(getChallengesByCategory('fun')).toHaveLength(1)      // funny
    })

    it('applyChallenge works', () => {
      const result = applyChallenge('letter', defaultContext)
      expect(result).toHaveProperty('currentLetter')
    })

    it('checkChallenge works', async () => {
      const result = await checkChallenge('letter', {
        context: defaultContext,
        state: { isActive: true },
      })
      expect(result).toBe(true)
    })

    it('getRandomChallenge returns a challenge', () => {
      const result = getRandomChallenge(defaultContext)
      expect(result).not.toBeNull()
    })

    it('getChallengeSummary returns summary', () => {
      const summary = getChallengeSummary()
      expect(summary.length).toBeGreaterThan(0)
    })

    it('getChallengeHints returns hints', () => {
      const hints = getChallengeHints('letter')
      expect(hints.length).toBeGreaterThan(0)
    })
  })

  describe('Challenge sub-module exports', () => {
    it('getRandomMemoryConfig returns config', () => {
      const config = getRandomMemoryConfig()
      expect(config).toHaveProperty('previewDuration')
      expect(config).toHaveProperty('showWordHint')
    })

    it('getRandomAIWord returns word object', () => {
      const word = getRandomAIWord()
      expect(word).toHaveProperty('word')
      expect(word).toHaveProperty('emoji')
      expect(word).toHaveProperty('category')
    })

    it('getAIWords returns all words', () => {
      const words = getAIWords()
      expect(words.length).toBeGreaterThan(0)
    })

    it('getAIWords filters by category', () => {
      const words = getAIWords('animals')
      expect(words.length).toBeGreaterThan(0)
      words.forEach(w => expect(w.category).toBe('animals'))
    })

    it('getRandomFunnyPrompts returns prompts', () => {
      const prompts = getRandomFunnyPrompts(3)
      expect(prompts).toHaveLength(3)
      prompts.forEach(p => {
        expect(p).toHaveProperty('word')
        expect(p).toHaveProperty('emoji')
      })
    })

    it('getRandomFunnyPrompts respects count', () => {
      const prompts = getRandomFunnyPrompts(1)
      expect(prompts.length).toBe(1)
    })
  })
})
