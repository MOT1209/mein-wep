import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Word Generation API — Uses Gemini to generate creative words
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
let genAI: import('@google/generative-ai').GoogleGenerativeAI | null = null

const initAI = async () => {
  if (genAI || !GEMINI_API_KEY) return
  try {
    const mod = await import('@google/generative-ai')
    genAI = new mod.GoogleGenerativeAI(GEMINI_API_KEY)
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
    await initAI()

    if (!genAI || !GEMINI_API_KEY) {
      // Return random words from our database
      const words = Array.from({ length: Math.min(count, 10) }, () => getRandomWord(category))
      return NextResponse.json({ words, source: 'database' })
    }

    try {
      const model = genAI.getGenerativeModel({
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
