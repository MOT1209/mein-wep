// ═══════════════════════════════════════════════════════════════════════════════
// Sketch Battle AI — Word/Prompt Generator
// AI-powered word generation for drawing rounds
// ═══════════════════════════════════════════════════════════════════════════════

export type WordCategory =
  | 'animals'
  | 'food'
  | 'objects'
  | 'places'
  | 'people'
  | 'nature'
  | 'technology'
  | 'sports'
  | 'music'
  | 'abstract'
  | 'random'

// ─── Word Banks (fallback when API unavailable) ─────────────────────────────

const WORD_BANKS: Record<WordCategory, string[]> = {
  animals: [
    'cat', 'dog', 'elephant', 'butterfly', 'dolphin', 'eagle', 'frog', 'giraffe',
    'hedgehog', 'kangaroo', 'lion', 'octopus', 'penguin', 'rabbit', 'snake', 'tiger',
    'whale', 'zebra', 'flamingo', 'panda', 'parrot', 'turtle', 'fox', 'bear',
  ],
  food: [
    'pizza', 'sushi', 'hamburger', 'ice cream', 'chocolate', 'watermelon', 'taco',
    'donut', 'pancake', 'cookie', 'spaghetti', 'popcorn', 'strawberry', 'cake',
    'sandwich', 'french fries', 'banana', 'apple', 'mushroom', 'cheese',
  ],
  objects: [
    'umbrella', 'bicycle', 'telescope', 'piano', 'backpack', 'lantern', 'hourglass',
    'compass', 'camera', 'key', 'candle', 'guitar', 'sword', 'crown', 'diamond',
    'robot', 'balloon', 'rocket', 'train', 'bridge', 'castle', 'airplane',
  ],
  places: [
    'beach', 'mountain', 'library', 'space station', 'circus', 'farm', 'zoo',
    'volcano', 'island', 'lighthouse', 'playground', 'cave', 'forest', 'desert',
    'city skyline', 'pirate ship', 'underwater', 'moon', 'hospital', 'factory',
  ],
  people: [
    'astronaut', 'chef', 'pirate', 'superhero', 'firefighter', 'wizard', 'dancer',
    'scientist', 'clown', 'knight', 'princess', 'robot', 'pilot', 'surfer',
    'magician', 'ninja', 'cowboy', 'fisherman', 'farmer', 'doctor',
  ],
  nature: [
    'rainbow', 'thunder', 'waterfall', 'sunset', 'flower', 'tree', 'cloud',
    'star', 'moon', 'wave', 'tornado', 'snowflake', 'leaf', 'ocean', 'cactus',
    'mushroom', 'coral reef', 'aurora', 'mountain peak', 'canyon',
  ],
  technology: [
    'computer', 'drone', 'satellite', 'VR headset', 'smartphone', 'satellite dish',
    'circuit board', 'light bulb', 'gears', 'microscope', 'printer', 'battery',
    'Wi-Fi signal', 'touchscreen', 'headphones', 'USB cable', 'projector',
    'calculator', 'remote control', 'joystick',
  ],
  sports: [
    'skateboard', 'surfboard', 'basketball', 'tennis racket', 'boxing gloves',
    'skis', 'golf club', 'trophy', 'medal', 'ping pong', 'bowling', 'hockey',
    'karate', 'archery', 'hurdle', 'parachute', 'bicycle', 'kite', 'trampoline',
    'pogo stick',
  ],
  music: [
    'violin', 'drum set', 'trumpet', 'microphone', 'headphones', 'music note',
    'record player', 'concert', 'bass guitar', 'flute', 'accordion', 'xylophone',
    'harp', 'DJ turntable', 'karaoke', 'bagpipes', 'saxophone', 'synthesizer',
  ],
  abstract: [
    'dream', 'love', 'time', 'memory', 'silence', 'speed', 'chaos', 'balance',
    'infinity', 'gravity', 'emotion', 'adventure', 'mystery', 'freedom', 'light',
    'shadow', 'sound', 'weight', 'temperature', 'color wheel',
  ],
  random: [],
}

// Merge all categories into 'random'
for (const [cat, words] of Object.entries(WORD_BANKS)) {
  if (cat !== 'random') {
    WORD_BANKS.random.push(...words)
  }
}

const GENERATE_ENDPOINT = '/api/generate-word'
const REQUEST_TIMEOUT_MS = 15000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a single word for a drawing round.
 * Tries the API first, falls back to local word banks.
 */
export async function generateWord(
  category: WordCategory = 'random',
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<string> {
  // Try API first
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const params = new URLSearchParams({ category })
    if (difficulty) params.set('difficulty', difficulty)

    const response = await fetch(`${GENERATE_ENDPOINT}?${params}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (typeof data?.word === 'string' && data.word.length > 0) {
        return data.word.toLowerCase()
      }
    }
  } catch {
    // API unavailable — use fallback
  }

  // Fallback: local word bank
  return generateWordFromBank(category)
}

/**
 * Generate multiple unique words.
 */
export async function generateWords(
  count: number,
  category: WordCategory = 'random',
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<string[]> {
  // Try API first for batch generation
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 2)

    const params = new URLSearchParams({
      category,
      count: String(count),
    })
    if (difficulty) params.set('difficulty', difficulty)

    const response = await fetch(`${GENERATE_ENDPOINT}?${params}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data?.words) && data.words.length > 0) {
        return data.words
          .filter((w: unknown): w is string => typeof w === 'string' && w.length > 0)
          .map((w: string) => w.toLowerCase())
          .slice(0, count)
      }
    }
  } catch {
    // API unavailable — use fallback
  }

  // Fallback: local word bank
  return generateWordsFromBank(count, category)
}

/**
 * Generate a word from the local word bank.
 */
function generateWordFromBank(category: WordCategory): string {
  const bank = WORD_BANKS[category] || WORD_BANKS.random
  return randomFrom(bank)
}

/**
 * Generate multiple unique words from the local word bank.
 */
function generateWordsFromBank(count: number, category: WordCategory): string[] {
  const bank = category === 'random'
    ? WORD_BANKS.random
    : [...WORD_BANKS[category], ...WORD_BANKS.random]

  const shuffled = shuffle(bank)
  const unique = [...new Set(shuffled)]
  return unique.slice(0, count)
}

/**
 * Get available word categories.
 */
export function getCategories(): WordCategory[] {
  return Object.keys(WORD_BANKS).filter(c => c !== 'random') as WordCategory[]
}
