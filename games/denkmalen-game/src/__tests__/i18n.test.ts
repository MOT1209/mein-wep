import { t, LANGUAGE_OPTIONS } from '@/lib/i18n'

describe('i18n', () => {
  describe('t function', () => {
    it('returns English translation for known key', () => {
      const result = t('menu.title', 'en')
      expect(result).toBe('Denkmalen')
    })

    it('returns Arabic translation for known key', () => {
      const result = t('menu.title', 'ar')
      expect(result).toBe('دنكمالن')
    })

    it('returns German translation for known key', () => {
      const result = t('menu.title', 'de')
      expect(result).toBe('Denkmalen')
    })

    it('falls back to English for unknown language', () => {
      const result = t('menu.title', 'fr' as any)
      expect(result).toBe('Denkmalen')
    })

    it('returns key itself for unknown key', () => {
      const result = t('unknown.key', 'en')
      expect(result).toBe('unknown.key')
    })

    it('defaults to English when no language specified', () => {
      const result = t('menu.play')
      expect(result).toBe('Play')
    })

    it('handles all menu keys', () => {
      const menuKeys = [
        'menu.title',
        'menu.offline',
        'menu.online',
        'menu.leaderboard',
        'menu.statistics',
        'menu.settings',
        'menu.play',
      ]

      menuKeys.forEach(key => {
        expect(t(key, 'en')).toBeDefined()
        expect(t(key, 'ar')).toBeDefined()
        expect(t(key, 'de')).toBeDefined()
      })
    })

    it('handles all common keys', () => {
      const commonKeys = [
        'common.back',
        'common.next',
        'common.start',
        'common.home',
        'common.playAgain',
        'common.cancel',
        'common.confirm',
        'common.loading',
      ]

      commonKeys.forEach(key => {
        const en = t(key, 'en')
        const ar = t(key, 'ar')
        const de = t(key, 'de')
        
        expect(en).not.toBe(key) // Should have translation
        expect(ar).not.toBe(key)
        expect(de).not.toBe(key)
      })
    })
  })

  describe('LANGUAGE_OPTIONS', () => {
    it('contains 3 languages', () => {
      expect(LANGUAGE_OPTIONS).toHaveLength(3)
    })

    it('has English', () => {
      const en = LANGUAGE_OPTIONS.find(l => l.code === 'en')
      expect(en).toBeDefined()
      expect(en?.label).toBe('English')
      expect(en?.flag).toBe('🇬🇧')
    })

    it('has Arabic', () => {
      const ar = LANGUAGE_OPTIONS.find(l => l.code === 'ar')
      expect(ar).toBeDefined()
      expect(ar?.label).toBe('العربية')
    })

    it('has German', () => {
      const de = LANGUAGE_OPTIONS.find(l => l.code === 'de')
      expect(de).toBeDefined()
      expect(de?.label).toBe('Deutsch')
    })
  })
})