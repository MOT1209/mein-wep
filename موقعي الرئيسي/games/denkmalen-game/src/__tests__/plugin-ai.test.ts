// ═══════════════════════════════════════════════════════════════════════════════
// Test: AI Plugin — Evaluator, Generator, Hints
// ═══════════════════════════════════════════════════════════════════════════════

import {
  evaluateDrawing,
  evaluateDrawings,
  calculateFinalScoreWithBreakdown,
} from '@/plugins/ai/evaluator'

import {
  generateWord,
  generateWords,
  getCategories,
} from '@/plugins/ai/generator'

import {
  getHint,
  getHints,
  getMaxHints,
  calculateHintCost,
} from '@/plugins/ai/hints'

import type { DrawingToEvaluate } from '@/plugins/ai/evaluator'
import type { Hint } from '@/plugins/ai/hints'

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      settings: { sound: true, music: true },
    })),
  },
}))

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

const mockDrawing: DrawingToEvaluate = {
  id: 'test-drawing-1',
  word: 'cat',
  drawingData: 'data:image/png;base64,fakedata',
  category: 'animals',
  drawingTime: 60,
}

// ─── Mock fetch ─────────────────────────────────────────────────────────────

let mockFetchFn: jest.Mock

beforeEach(() => {
  mockFetchFn = jest.fn()
  global.fetch = mockFetchFn as any
  jest.useFakeTimers({ advanceTimers: true })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('AI Evaluator', () => {
  describe('evaluateDrawing', () => {
    it('should return evaluation from API on success', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 85,
          accuracy: 80,
          creativity: 90,
          clarity: 85,
          comment: 'Great cat drawing!',
        }),
      })

      const result = await evaluateDrawing(mockDrawing)
      expect(result.score).toBe(85)
      expect(result.accuracy).toBe(80)
      expect(result.creativity).toBe(90)
      expect(result.clarity).toBe(85)
      expect(result.comment).toBe('Great cat drawing!')
    })

    it('should clamp scores to 0-100', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 150,
          accuracy: -10,
          creativity: 200,
          clarity: 50,
          comment: 'Nice!',
        }),
      })

      const result = await evaluateDrawing(mockDrawing)
      expect(result.score).toBe(100)
      expect(result.accuracy).toBe(0)
      expect(result.creativity).toBe(100)
      expect(result.clarity).toBe(50)
    })

    it('should fall back to mock evaluation on API failure', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Network error'))

      const result = await evaluateDrawing(mockDrawing)
      expect(result.score).toBeGreaterThanOrEqual(60)
      expect(result.score).toBeLessThanOrEqual(80)
      expect(result.comment).toBeTruthy()
    })

    it('should fall back on 500 error after retries', async () => {
      mockFetchFn.mockRejectedValue(new Error('Server error'))

      const result = await evaluateDrawing(mockDrawing)
      // Should return mock evaluation after retries
      expect(result.score).toBeGreaterThanOrEqual(60)
    })

    it('should not retry on 400 client error', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      })

      const result = await evaluateDrawing(mockDrawing)
      // Falls back to mock after client error
      expect(result.score).toBeGreaterThanOrEqual(60)
      expect(mockFetchFn).toHaveBeenCalledTimes(1)
    })

    it('should return mock evaluation with default comment if API returns invalid data', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' }),
      })

      const result = await evaluateDrawing(mockDrawing)
      // Falls back to mock since normalizeEvaluation returns null
      expect(result.score).toBeGreaterThanOrEqual(60)
    })

    it('should return mock on API returning non-object', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })

      const result = await evaluateDrawing(mockDrawing)
      expect(result.score).toBeGreaterThanOrEqual(60)
    })
  })

  describe('evaluateDrawings', () => {
    it('should evaluate multiple drawings', async () => {
      mockFetchFn.mockResolvedValue({
        ok: true,
        json: async () => ({
          score: 75,
          accuracy: 70,
          creativity: 80,
          clarity: 75,
          comment: 'Good!',
        }),
      })

      const drawings: DrawingToEvaluate[] = [
        { ...mockDrawing, id: 'd1' },
        { ...mockDrawing, id: 'd2' },
        { ...mockDrawing, id: 'd3' },
      ]

      const results = await evaluateDrawings(drawings)
      expect(results.size).toBe(3)
      expect(results.has('d1')).toBe(true)
      expect(results.has('d2')).toBe(true)
      expect(results.has('d3')).toBe(true)
    })

    it('should handle empty array', async () => {
      const results = await evaluateDrawings([])
      expect(results.size).toBe(0)
    })

    it('should handle partial failures', async () => {
      mockFetchFn
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            score: 80, accuracy: 80, creativity: 80, clarity: 80, comment: 'Good',
          }),
        })
        .mockRejectedValueOnce(new Error('fail'))

      const drawings: DrawingToEvaluate[] = [
        { ...mockDrawing, id: 'd1' },
        { ...mockDrawing, id: 'd2' },
      ]

      const results = await evaluateDrawings(drawings)
      expect(results.size).toBe(2)
    })
  })

  describe('calculateFinalScoreWithBreakdown', () => {
    it('should calculate 70/30 split', () => {
      const result = calculateFinalScoreWithBreakdown(100, 100)
      expect(result.finalScore).toBe(100)
      expect(result.breakdown.votes).toBe(70)
      expect(result.breakdown.ai).toBe(30)
    })

    it('should clamp vote score to 100', () => {
      const result = calculateFinalScoreWithBreakdown(200, 50)
      expect(result.breakdown.votes).toBe(70) // clamped to 100 * 0.7
    })

    it('should handle zero scores', () => {
      const result = calculateFinalScoreWithBreakdown(0, 0)
      expect(result.finalScore).toBe(0)
    })

    it('should clamp final score to 0-100', () => {
      const result = calculateFinalScoreWithBreakdown(100, 100)
      expect(result.finalScore).toBeLessThanOrEqual(100)
    })

    it('should handle mixed scores', () => {
      const result = calculateFinalScoreWithBreakdown(80, 60)
      expect(result.finalScore).toBe(Math.round(80 * 0.7 + 60 * 0.3))
    })
  })
})

describe('AI Generator', () => {
  describe('generateWord', () => {
    it('should return word from API on success', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ word: 'Elephant' }),
      })

      const word = await generateWord('animals')
      expect(word).toBe('elephant') // lowercased
    })

    it('should fall back to local word bank on API failure', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Network error'))

      const word = await generateWord('animals')
      expect(typeof word).toBe('string')
      expect(word.length).toBeGreaterThan(0)
    })

    it('should fall back on non-ok response', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      const word = await generateWord('food')
      expect(typeof word).toBe('string')
    })

    it('should generate word from local bank if API returns empty', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const word = await generateWord('objects')
      expect(typeof word).toBe('string')
    })
  })

  describe('generateWords', () => {
    it('should return multiple words from API', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: ['cat', 'dog', 'bird'] }),
      })

      const words = await generateWords(3, 'animals')
      expect(words).toHaveLength(3)
    })

    it('should fall back to local word bank on API failure', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('fail'))

      const words = await generateWords(5, 'animals')
      expect(words.length).toBeGreaterThan(0)
      expect(words.length).toBeLessThanOrEqual(5)
    })

    it('should filter non-string words from API', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: ['cat', null, 123, 'dog'] }),
      })

      const words = await generateWords(3, 'animals')
      // Should filter out null and 123
      expect(words.every(w => typeof w === 'string')).toBe(true)
    })

    it('should return empty words if API returns empty array', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ words: [] }),
      })

      const words = await generateWords(3, 'animals')
      // Falls back to local bank
      expect(words.length).toBeGreaterThan(0)
    })
  })

  describe('getCategories', () => {
    it('should return all categories except random', () => {
      const categories = getCategories()
      expect(categories).toContain('animals')
      expect(categories).toContain('food')
      expect(categories).toContain('objects')
      expect(categories).not.toContain('random')
    })
  })
})

describe('AI Hints', () => {
  describe('getHint', () => {
    it('should return hint from API on success', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'Starts with C',
          category: 'letter',
          cost: 5,
        }),
      })

      const hint = await getHint('cat', 1)
      expect(hint.text).toBe('Starts with C')
      expect(hint.level).toBe(1)
    })

    it('should fall back to local hints on API failure', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('fail'))

      const hint = await getHint('cat', 1)
      expect(hint).toHaveProperty('text')
      expect(hint).toHaveProperty('level')
      expect(hint).toHaveProperty('category')
      expect(hint).toHaveProperty('cost')
    })

    it('should clamp level to 1-3', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('fail'))

      const hint1 = await getHint('cat', 0)
      expect(hint1.level).toBe(1)

      const hint2 = await getHint('cat', 10)
      expect(hint2.level).toBe(3)
    })

    it('should fall back when API returns invalid data', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const hint = await getHint('cat', 1)
      expect(hint).toHaveProperty('text')
    })
  })

  describe('getHints', () => {
    it('should return multiple hints from API', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hints: [
            { level: 1, text: 'First letter C', category: 'letter', cost: 5 },
            { level: 2, text: '3 letters', category: 'clue', cost: 10 },
          ],
        }),
      })

      const hints = await getHints('cat', 2)
      expect(hints).toHaveLength(2)
    })

    it('should fall back to local hints on API failure', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('fail'))

      const hints = await getHints('cat', 3)
      expect(hints.length).toBeGreaterThan(0)
      expect(hints.length).toBeLessThanOrEqual(3)
    })

    it('should filter invalid hints from API', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hints: [
            { level: 1, text: 'hint 1', category: 'letter', cost: 5 },
            { invalid: true },
            { level: 2, text: 'hint 2', category: 'clue', cost: 10 },
          ],
        }),
      })

      const hints = await getHints('cat', 3)
      expect(hints).toHaveLength(2)
    })
  })

  describe('getMaxHints', () => {
    it('should return 3', () => {
      expect(getMaxHints()).toBe(3)
    })
  })

  describe('calculateHintCost', () => {
    it('should calculate cumulative cost for level 1', () => {
      expect(calculateHintCost(1)).toBe(5)
    })

    it('should calculate cumulative cost for level 2', () => {
      expect(calculateHintCost(2)).toBe(15) // 5 + 10
    })

    it('should calculate cumulative cost for level 3', () => {
      expect(calculateHintCost(3)).toBe(30) // 5 + 10 + 15
    })

    it('should clamp to max level', () => {
      expect(calculateHintCost(10)).toBe(30) // same as level 3
    })
  })
})
