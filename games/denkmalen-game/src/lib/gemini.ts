// Gemini AI Judge for Draw Battle
// Uses Gemini 2.5 Flash to evaluate drawings via server-side API route

// Types
export interface AIEvaluation {
  score: number        // 0-100 overall score
  accuracy: number     // 0-100 how well it matches the word
  creativity: number   // 0-100 creative interpretation
  clarity: number      // 0-100 visual clarity
  comment: string      // Short friendly feedback
}

export interface DrawingToEvaluate {
  word: string
  drawingData: string  // base64 image data
  category: string
  drawingTime: number  // seconds spent drawing
}

// System prompt for the AI Judge
const JUDGE_PROMPT = `You are a friendly and encouraging art judge for a drawing game called "Draw Battle".

Your task is to evaluate a player's drawing based on:
1. The secret word they were supposed to draw
2. The category of the word
3. How much time they had to draw

EVALUATION CRITERIA:
- ACCURACY (0-100): How well does the drawing represent the word?
- CREATIVITY (0-100): How creative and unique is the interpretation?
- CLARITY (0-100): How clear and recognizable is the drawing?
- OVERALL SCORE (0-100): Combined quality considering all factors

SCORING GUIDELINES:
- 90-100: Exceptional - instantly recognizable, creative, detailed
- 70-89: Great - clearly represents the word, good effort
- 50-69: Good - somewhat recognizable, decent attempt
- 30-49: Fair - hard to recognize but shows effort
- 0-29: Needs work - doesn't clearly represent the word

IMPORTANT RULES:
- Be encouraging and positive, even for poor drawings
- Focus on effort and creativity, not just accuracy
- Give constructive feedback
- Consider the drawing time (less time = more forgiving)
- Never be harsh or discouraging
- If the drawing is completely unrelated, score it low but kindly

RESPONSE FORMAT (JSON only, no markdown):
{
  "score": <number 0-100>,
  "accuracy": <number 0-100>,
  "creativity": <number 0-100>,
  "clarity": <number 0-100>,
  "comment": "<short encouraging feedback, 1-2 sentences>"
}`

/**
 * Evaluate a single drawing using server-side API route
 */
export async function evaluateDrawing(drawing: DrawingToEvaluate): Promise<AIEvaluation> {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: drawing.word,
        drawingData: drawing.drawingData,
        category: drawing.category,
        drawingTime: drawing.drawingTime,
      }),
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('AI Evaluation failed:', error)
  }

  return getDefaultEvaluation(drawing.word)
}

/**
 * Evaluate multiple drawings in parallel
 */
export async function evaluateDrawings(drawings: DrawingToEvaluate[]): Promise<Map<string, AIEvaluation>> {
  const evaluations = new Map<string, AIEvaluation>()

  // Evaluate all drawings in parallel
  const promises = drawings.map(async (drawing, index) => {
    const evaluation = await evaluateDrawing(drawing)
    evaluations.set(`drawing-${index}`, evaluation)
  })

  await Promise.allSettled(promises)
  return evaluations
}

/**
 * Get default evaluation when AI is unavailable
 */
function getDefaultEvaluation(word?: string): AIEvaluation {
  const baseScore = 60 + Math.floor(Math.random() * 20) // 60-79
  return {
    score: baseScore,
    accuracy: baseScore - 5 + Math.floor(Math.random() * 10),
    creativity: baseScore + Math.floor(Math.random() * 15),
    clarity: baseScore - 10 + Math.floor(Math.random() * 20),
    comment: getRandomEncouragement()
  }
}

/**
 * Get random encouraging comment
 */
function getRandomEncouragement(): string {
  const comments = [
    "Great effort! Keep drawing! 🎨",
    "Nice try! I can see what you were going for! ✨",
    "Creative interpretation! Well done! 🌟",
    "Good job! Every drawing tells a story! 🎭",
    "Keep it up! You're improving! 💪",
    "That's a fun take on it! 🎉",
    "I love the creativity! 🎨",
    "Well done! The effort shows! ⭐",
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate final score combining votes and AI evaluation
 * 70% votes + 30% AI score
 */
export function calculateFinalScoreWithBreakdown(
  voteScore: number,
  aiScore: number
): { finalScore: number; breakdown: { votes: number; ai: number } } {
  const normalizedVotes = Math.min(voteScore, 100)
  
  const votesContribution = normalizedVotes * 0.7
  const aiContribution = aiScore * 0.3
  
  const finalScore = Math.round(votesContribution + aiContribution)
  
  return {
    finalScore: clamp(finalScore, 0, 100),
    breakdown: {
      votes: Math.round(votesContribution),
      ai: Math.round(aiContribution)
    }
  }
}
