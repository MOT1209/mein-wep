import { getWordList, getRandomWordFromList, getAllCategories } from '@/lib/words'
import { getLetters, getRandomCreativePrompt, CREATIVE_PROMPTS } from '@/store/gameStore'

describe('language-aware game content', () => {
  describe('getLetters', () => {
    it('returns Arabic alphabet for Arabic', () => {
      const letters = getLetters('ar')
      expect(letters).toContain('ب')
      expect(letters).not.toContain('A')
    })

    it('returns Latin alphabet for English and German', () => {
      expect(getLetters('en')).toContain('A')
      expect(getLetters('de')).toContain('Z')
    })
  })

  describe('creative prompts', () => {
    it('has 20 native prompts per language', () => {
      expect(CREATIVE_PROMPTS.en).toHaveLength(20)
      expect(CREATIVE_PROMPTS.ar).toHaveLength(20)
      expect(CREATIVE_PROMPTS.de).toHaveLength(20)
    })

    it('returns an Arabic prompt when Arabic is requested', () => {
      const prompt = getRandomCreativePrompt('ar')
      expect(CREATIVE_PROMPTS.ar).toContain(prompt)
      expect(/[؀-ۿ]/.test(prompt)).toBe(true)
    })

    it('returns a German prompt when German is requested', () => {
      const prompt = getRandomCreativePrompt('de')
      expect(CREATIVE_PROMPTS.de).toContain(prompt)
    })
  })
})

describe('words', () => {
  describe('getWordList', () => {
    it('returns English word list', () => {
      const list = getWordList('en')
      expect(list).toBeDefined()
      expect(list.animals).toBeDefined()
      expect(list.food).toBeDefined()
      expect(list.nature).toBeDefined()
    })

    it('returns Arabic word list', () => {
      const list = getWordList('ar')
      expect(list).toBeDefined()
      expect(list.animals).toBeDefined()
      expect(list.food).toBeDefined()
    })

    it('returns German word list', () => {
      const list = getWordList('de')
      expect(list).toBeDefined()
      expect(list.animals).toBeDefined()
      expect(list.food).toBeDefined()
    })

    it('falls back to English for unknown language', () => {
      const list = getWordList('fr' as any)
      const enList = getWordList('en')
      expect(list).toEqual(enList)
    })
  })

  describe('getRandomWordFromList', () => {
    it('returns a word from English animals', () => {
      const word = getRandomWordFromList('en', 'animals')
      expect(word).toBeDefined()
      expect(word?.word).toBeDefined()
      expect(word?.emoji).toBeDefined()
      expect(word?.difficulty).toBeDefined()
    })

    it('returns null for empty category', () => {
      const word = getRandomWordFromList('en', 'nonexistent')
      expect(word).toBeNull()
    })

    it('returns different words on multiple calls', () => {
      const words = new Set<string>()
      for (let i = 0; i < 20; i++) {
        const word = getRandomWordFromList('en', 'animals')
        if (word) words.add(word.word)
      }
      // Should have at least a few different words
      expect(words.size).toBeGreaterThan(1)
    })
  })

  describe('getAllCategories', () => {
    it('returns categories for English', () => {
      const categories = getAllCategories('en')
      expect(categories).toContain('animals')
      expect(categories).toContain('food')
      expect(categories).toContain('nature')
      expect(categories.length).toBeGreaterThan(5)
    })

    it('returns categories for Arabic', () => {
      const categories = getAllCategories('ar')
      expect(categories).toContain('animals')
      expect(categories).toContain('food')
    })

    it('returns categories for German', () => {
      const categories = getAllCategories('de')
      expect(categories).toContain('animals')
      expect(categories).toContain('food')
    })
  })

  describe('Word structure', () => {
    it('each word has required fields', () => {
      const list = getWordList('en')
      
      Object.values(list).forEach(category => {
        category.forEach(word => {
          expect(word.word).toBeDefined()
          expect(typeof word.word).toBe('string')
          expect(word.word.length).toBeGreaterThan(0)
          
          expect(word.emoji).toBeDefined()
          expect(typeof word.emoji).toBe('string')
          
          expect(['easy', 'medium', 'hard']).toContain(word.difficulty)
        })
      })
    })
  })
})