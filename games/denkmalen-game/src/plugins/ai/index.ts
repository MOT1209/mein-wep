// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — AI Plugin
// AI judge, word generation, and hint system
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin, PluginContext } from '@/plugin-system/base'
import { evaluateDrawing, evaluateDrawings, calculateFinalScoreWithBreakdown } from './evaluator'
import { generateWord, generateWords } from './generator'
import { getHint, getHints } from './hints'
import type { AIEvaluation, DrawingToEvaluate } from './evaluator'
import type { WordCategory } from './generator'
import type { Hint } from './hints'

// Re-export types for convenience
export type { AIEvaluation, DrawingToEvaluate } from './evaluator'
export type { WordCategory } from './generator'
export type { Hint } from './hints'

export interface AIPluginConfig {
  enabled: boolean
  /** API endpoint for Gemini calls (server-side proxy) */
  apiEndpoint?: string
  /** Enable mock fallback when API is unavailable */
  mockFallback: boolean
  /** Max concurrent evaluations */
  maxConcurrent: number
  /** Request timeout in ms */
  requestTimeout: number
}

/**
 * AI Plugin — handles drawing evaluation, word generation, and hints.
 * 
 * Listens to game events and exposes AI-powered functions for the core game.
 * Falls back to mock data when the Gemini API is unavailable.
 */
const AIPlugin = createPlugin<AIPluginConfig>(
  {
    id: 'ai',
    name: 'AI Judge',
    version: '1.0.0',
    description: 'AI-powered drawing evaluation, word generation, and hint system',
    author: 'Sketch Battle Team',
    optional: true,
  },
  (ctx: PluginContext, config: AIPluginConfig) => {
    // Merge defaults
    config.mockFallback = config.mockFallback ?? true
    config.maxConcurrent = config.maxConcurrent ?? 3
    config.requestTimeout = config.requestTimeout ?? 30000

    let isInitialized = false

    /**
     * Handle drawing saves — trigger AI evaluation
     */
    async function onDrawingSave(data: unknown): Promise<void> {
      if (!config.enabled) return

      const drawing = data as DrawingToEvaluate
      if (!drawing?.id || !drawing?.drawingData) return

      try {
        const evaluation = await evaluateDrawing(drawing)
        ctx.emit('ai:evaluation:complete', drawing.id, evaluation)
      } catch (err) {
        console.error('[AI Plugin] Evaluation error:', err)
        ctx.emit('ai:evaluation:error', drawing.id, err)
      }
    }

    return {
      onInit: async () => {
        if (isInitialized) return
        isInitialized = true
        console.log(`[AI Plugin] Initialized (v${AIPlugin.manifest.version})`)
      },

      onActivate: async () => {
        // Register event listeners
        ctx.on('game:drawing:save', onDrawingSave)
        console.log('[AI Plugin] Activated — listening to game:drawing:save')
      },

      onDeactivate: async () => {
        ctx.off('game:drawing:save', onDrawingSave)
        console.log('[AI Plugin] Deactivated')
      },

      onDestroy: async () => {
        isInitialized = false
        console.log('[AI Plugin] Destroyed')
      },
    }
  }
)

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Evaluate a single drawing against a target word.
 */
export async function evaluateDrawingPublic(drawing: DrawingToEvaluate): Promise<AIEvaluation> {
  return evaluateDrawing(drawing)
}

/**
 * Evaluate multiple drawings concurrently.
 */
export async function evaluateDrawingsPublic(
  drawings: DrawingToEvaluate[]
): Promise<Map<string, AIEvaluation>> {
  return evaluateDrawings(drawings)
}

/**
 * Calculate final score combining votes (70%) and AI score (30%).
 */
export function calculateFinalScore(
  voteScore: number,
  aiScore: number
): { finalScore: number; breakdown: { votes: number; ai: number } } {
  return calculateFinalScoreWithBreakdown(voteScore, aiScore)
}

/**
 * Generate a random word/prompt for a drawing round.
 */
export async function generateWordPublic(
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<string> {
  return generateWord(category, difficulty)
}

/**
 * Generate multiple unique words.
 */
export async function generateWordsPublic(
  count: number,
  category?: WordCategory,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<string[]> {
  return generateWords(count, category, difficulty)
}

/**
 * Get a contextual hint for the current word.
 */
export async function getHintPublic(
  word: string,
  hintLevel?: number
): Promise<Hint> {
  return getHint(word, hintLevel)
}

/**
 * Get multiple progressive hints.
 */
export async function getHintsPublic(word: string, count?: number): Promise<Hint[]> {
  return getHints(word, count)
}

/**
 * Get the plugin instance for registration.
 */
export const plugin = AIPlugin.create()
export default plugin
