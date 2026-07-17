import { COLORS, BRUSH_SIZES } from '@/components/drawing/canvasUtils'

describe('Drawing Utilities', () => {
  describe('COLORS', () => {
    it('has 30 colors', () => {
      expect(COLORS).toHaveLength(30)
    })

    it('starts with black and white', () => {
      expect(COLORS[0]).toBe('#000000')
      expect(COLORS[1]).toBe('#FFFFFF')
    })

    it('all colors are valid hex', () => {
      COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })
  })

  describe('BRUSH_SIZES', () => {
    it('has 6 sizes', () => {
      expect(BRUSH_SIZES).toHaveLength(6)
    })

    it('sizes are ascending', () => {
      for (let i = 1; i < BRUSH_SIZES.length; i++) {
        expect(BRUSH_SIZES[i]).toBeGreaterThan(BRUSH_SIZES[i - 1])
      }
    })

    it('starts at 2px and ends at 30px', () => {
      expect(BRUSH_SIZES[0]).toBe(2)
      expect(BRUSH_SIZES[BRUSH_SIZES.length - 1]).toBe(30)
    })
  })
})
