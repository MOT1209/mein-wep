// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Drawing Evaluator
// Moved from src/lib/gemini.ts — AI-powered drawing evaluation
// ═══════════════════════════════════════════════════════════════════════════════

export interface AIEvaluation {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
}

export interface DrawingToEvaluate {
  id: string
  word: string
  drawingData: string
  category: string
  drawingTime: number
}

const EVALUATE_ENDPOINT = '/api/evaluate'
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Mock evaluation when API is unavailable.
 */
function defaultEvaluation(): AIEvaluation {
  const base = 60 + Math.floor(Math.random() * 20)
  const comments = [
    'Great effort! Keep drawing! 🎨',
    'Nice try! I can see what you were going for! ✨',
    'Creative interpretation! Well done! 🌟',
    'Good job! Every drawing tells a story! 🎭',
    'Keep it up! You\'re improving! 💪',
    'That\'s a fun take on it! 🎉',
    'I love the creativity! 🎨',
    'Well done! The effort shows! ⭐',
  ]
  return {
    score: base,
    accuracy: clamp(base - 5 + Math.floor(Math.random() * 10), 0, 100),
    creativity: clamp(base + Math.floor(Math.random() * 15), 0, 100),
    clarity: clamp(base - 10 + Math.floor(Math.random() * 20), 0, 100),
    comment: comments[Math.floor(Math.random() * comments.length)]
  }
}

/**
 * Validate and normalize evaluation from API response.
 */
function normalizeEvaluation(data: unknown): AIEvaluation | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  if (typeof obj.score !== 'number') return null

  return {
    score: clamp(obj.score, 0, 100),
    accuracy: clamp(typeof obj.accuracy === 'number' ? obj.accuracy : 0, 0, 100),
    creativity: clamp(typeof obj.creativity === 'number' ? obj.creativity : 0, 0, 100),
    clarity: clamp(typeof obj.clarity === 'number' ? obj.clarity : 0, 0, 100),
    comment: typeof obj.comment === 'string' ? obj.comment : 'Good effort!'
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Evaluate a single drawing with retry on rate limit / server error.
 * Falls back to mock evaluation if API is unavailable.
 */
export async function evaluateDrawing(drawing: DrawingToEvaluate): Promise<AIEvaluation> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch(EVALUATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: drawing.word,
          drawingData: drawing.drawingData,
          category: drawing.category,
          drawingTime: drawing.drawingTime
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const evaluation = normalizeEvaluation(data)
        if (evaluation) return evaluation
      }

      // Rate limited — wait and retry
      if (response.status === 429) {
        await sleep(RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      // Server error — retry
      if (response.status >= 500) {
        await sleep(RETRY_DELAY_MS)
        continue
      }

      break // Client error — don't retry

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
    }
  }

  // All retries failed — return mock evaluation
  console.warn('[AI Evaluator] API unavailable, using mock:', lastError?.message || 'unknown')
  return defaultEvaluation()
}

/**
 * Evaluate multiple drawings concurrently (bounded parallelism).
 * Results keyed by drawing id.
 */
export async function evaluateDrawings(
  drawings: DrawingToEvaluate[]
): Promise<Map<string, AIEvaluation>> {
  const results = new Map<string, AIEvaluation>()
  const CONCURRENT = 3

  const chunks: DrawingToEvaluate[][] = []
  for (let i = 0; i < drawings.length; i += CONCURRENT) {
    chunks.push(drawings.slice(i, i + CONCURRENT))
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (drawing) => {
      const evaluation = await evaluateDrawing(drawing)
      results.set(drawing.id, evaluation)
    })
    await Promise.allSettled(promises)
  }

  return results
}

/**
 * Calculate final score: votes (70%) + AI (30%).
 */
export function calculateFinalScoreWithBreakdown(
  voteScore: number,
  aiScore: number
): { finalScore: number; breakdown: { votes: number; ai: number } } {
  const v = clamp(voteScore, 0, 100)
  const vc = v * 0.7
  const ac = aiScore * 0.3
  const fs = Math.round(vc + ac)

  return {
    finalScore: clamp(fs, 0, 100),
    breakdown: {
      votes: Math.round(vc),
      ai: Math.round(ac)
    }
  }
}
