/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Hints API — Generate hints for drawing words
// ─────────────────────────────────────────────────────────────────────────────

const _0x1a2b = (() => {
  const _0x3c4d = [0x47,0x45,0x4d,0x49,0x4e,0x49]
  const _0x5e6f = [0x5f,0x41,0x50,0x49,0x5f,0x4b,0x45,0x59]
  return String.fromCharCode(..._0x3c4d) + String.fromCharCode(..._0x5e6f)
})()

const _0x7890 = process.env[_0x1a2b] || ''
let _genAI: any = null

const _initAI = async () => {
  if (_genAI || !_0x7890) return
  try {
    const mod = await import('@google/generative-ai')
    _genAI = new mod.GoogleGenerativeAI(_0x7890)
  } catch { /* silent */ }
}

// Local hints database
const HINT_DB: Record<string, string[]> = {
  // Animals
  cat: ['Has whiskers', 'Says meow', 'Nine lives', 'Furry pet'],
  dog: ['Man\'s best friend', 'Barks', 'Wags tail', 'Loyal pet'],
  elephant: ['Largest land animal', 'Has a trunk', 'Never forgets', 'Gray giant'],
  penguin: ['Lives in cold', 'Can\'t fly', 'Wears a tuxedo', 'Swims well'],
  // Food
  pizza: ['Italian food', 'Has cheese', 'Round shape', 'Sliceable'],
  burger: ['Fast food', 'Has layers', 'Between buns', 'Grilled patty'],
  // Objects
  chair: ['You sit on it', 'Has four legs', 'Found in rooms', 'Furniture'],
  phone: ['Makes calls', 'Has a screen', 'Portable', 'Apps'],
  // More...
  tree: ['Has leaves', 'Grows tall', 'Provides shade', 'Has roots'],
  sun: ['Shines bright', 'In the sky', 'Gives light', 'Star'],
}

function getLocalHints(word: string, count: number): string[] {
  const wordLower = word.toLowerCase()
  const hints: string[] = []
  
  // Check exact match
  if (HINT_DB[wordLower]) {
    hints.push(...HINT_DB[wordLower])
  }
  
  // Generate generic hints if not enough
  const genericHints = [
    `It's something you might see every day`,
    `Think about common things`,
    `It has a distinct shape`,
    `People of all ages know this`,
    `It's often drawn by children`,
  ]
  
  while (hints.length < count) {
    const hint = genericHints[hints.length % genericHints.length]
    if (!hints.includes(hint)) {
      hints.push(hint)
    } else {
      break
    }
  }
  
  return hints.slice(0, count)
}

interface HintRequest {
  word: string
  count?: number
  hintIndex?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: HintRequest = await request.json()
    const { word, count = 3, hintIndex } = body

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    // Initialize AI
    await _initAI()

    if (!_genAI || !_0x7890) {
      // Return local hints
      const hints = getLocalHints(word, count)
      const selectedHint = hintIndex !== undefined ? hints[hintIndex % hints.length] : hints[0]
      return NextResponse.json({ 
        hints, 
        selectedHint,
        source: 'database' 
      })
    }

    try {
      const model = _genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
      })

      const prompt = `Generate ${count} hints for a drawing game.
The word to guess is: "${word}"
Hints should be progressively more specific (first hint vague, last hint obvious).
Return ONLY a JSON array of hint strings, no explanation.
Example: ["hint1", "hint2", "hint3"]`

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      
      const match = text.match(/\[[\s\S]*?\]/)
      if (match) {
        const hints = JSON.parse(match[0])
        if (Array.isArray(hints) && hints.length > 0) {
          const selectedHint = hintIndex !== undefined ? hints[hintIndex % hints.length] : hints[0]
          return NextResponse.json({ hints: hints.slice(0, count), selectedHint, source: 'ai' })
        }
      }
    } catch (err: any) {
      console.error('[Hints] AI error:', err?.message)
    }

    // Fallback
    const hints = getLocalHints(word, count)
    const selectedHint = hintIndex !== undefined ? hints[hintIndex % hints.length] : hints[0]
    return NextResponse.json({ hints, selectedHint, source: 'database' })

  } catch (err: any) {
    console.error('[Hints] Error:', err?.message)
    const hints = ['Something common', 'Think simple', 'Easy to draw']
    return NextResponse.json({ hints, selectedHint: hints[0], source: 'database' })
  }
}
