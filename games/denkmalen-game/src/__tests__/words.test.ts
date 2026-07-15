import { getWordList, getRandomWordFromList, getAllCategories } from '@/lib/words'

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