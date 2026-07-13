// ═══════════════════════════════════════════════════════════════════════════════
// Community Plugin — Friends, achievements, profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface Friend {
  id: string
  name: string
  avatar: string
  online: boolean
  lastSeen: number
}

export interface Profile {
  id: string
  name: string
  avatar: string
  title: string
  level: number
  xp: number
  joinedAt: number
}

let friends: Friend[] = []
let profile: Profile = {
  id: 'player_1',
  name: 'Player',
  avatar: '🎨',
  title: 'Beginner',
  level: 1,
  xp: 0,
  joinedAt: Date.now()
}

function loadProfile(): void {
  try {
    const stored = localStorage.getItem('sketch-battle:profile')
    if (stored) profile = { ...profile, ...JSON.parse(stored) }
    const storedFriends = localStorage.getItem('sketch-battle:friends')
    if (storedFriends) friends = JSON.parse(storedFriends)
  } catch { /* use defaults */ }
}

function saveProfile(): void {
  localStorage.setItem('sketch-battle:profile', JSON.stringify(profile))
  localStorage.setItem('sketch-battle:friends', JSON.stringify(friends))
}

export default createPlugin(
  { id: 'community', name: 'Community', version: '1.0.0', description: 'Friends and profiles', author: 'Sketch Battle Team' },
  (ctx) => ({
    onInit: () => { loadProfile() },
    onActivate: () => {
      ctx.on('game:end', (data: unknown) => {
        const d = data as { score?: number }
        if (d.score) {
          profile.xp += Math.floor(d.score / 10)
          profile.level = Math.floor(profile.xp / 100) + 1
          saveProfile()
        }
      })
    },
  })
)

export const getProfile = () => ({ ...profile })
export const updateProfile = (updates: Partial<Profile>) => {
  Object.assign(profile, updates)
  saveProfile()
}
export const getFriends = () => [...friends]
export const addFriend = (friend: Friend) => {
  if (!friends.find(f => f.id === friend.id)) {
    friends.push(friend)
    saveProfile()
  }
}
export const removeFriend = (id: string) => {
  friends = friends.filter(f => f.id !== id)
  saveProfile()
}
