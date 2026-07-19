import { COLORS, BRUSH_SIZES } from '@/components/drawing/canvasUtils'

describe('canvasUtils', () => {
  describe('COLORS', () => {
    it('exports color palette', () => {
      expect(COLORS).toBeDefined()
      expect(Array.isArray(COLORS)).toBe(true)
      expect(COLORS.length).toBeGreaterThan(0)
    })

    it('contains valid hex colors', () => {
      COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  describe('BRUSH_SIZES', () => {
    it('exports brush sizes', () => {
      expect(BRUSH_SIZES).toBeDefined()
      expect(Array.isArray(BRUSH_SIZES)).toBe(true)
      expect(BRUSH_SIZES.length).toBeGreaterThan(0)
    })

    it('contains valid numbers', () => {
      BRUSH_SIZES.forEach(size => {
        expect(typeof size).toBe('number')
        expect(size).toBeGreaterThan(0)
      })
    })
  })
})
