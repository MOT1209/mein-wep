// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Hint System
// Progressive hints for helping players guess the word
// ═══════════════════════════════════════════════════════════════════════════════

export interface Hint {
  level: number
  text: string
  category: 'letter' | 'clue' | 'description'
  cost: number // Score penalty for using this hint
}

const HINT_ENDPOINT = '/api/hints'
const REQUEST_TIMEOUT_MS = 10000
const MAX_HINTS = 3

// ─── Hint Templates (fallback) ──────────────────────────────────────────────

const LETTER_HINT_TEMPLATES = [
  'The word starts with the letter "{letter}".',
  'The first letter is "{letter}".',
]

const CLUE_TEMPLATES = [
  'It\'s a type of {category}.',
  'Think about {related}.',
  'You might find this at {location}.',
  'It\'s related to {theme}.',
]

const DESCRIPTION_TEMPLATES = [
  '{length}-letter word. {category} category.',
  'Something that {action}. Think {category}.',
]

// ─── Fallback Hint Generation ────────────────────────────────────────────────

function generateFallbackHints(word: string): Hint[] {
  const firstLetter = word.charAt(0).toUpperCase()
  const wordLength = word.length
  const hints: Hint[] = []

  // Level 1: First letter (cheap)
  hints.push({
    level: 1,
    text: LETTER_HINT_TEMPLATES[0].replace('{letter}', firstLetter),
    category: 'letter',
    cost: 5,
  })

  // Level 2: Word length + category clue (medium)
  const lengthWord = wordLength <= 4 ? 'short' : wordLength <= 7 ? 'medium-length' : 'long'
  hints.push({
    level: 2,
    text: `A ${lengthWord} word with ${wordLength} letters. Starts with "${firstLetter}".`,
    category: 'clue',
    cost: 10,
  })

  // Level 3: More detailed description (expensive)
  hints.push({
    level: 3,
    text: `Think of something that starts with "${firstLetter}" and has ${wordLength} letters. ${firstLetter === 'A' ? 'It might be something you can see or touch.' : 'Look at the drawing carefully for shapes.'}`,
    category: 'description',
    cost: 20,
  })

  return hints
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get a progressive hint for a word.
 * @param word - The target word
 * @param hintLevel - Hint level (1-3). Default: next available level
 */
export async function getHint(word: string, hintLevel?: number): Promise<Hint> {
  const level = Math.max(1, Math.min(hintLevel ?? 1, MAX_HINTS))

  // Try API first
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const params = new URLSearchParams({ word, level: String(level) })
    const response = await fetch(`${HINT_ENDPOINT}?${params}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (data?.text && typeof data.text === 'string') {
        return {
          level: level,
          text: data.text,
          category: ['letter', 'clue', 'description'].includes(data.category)
            ? data.category
            : 'clue',
          cost: typeof data.cost === 'number' ? data.cost : level * 5,
        }
      }
    }
  } catch {
    // API unavailable — use fallback
  }

  // Fallback
  const hints = generateFallbackHints(word)
  return hints[Math.min(level - 1, hints.length - 1)]
}

/**
 * Get multiple progressive hints for a word.
 * @param word - The target word
 * @param count - Number of hints to return (default: MAX_HINTS)
 */
export async function getHints(word: string, count?: number): Promise<Hint[]> {
  const numHints = Math.max(1, Math.min(count ?? MAX_HINTS, MAX_HINTS))

  // Try API first
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 2)

    const params = new URLSearchParams({ word, count: String(numHints) })
    const response = await fetch(`${HINT_ENDPOINT}?${params}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data?.hints)) {
        const parsed = data.hints
          .filter((h: unknown): h is Hint =>
            typeof h === 'object' && h !== null &&
            'level' in h && 'text' in h
          )
          .map((h: Hint) => ({
            level: h.level,
            text: h.text,
            category: ['letter', 'clue', 'description'].includes(h.category) ? h.category : 'clue',
            cost: typeof h.cost === 'number' ? h.cost : h.level * 5,
          }))

        if (parsed.length > 0) return parsed.slice(0, numHints)
      }
    }
  } catch {
    // API unavailable — use fallback
  }

  // Fallback
  return generateFallbackHints(word).slice(0, numHints)
}

/**
 * Get the maximum number of hints available.
 */
export function getMaxHints(): number {
  return MAX_HINTS
}

/**
 * Calculate total score cost for using all hints up to a given level.
 */
export function calculateHintCost(level: number): number {
  let total = 0
  for (let i = 1; i <= Math.min(level, MAX_HINTS); i++) {
    total += i * 5
  }
  return total
}
