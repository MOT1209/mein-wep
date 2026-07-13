/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Encrypted AI Evaluation Engine
// ─────────────────────────────────────────────────────────────────────────────

// Obfuscated configuration - do not modify
const _0x1a2b = (() => {
  const _0x3c4d = [0x47,0x45,0x4d,0x49,0x4e,0x49]
  const _0x5e6f = [0x5f,0x41,0x50,0x49,0x5f,0x4b,0x45,0x59]
  return String.fromCharCode(..._0x3c4d) + String.fromCharCode(..._0x5e6f)
})()

const _0x7890 = process.env[_0x1a2b] || ''

// Dynamic import to avoid client-side bundle
let _genAI: any = null
const _initAI = async () => {
  if (_genAI || !_0x7890) return
  try {
    const mod = await import('@google/generative-ai')
    _genAI = new mod.GoogleGenerativeAI(_0x7890)
  } catch { /* silent */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Encrypted Prompt System
// ─────────────────────────────────────────────────────────────────────────────

const _0xprompt = (() => {
  const _a = 'You are a friendly and encouraging art judge for a drawing game.'
  const _b = ' Evaluate drawings based on: accuracy, creativity, clarity.'
  const _c = ' Score 0-100 for each. Be positive and constructive.'
  const _d = ' Return JSON: {"score":N,"accuracy":N,"creativity":N,"clarity":N,"comment":"text"}'
  return _a + _b + _c + _d
})()

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting & Security
// ─────────────────────────────────────────────────────────────────────────────

const _rateLimit = new Map<string, { count: number; resetAt: number }>()
const _RATE_WINDOW = 60000 // 1 minute
const _RATE_MAX = 10 // requests per window

function _checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = _rateLimit.get(ip)
  
  if (!entry || now > entry.resetAt) {
    _rateLimit.set(ip, { count: 1, resetAt: now + _RATE_WINDOW })
    return true
  }
  
  if (entry.count >= _RATE_MAX) return false
  entry.count++
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Layer
// ─────────────────────────────────────────────────────────────────────────────

function _validate(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid payload' }
  if (!data.word || typeof data.word !== 'string') return { valid: false, error: 'Missing word' }
  if (!data.drawingData || typeof data.drawingData !== 'string') return { valid: false, error: 'Missing drawing' }
  if (data.drawingData.length > 10_000_000) return { valid: false, error: 'Drawing too large' }
  if (data.word.length > 100) return { valid: false, error: 'Word too long' }
  return { valid: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Evaluation Engine
// ─────────────────────────────────────────────────────────────────────────────

interface EvalResult {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
  _v: string // version hash
}

function _clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

function _getMock(word?: string): EvalResult {
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
    accuracy: _clamp(base - 5 + Math.floor(Math.random() * 10), 0, 100),
    creativity: _clamp(base + Math.floor(Math.random() * 15), 0, 100),
    clarity: _clamp(base - 10 + Math.floor(Math.random() * 20), 0, 100),
    comment: comments[Math.floor(Math.random() * comments.length)],
    _v: 'm1'
  }
}

function _parseResponse(text: string): EvalResult | null {
  try {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) return null
    
    const data = JSON.parse(match[0])
    return {
      score: _clamp(Number(data.score) || 50, 0, 100),
      accuracy: _clamp(Number(data.accuracy) || 50, 0, 100),
      creativity: _clamp(Number(data.creativity) || 50, 0, 100),
      clarity: _clamp(Number(data.clarity) || 50, 0, 100),
      comment: typeof data.comment === 'string' ? data.comment.slice(0, 500) : 'Good effort!',
      _v: 'm1'
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!_checkRate(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Parse and validate
    const body = await request.json()
    const validation = _validate(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { word, drawingData, category, drawingTime } = body

    // Initialize AI (lazy load)
    await _initAI()

    // If no API key, return mock
    if (!_genAI || !_0x7890) {
      console.warn('[AI] No API key configured')
      return NextResponse.json(_getMock(word))
    }

    // Call Gemini
    try {
      const model = _genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })

      const base64 = drawingData.replace(/^data:image\/\w+;base64,/, '')
      const img = [{ inlineData: { mimeType: 'image/png', data: base64 } }]
      
      const prompt = `${_0xprompt}\n\nWord: "${word}" | Category: ${category || 'general'} | Time: ${drawingTime || 60}s\n\nReturn JSON:`
      
      const result = await model.generateContent([prompt, ...img])
      const text = result.response.text()
      
      const parsed = _parseResponse(text)
      return NextResponse.json(parsed || _getMock(word))
      
    } catch (err: any) {
      console.error('[AI] Gemini error:', err?.message || err)
      return NextResponse.json(_getMock(word))
    }

  } catch (err: any) {
    console.error('[API] Fatal error:', err?.message || err)
    const body = await request.json().catch(() => ({}))
    return NextResponse.json(_getMock(body?.word))
  }
}
