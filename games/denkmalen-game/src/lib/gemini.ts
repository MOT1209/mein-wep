// AI Judge client — calls the server-side /api/evaluate route (which holds the Gemini key).

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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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
    accuracy: Math.min(Math.max(base - 5 + Math.floor(Math.random() * 10), 0), 100),
    creativity: Math.min(Math.max(base + Math.floor(Math.random() * 15), 0), 100),
    clarity: Math.min(Math.max(base - 10 + Math.floor(Math.random() * 20), 0), 100),
    comment: comments[Math.floor(Math.random() * comments.length)]
  }
}

// Evaluates a single drawing, with retry on rate limit / server error.
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
        if (data && typeof data.score === 'number') {
          return {
            score: Math.min(Math.max(data.score, 0), 100),
            accuracy: Math.min(Math.max(data.accuracy, 0), 100),
            creativity: Math.min(Math.max(data.creativity, 0), 100),
            clarity: Math.min(Math.max(data.clarity, 0), 100),
            comment: typeof data.comment === 'string' ? data.comment : 'Good effort!'
          }
        }
      }

      // Rate limited - wait and retry
      if (response.status === 429) {
        await sleep(RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      // Server error - retry
      if (response.status >= 500) {
        await sleep(RETRY_DELAY_MS)
        continue
      }

      break // Client error - don't retry

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
    }
  }

  // All retries failed - return default
  console.warn('[AI] Evaluation failed:', lastError?.message || 'unknown')
  return defaultEvaluation()
}

// Evaluates several drawings concurrently (bounded), keyed by drawing id.
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

// Combines vote score (70%) and AI score (30%) into a final score.
export function calculateFinalScoreWithBreakdown(
  voteScore: number,
  aiScore: number
): { finalScore: number; breakdown: { votes: number; ai: number } } {
  const v = Math.min(voteScore, 100)
  const vc = v * 0.7
  const ac = aiScore * 0.3
  const fs = Math.round(vc + ac)

  return {
    finalScore: Math.min(Math.max(fs, 0), 100),
    breakdown: {
      votes: Math.round(vc),
      ai: Math.round(ac)
    }
  }
}
