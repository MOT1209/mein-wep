import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// AI Evaluation Engine (server-side only — GEMINI_API_KEY never reaches the client)
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Dynamic import to avoid client-side bundle
let genAI: any = null
const initAI = async () => {
  if (genAI || !GEMINI_API_KEY) return
  try {
    const mod = await import('@google/generative-ai')
    genAI = new mod.GoogleGenerativeAI(GEMINI_API_KEY)
  } catch { /* silent */ }
}

function getJudgePrompt(locale: string = 'en'): string {
  const basePrompt = 'You are a friendly and encouraging art judge for a drawing game.'
    + ' Evaluate drawings based on: accuracy, creativity, clarity.'
    + ' Score 0-100 for each. Be positive and constructive.'

  // Language-specific instructions
  const languageInstructions: Record<string, string> = {
    en: ' Respond in English. Be witty and fun!',
    de: ' Antworte auf Deutsch. Sei lustig und locker!',
    ar: ' اكتب بالعامية المصرية (مش فصحى). كن م забавным وخفيف الظل!',
  }

  const langInstruction = languageInstructions[locale] || languageInstructions.en

  return basePrompt + langInstruction
    + ' Return JSON: {"score":N,"accuracy":N,"creativity":N,"clarity":N,"comment":"text"}'
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting
//
// This holds state in-memory, which requires this route to run on a
// long-lived Node process (this project ships its own server.js for that
// reason — Socket.io needs the same thing). It would NOT work correctly on
// a stateless/serverless deployment (state resets every cold start, and
// wouldn't be shared across instances) — don't deploy this route to a
// serverless platform without swapping this for a shared store (e.g. Redis).
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW_MS = 60000 // 1 minute
const RATE_MAX = 10 // requests per window
const CLEANUP_INTERVAL_MS = 5 * 60000 // sweep stale entries every 5 minutes so this doesn't grow forever

let lastCleanup = Date.now()

function cleanupRateLimitStore() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) rateLimitStore.delete(key)
  })
}

function checkRateLimit(ip: string): boolean {
  cleanupRateLimitStore()

  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validatePayload(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid payload' }
  if (!data.word || typeof data.word !== 'string') return { valid: false, error: 'Missing word' }
  if (!data.drawingData || typeof data.drawingData !== 'string') return { valid: false, error: 'Missing drawing' }
  if (data.drawingData.length > 10_000_000) return { valid: false, error: 'Drawing too large' }
  if (data.word.length > 100) return { valid: false, error: 'Word too long' }
  return { valid: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation
// ─────────────────────────────────────────────────────────────────────────────

interface EvalResult {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

function getMockEvaluation(): EvalResult {
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
    comment: comments[Math.floor(Math.random() * comments.length)],
  }
}

function parseGeminiResponse(text: string): EvalResult | null {
  try {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) return null

    const data = JSON.parse(match[0])
    return {
      score: clamp(Number(data.score) || 50, 0, 100),
      accuracy: clamp(Number(data.accuracy) || 50, 0, 100),
      creativity: clamp(Number(data.creativity) || 50, 0, 100),
      clarity: clamp(Number(data.clarity) || 50, 0, 100),
      comment: typeof data.comment === 'string' ? data.comment.slice(0, 500) : 'Good effort!',
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: any = null
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    body = await request.json()
    const validation = validatePayload(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { word, drawingData, category, drawingTime, locale = 'en' } = body

    await initAI()

    // If no API key, return mock
    if (!genAI || !GEMINI_API_KEY) {
      console.warn('[AI] No API key configured')
      return NextResponse.json(getMockEvaluation())
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })

      const base64 = drawingData.replace(/^data:image\/\w+;base64,/, '')
      const img = [{ inlineData: { mimeType: 'image/png', data: base64 } }]

      const prompt = `${getJudgePrompt(locale)}\n\nWord: "${word}" | Category: ${category || 'general'} | Time: ${drawingTime || 60}s\n\nReturn JSON:`

      const result = await model.generateContent([prompt, ...img])
      const text = result.response.text()

      const parsed = parseGeminiResponse(text)
      return NextResponse.json(parsed || getMockEvaluation())

    } catch (err: any) {
      console.error('[AI] Gemini error:', err?.message || err)
      return NextResponse.json(getMockEvaluation())
    }

  } catch (err: any) {
    console.error('[API] Fatal error:', err?.message || err)
    return NextResponse.json(getMockEvaluation())
  }
}
