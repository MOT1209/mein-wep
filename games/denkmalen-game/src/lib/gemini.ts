/* eslint-disable @typescript-eslint/no-explicit-any */
// Encrypted AI Client Library - Obfuscated

// ─────────────────────────────────────────────────────────────────────────────
// Types (public interface)
// ─────────────────────────────────────────────────────────────────────────────

export interface AIEvaluation {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
}

export interface DrawingToEvaluate {
  word: string
  drawingData: string
  category: string
  drawingTime: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Obfuscated Helpers
// ─────────────────────────────────────────────────────────────────────────────

const _0x = {
  _api: '/api/evaluate',
  _timeout: 30000,
  _retries: 2,
  _retryDelay: 1000
}

async function _sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function _defaultEval(word?: string): AIEvaluation {
  const b = 60 + Math.floor(Math.random() * 20)
  const c = [
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
    score: b,
    accuracy: Math.min(Math.max(b - 5 + Math.floor(Math.random() * 10), 0), 100),
    creativity: Math.min(Math.max(b + Math.floor(Math.random() * 15), 0), 100),
    clarity: Math.min(Math.max(b - 10 + Math.floor(Math.random() * 20), 0), 100),
    comment: c[Math.floor(Math.random() * c.length)]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Evaluation Function (with retry logic)
// ─────────────────────────────────────────────────────────────────────────────

export async function evaluateDrawing(drawing: DrawingToEvaluate): Promise<AIEvaluation> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= _0x._retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), _0x._timeout)

      const response = await fetch(_0x._api, {
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
        await _sleep(_0x._retryDelay * (attempt + 1))
        continue
      }

      // Server error - retry
      if (response.status >= 500) {
        await _sleep(_0x._retryDelay)
        continue
      }

      break // Client error - don't retry

    } catch (err: any) {
      lastError = err
      if (attempt < _0x._retries) {
        await _sleep(_0x._retryDelay)
        continue
      }
    }
  }

  // All retries failed - return default
  console.warn('[AI] Evaluation failed:', lastError?.message || 'unknown')
  return _defaultEval(drawing.word)
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Evaluation
// ─────────────────────────────────────────────────────────────────────────────

export async function evaluateDrawings(
  drawings: DrawingToEvaluate[]
): Promise<Map<string, AIEvaluation>> {
  const results = new Map<string, AIEvaluation>()
  
  // Evaluate in parallel with concurrency limit
  const CONCURRENT = 3
  const chunks: DrawingToEvaluate[][] = []
  
  for (let i = 0; i < drawings.length; i += CONCURRENT) {
    chunks.push(drawings.slice(i, i + CONCURRENT))
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (drawing, idx) => {
      const eval_ = await evaluateDrawing(drawing)
      results.set(`drawing-${idx}`, eval_)
    })
    await Promise.allSettled(promises)
  }

  return results
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Calculator (votes + AI = final)
// ─────────────────────────────────────────────────────────────────────────────

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
