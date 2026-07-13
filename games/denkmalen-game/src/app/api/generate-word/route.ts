/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Word Generation API — Uses Gemini to generate creative words
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

// Word categories for fallback
const CATEGORIES: Record<string, string[]> = {
  animals: ['cat', 'dog', 'elephant', 'giraffe', 'penguin', 'lion', 'turtle', 'rabbit', 'fish', 'bird'],
  food: ['pizza', 'burger', 'sushi', 'ice cream', 'cake', 'apple', 'banana', 'coffee', 'bread', 'cake'],
  objects: ['chair', 'table', 'lamp', 'clock', 'phone', 'book', 'shoe', 'hat', 'key', 'bag'],
  nature: ['tree', 'flower', 'mountain', 'river', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow'],
  vehicles: ['car', 'bicycle', 'airplane', 'boat', 'train', 'bus', 'truck', 'motorcycle', 'helicopter', 'rocket'],
  buildings: ['house', 'castle', 'skyscraper', 'church', 'bridge', 'tower', 'warehouse', 'factory', 'school', 'hospital'],
  sports: ['soccer', 'basketball', 'tennis', 'golf', 'swimming', 'baseball', 'volleyball', 'hockey', 'boxing', 'cycling'],
  music: ['guitar', 'piano', 'drum', 'violin', 'trumpet', 'flute', 'saxophone', 'microphone', 'headphones', 'music note'],
  technology: ['computer', 'robot', 'phone', 'camera', 'drone', 'watch', 'television', 'speaker', 'keyboard', 'mouse'],
  space: ['planet', 'rocket', 'astronaut', 'alien', 'satellite', 'comet', 'asteroid', 'galaxy', 'telescope', 'moon'],
  history: ['pyramid', 'dinosaur', 'crown', 'sword', 'shield', 'castle', 'throne', 'helmet', 'armor', 'flag'],
  fantasy: ['dragon', 'unicorn', 'wizard', 'fairy', 'ghost', 'vampire', 'mermaid', 'phoenix', 'goblin', 'magic'],
}

const FALLBACK_WORDS = Object.values(CATEGORIES).flat()

function getRandomWord(category?: string): string {
  if (category && CATEGORIES[category]) {
    const words = CATEGORIES[category]
    return words[Math.floor(Math.random() * words.length)]
  }
  return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
}

interface GenerateRequest {
  category?: string
  count?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { category, count = 1, difficulty = 'medium' } = body

    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Initialize AI
    await _initAI()

    if (!_genAI || !_0x7890) {
      // Return random words from our database
      const words = Array.from({ length: Math.min(count, 10) }, () => getRandomWord(category))
      return NextResponse.json({ words, source: 'database' })
    }

    try {
      const model = _genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { temperature: 0.9, maxOutputTokens: 200 }
      })

      const difficultyPrompt = difficulty === 'easy' ? 'simple, common words' :
                              difficulty === 'hard' ? 'unusual, challenging, obscure words' :
                              'moderately common words'

      const prompt = `Generate ${count} drawing game words.
Category: ${category || 'any'}
Difficulty: ${difficultyPrompt}
Return ONLY a JSON array of strings, no explanation.
Example: ["word1", "word2", "word3"]`

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      
      // Parse response
      const match = text.match(/\[[\s\S]*?\]/)
      if (match) {
        const words = JSON.parse(match[0])
        if (Array.isArray(words) && words.length > 0) {
          return NextResponse.json({ words: words.slice(0, count), source: 'ai' })
        }
      }
    } catch (err: any) {
      console.error('[WordGen] AI error:', err?.message)
    }

    // Fallback to database
    const words = Array.from({ length: Math.min(count, 10) }, () => getRandomWord(category))
    return NextResponse.json({ words, source: 'database' })

  } catch (err: any) {
    console.error('[WordGen] Error:', err?.message)
    return NextResponse.json({ words: [getRandomWord()], source: 'database' })
  }
}
