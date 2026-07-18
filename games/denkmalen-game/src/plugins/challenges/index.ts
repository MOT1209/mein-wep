// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Challenges Plugin
// Game challenges that modify rules and add variety
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'
import { challengeRegistry } from './registry'
import { Challenge, ChallengeID, ChallengeContext, ChallengeState, ChallengeResult } from './types'

// Import all challenges
import letterChallenge from './challenges/letter'
import oneColorChallenge from './challenges/one-color'
import oneLineChallenge from './challenges/one-line'
import noEraserChallenge from './challenges/no-eraser'
import speedChallenge from './challenges/speed'
import memoryChallenge from './challenges/memory'
import aiChallenge from './challenges/ai'
import funnyChallenge from './challenges/funny'

// ─── Plugin Configuration ─────────────────────────────────────────────────

interface ChallengesConfig {
  enabled?: boolean
  /** Enable random challenges each round */
  autoRandom?: boolean
  /** Chance of random challenge (0-1) */
  randomChance?: number
  /** Default difficulty level */
  defaultDifficulty?: number
  /** Allow multiple challenges per round */
  allowMultiple?: boolean
  [key: string]: unknown
}

// ─── Create Plugin ────────────────────────────────────────────────────────

const challengesPlugin = createPlugin<ChallengesConfig>(
  {
    id: 'challenges',
    name: 'Game Challenges',
    version: '1.0.0',
    description: 'Add exciting challenges to your drawing rounds! Each challenge modifies the game rules for extra fun and bonus points.',
    author: 'Sketch Battle Team',
    dependencies: [],
    optional: true,
  },
  (ctx, config) => {
    // Set default config values
    config.autoRandom = true
    config.randomChance = 0.3
    config.defaultDifficulty = 2
    config.allowMultiple = false

    // Event handlers defined within scope
    function handleRoundStart(context: unknown) {
      const gameContext = context as ChallengeContext
      
      if (config.autoRandom && Math.random() < (config.randomChance ?? 0.3)) {
        const challenge = challengeRegistry.getRandom(gameContext)
        if (challenge) {
          ctx.emit('challenges:activated', challenge.id)
        }
      }
    }

    function handleRoundEnd(data: unknown) {
      const result = data as { challengeId?: ChallengeID }
      if (result.challengeId) {
        ctx.emit('challenges:completed', result.challengeId)
      }
    }

    return {
      onInit: () => {
        console.log('[ChallengesPlugin] Initializing...')
        
        // Register all challenges
        challengeRegistry.register(letterChallenge)
        challengeRegistry.register(oneColorChallenge)
        challengeRegistry.register(oneLineChallenge)
        challengeRegistry.register(noEraserChallenge)
        challengeRegistry.register(speedChallenge)
        challengeRegistry.register(memoryChallenge)
        challengeRegistry.register(aiChallenge)
        challengeRegistry.register(funnyChallenge)
        
        console.log(`[ChallengesPlugin] Registered ${challengeRegistry.getAll().length} challenges`)
      },
      
      onActivate: () => {
        console.log('[ChallengesPlugin] Activated')
        
        // Listen for game events
        ctx.on('game:round:start', handleRoundStart)
        ctx.on('game:round:end', handleRoundEnd)
      },
      
      onDeactivate: () => {
        console.log('[ChallengesPlugin] Deactivated')
        
        // Remove event listeners
        ctx.off('game:round:start', handleRoundStart)
        ctx.off('game:round:end', handleRoundEnd)
      },
      
      onDestroy: () => {
        console.log('[ChallengesPlugin] Destroyed')
        // Unregister all challenges
        challengeRegistry.getAll().forEach(challenge => {
          challengeRegistry.unregister(challenge.id)
        })
      },
    }
  }
)

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Get a specific challenge by ID
 */
export function getChallenge(id: ChallengeID): Challenge | undefined {
  return challengeRegistry.get(id)
}

/**
 * Get all registered challenges
 */
export function getAllChallenges(): Challenge[] {
  return challengeRegistry.getAll()
}

/**
 * Get challenges by category
 */
export function getChallengesByCategory(
  category: 'creative' | 'restrictive' | 'difficulty' | 'fun'
): Challenge[] {
  return challengeRegistry.getByCategory(category)
}

/**
 * Apply a challenge to the current game context
 */
export function applyChallenge(
  id: ChallengeID, 
  context: ChallengeContext
): Partial<ChallengeContext> | null {
  return challengeRegistry.applyChallenge(id, context)
}

/**
 * Check if a challenge was completed
 */
export async function checkChallenge(
  id: ChallengeID,
  data: {
    drawingData?: string
    context: ChallengeContext
    state: ChallengeState
  }
): Promise<boolean> {
  return challengeRegistry.checkChallenge(id, data)
}

/**
 * Get a random challenge suitable for the context
 */
export function getRandomChallenge(context: ChallengeContext): Challenge | null {
  return challengeRegistry.getRandom(context)
}

/**
 * Get challenge summary for UI display
 */
export function getChallengeSummary() {
  return challengeRegistry.getSummary()
}

/**
 * Get hints for a specific challenge
 */
export function getChallengeHints(id: ChallengeID): string[] {
  return challengeRegistry.getHints(id)
}

// ─── Re-export Types and Utilities ────────────────────────────────────────

export type { Challenge, ChallengeID, ChallengeContext, ChallengeState, ChallengeResult }

export { challengeRegistry } from './registry'
export { getRandomMemoryConfig } from './challenges/memory'
export { getRandomAIWord, getAIWords } from './challenges/ai'
export { getRandomFunnyPrompts } from './challenges/funny'

// ─── Default Export ───────────────────────────────────────────────────────

export default challengesPlugin
