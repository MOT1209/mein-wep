// ═══════════════════════════════════════════════════════════════════════════════
// Test: Gemini API Integration (src/lib/gemini.ts)
// ═══════════════════════════════════════════════════════════════════════════════

import {
  evaluateDrawing,
  evaluateDrawings,
  calculateFinalScoreWithBreakdown,
} from '@/lib/gemini'

import { hasQuota, incrementQuota, resetQuota } from '@/lib/aiQuota'

import type { DrawingToEvaluate } from '@/lib/gemini'

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

const mockDrawing: DrawingToEvaluate = {
  id: 'test-drawing-1',
  word: 'cat',
  drawingData: 'data:image/png;base64,fakedata',
  category: 'animals',
  drawingTime: 60,
  locale: 'en',
}

let mockFetchFn: jest.Mock

beforeEach(() => {
  mockFetchFn = jest.fn()
  global.fetch = mockFetchFn as any
  resetQuota()
  jest.useFakeTimers({ advanceTimers: true })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('Gemini - evaluateDrawing', () => {
  it('should return evaluation from API on success', async () => {
    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        score: 85,
        accuracy: 80,
        creativity: 90,
        clarity: 85,
        comment: 'Great drawing!',
      }),
    })

    const result = await evaluateDrawing(mockDrawing)
    expect(result.score).toBe(85)
    expect(result.accuracy).toBe(80)
    expect(result.creativity).toBe(90)
    expect(result.clarity).toBe(85)
    expect(result.comment).toBe('Great drawing!')
  })

  it('should clamp scores to 0-100', async () => {
    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        score: 200,
        accuracy: -10,
        creativity: 300,
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

  it('should fall back to template evaluation on network failure', async () => {
    mockFetchFn.mockRejectedValueOnce(new Error('Network error'))

    const result = await evaluateDrawing(mockDrawing)
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.score).toBeLessThanOrEqual(80)
    expect(result.comment).toBeTruthy()
  })

  it('should not retry on 400 client error', async () => {
    mockFetchFn.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    })

    const result = await evaluateDrawing(mockDrawing)
    // Falls back to template after client error
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
  })

  it('should use template evaluation when offline', async () => {
    // Make navigator.onLine = false
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

    const result = await evaluateDrawing(mockDrawing)
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.score).toBeLessThanOrEqual(80)

    // Restore
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  it('should use template evaluation when quota exceeded', async () => {
    // Exhaust quota
    for (let i = 0; i < 20; i++) {
      incrementQuota()
    }

    const result = await evaluateDrawing(mockDrawing)
    expect(result.score).toBeGreaterThanOrEqual(60)
  })

  it('should use default comment when API returns no comment', async () => {
    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        score: 75,
        accuracy: 70,
        creativity: 80,
        clarity: 75,
        // no comment field
      }),
    })

    const result = await evaluateDrawing(mockDrawing)
    expect(result.comment).toBeTruthy()
    expect(result.comment.length).toBeGreaterThan(0)
  })

  it('should handle locale-specific fallback comments', async () => {
    // Exhaust quota
    for (let i = 0; i < 20; i++) {
      incrementQuota()
    }

    const arDrawing = { ...mockDrawing, locale: 'ar' as const }
    const result = await evaluateDrawing(arDrawing)
    expect(result.comment).toBeTruthy()
    // Arabic comment should contain Arabic characters
    expect(result.comment).toMatch(/[\u0600-\u06FF]/)
  })

  it('should handle locale de fallback comments', async () => {
    for (let i = 0; i < 20; i++) {
      incrementQuota()
    }

    const deDrawing = { ...mockDrawing, locale: 'de' as const }
    const result = await evaluateDrawing(deDrawing)
    expect(result.comment).toBeTruthy()
  })
})

describe('Gemini - evaluateDrawings', () => {
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

describe('Gemini - calculateFinalScoreWithBreakdown', () => {
  it('should calculate 70/30 split', () => {
    const result = calculateFinalScoreWithBreakdown(100, 100)
    expect(result.finalScore).toBe(100)
    expect(result.breakdown.votes).toBe(70)
    expect(result.breakdown.ai).toBe(30)
  })

  it('should handle zero scores', () => {
    const result = calculateFinalScoreWithBreakdown(0, 0)
    expect(result.finalScore).toBe(0)
  })

  it('should clamp final score to 0-100', () => {
    const result = calculateFinalScoreWithBreakdown(100, 100)
    expect(result.finalScore).toBeLessThanOrEqual(100)
    expect(result.finalScore).toBeGreaterThanOrEqual(0)
  })

  it('should clamp vote score to 100', () => {
    const result = calculateFinalScoreWithBreakdown(200, 50)
    expect(result.breakdown.votes).toBe(70)
  })

  it('should handle mixed scores', () => {
    const result = calculateFinalScoreWithBreakdown(80, 60)
    expect(result.finalScore).toBe(Math.round(80 * 0.7 + 60 * 0.3))
  })

  it('should round breakdown values', () => {
    const result = calculateFinalScoreWithBreakdown(33, 33)
    expect(Number.isInteger(result.breakdown.votes)).toBe(true)
    expect(Number.isInteger(result.breakdown.ai)).toBe(true)
    expect(Number.isInteger(result.finalScore)).toBe(true)
  })
})

describe('Gemini - AI Quota', () => {
  it('hasQuota returns true initially', () => {
    resetQuota()
    expect(hasQuota()).toBe(true)
  })

  it('incrementQuota increases count', () => {
    resetQuota()
    incrementQuota()
    expect(hasQuota()).toBe(true)
  })

  it('resetQuota resets to zero', () => {
    incrementQuota()
    incrementQuota()
    resetQuota()
    expect(hasQuota()).toBe(true)
  })
})
