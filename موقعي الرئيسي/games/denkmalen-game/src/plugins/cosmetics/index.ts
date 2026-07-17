// ═══════════════════════════════════════════════════════════════════════════════
// Cosmetics Plugin — Avatars, frames, brushes, effects
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface CosmeticItem {
  id: string
  type: 'avatar' | 'frame' | 'brush' | 'effect' | 'badge' | 'title'
  name: string
  icon: string
  price: number
  owned: boolean
  equipped?: boolean
}

const AVATARS: CosmeticItem[] = [
  { id: 'av1', type: 'avatar', name: 'Artist', icon: '🎨', price: 0, owned: true },
  { id: 'av2', type: 'avatar', name: 'Chef', icon: '👨‍🍳', price: 100, owned: false },
  { id: 'av3', type: 'avatar', name: 'Astronaut', icon: '👨‍🚀', price: 200, owned: false },
  { id: 'av4', type: 'avatar', name: 'Robot', icon: '🤖', price: 300, owned: false },
  { id: 'av5', type: 'avatar', name: 'Wizard', icon: '🧙', price: 500, owned: false },
]

const FRAMES: CosmeticItem[] = [
  { id: 'fr1', type: 'frame', name: 'Classic', icon: '🖼️', price: 0, owned: true },
  { id: 'fr2', type: 'frame', name: 'Gold', icon: '✨', price: 150, owned: false },
  { id: 'fr3', type: 'frame', name: 'Neon', icon: '💜', price: 250, owned: false },
]

const BRUSHES: CosmeticItem[] = [
  { id: 'br1', type: 'brush', name: 'Pencil', icon: '✏️', price: 0, owned: true },
  { id: 'br2', type: 'brush', name: 'Neon Brush', icon: '💚', price: 200, owned: false },
  { id: 'br3', type: 'brush', name: 'Spray', icon: '🎨', price: 300, owned: false },
]

let items: CosmeticItem[] = [...AVATARS, ...FRAMES, ...BRUSHES]
let coins = 500 // Starting coins

function loadCosmetics(): void {
  try {
    const stored = localStorage.getItem('sketch-battle:cosmetics')
    if (stored) {
      const data = JSON.parse(stored)
      items = data.items || items
      coins = data.coins ?? coins
    }
  } catch { /* use defaults */ }
}

function saveCosmetics(): void {
  localStorage.setItem('sketch-battle:cosmetics', JSON.stringify({ items, coins }))
}

export default createPlugin(
  { id: 'cosmetics', name: 'Cosmetics', version: '1.0.0', description: 'Avatars, frames, brushes', author: 'Sketch Battle Team' },
  (ctx) => ({
    onInit: () => { loadCosmetics() },
    onActivate: () => {
      ctx.on('game:end', (data: unknown) => {
        const d = data as { score?: number }
        if (d.score && d.score >= 70) {
          coins += 10
          saveCosmetics()
        }
      })
    },
  })
)

export const getItems = (type?: string) => type ? items.filter(i => i.type === type) : items
export const getCoins = () => coins
export const buyItem = (id: string): boolean => {
  const item = items.find(i => i.id === id)
  if (!item || item.owned || coins < item.price) return false
  item.owned = true
  coins -= item.price
  saveCosmetics()
  return true
}
export const equipItem = (id: string): void => {
  const item = items.find(i => i.id === id)
  if (!item || !item.owned) return
  items.filter(i => i.type === item.type).forEach(i => i.equipped = false)
  item.equipped = true
  saveCosmetics()
}
