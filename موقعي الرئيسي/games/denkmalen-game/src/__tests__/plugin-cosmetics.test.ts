// ═══════════════════════════════════════════════════════════════════════════════
// Test: Cosmetics Plugin — Items, Buy, Equip
// ═══════════════════════════════════════════════════════════════════════════════

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      settings: { sound: true, music: true },
    })),
  },
}))

import {
  getItems,
  getCoins,
  buyItem,
  equipItem,
} from '@/plugins/cosmetics/index'

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Cosmetics Plugin', () => {
  beforeEach(() => {
    // Reset localStorage to clear any saved cosmetics
    localStorage.clear()
  })

  it('should export default cosmetics plugin factory', () => {
    const cosmeticsPluginFactory = require('@/plugins/cosmetics/index').default
    expect(cosmeticsPluginFactory).toBeDefined()
    expect(typeof cosmeticsPluginFactory.create).toBe('function')
    const plugin = cosmeticsPluginFactory.create()
    expect(plugin.manifest.id).toBe('cosmetics')
  })

  it('should have lifecycle methods when created', () => {
    const plugin = require('@/plugins/cosmetics/index').default.create()
    expect(typeof plugin.onInit).toBe('function')
    expect(typeof plugin.onActivate).toBe('function')
  })

  describe('getItems', () => {
    it('should return all items by default', () => {
      const items = getItems()
      expect(items.length).toBeGreaterThan(0)
    })

    it('should filter by type "avatar"', () => {
      const avatars = getItems('avatar')
      expect(avatars.length).toBeGreaterThan(0)
      avatars.forEach(item => expect(item.type).toBe('avatar'))
    })

    it('should filter by type "frame"', () => {
      const frames = getItems('frame')
      expect(frames.length).toBeGreaterThan(0)
      frames.forEach(item => expect(item.type).toBe('frame'))
    })

    it('should filter by type "brush"', () => {
      const brushes = getItems('brush')
      expect(brushes.length).toBeGreaterThan(0)
      brushes.forEach(item => expect(item.type).toBe('brush'))
    })

    it('should return items with correct structure', () => {
      const items = getItems()
      items.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('icon')
        expect(item).toHaveProperty('price')
        expect(item).toHaveProperty('owned')
      })
    })
  })

  describe('getCoins', () => {
    it('should return starting coins (500)', () => {
      expect(getCoins()).toBe(500)
    })
  })

  describe('equipItem', () => {
    it('should equip an owned item', () => {
      equipItem('av1') // av1 is owned by default
      const avatars = getItems('avatar')
      const av1 = avatars.find(a => a.id === 'av1')
      expect(av1?.equipped).toBe(true)
    })

    it('should only equip one item per type', () => {
      equipItem('av1')
      equipItem('av1') // equip same item again
      const avatars = getItems('avatar')
      const equipped = avatars.filter(a => a.equipped)
      expect(equipped).toHaveLength(1)
      expect(equipped[0].id).toBe('av1')
    })

    it('should equip frame items', () => {
      equipItem('fr1')
      const frames = getItems('frame')
      const fr1 = frames.find(f => f.id === 'fr1')
      expect(fr1?.equipped).toBe(true)
    })

    it('should equip brush items', () => {
      equipItem('br1')
      const brushes = getItems('brush')
      const br1 = brushes.find(b => b.id === 'br1')
      expect(br1?.equipped).toBe(true)
    })
  })

  describe('buyItem', () => {
    it('should return false for non-existent item', () => {
      expect(buyItem('nonexistent')).toBe(false)
    })

    it('should buy an owned item returns false', () => {
      // av1 is owned by default, buying it should return false
      expect(buyItem('av1')).toBe(false)
    })

    it('should buy an affordable unowned item', () => {
      // av2 costs 100, starting with 500
      const result = buyItem('av2')
      expect(result).toBe(true)
      const avatars = getItems('avatar')
      const av2 = avatars.find(a => a.id === 'av2')
      expect(av2?.owned).toBe(true)
      expect(getCoins()).toBe(400) // 500 - 100
    })

    it('should not buy if not enough coins', () => {
      // Try to buy expensive item
      const expensiveItem = getItems().find(i => i.price > 500)
      if (expensiveItem) {
        expect(buyItem(expensiveItem.id)).toBe(false)
      }
    })

    it('should deduct coins after purchase', () => {
      const initialCoins = getCoins()
      buyItem('fr2')
      expect(getCoins()).toBe(initialCoins - 150)
    })
  })
})
