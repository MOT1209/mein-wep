// ═══════════════════════════════════════════════════════════════════════════════
// Tournaments Plugin — Competitions and seasons
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface Tournament {
  id: string
  name: string
  description: string
  season: number
  startDate: number
  endDate: number
  prizes: string[]
  participants: number
  status: 'upcoming' | 'active' | 'ended'
  leaderboard: Array<{ rank: number; name: string; score: number }>
}

let tournaments: Tournament[] = [
  {
    id: 'daily_1',
    name: 'Daily Sketch Challenge',
    description: 'Compete in today\'s drawing challenge!',
    season: 1,
    startDate: Date.now(),
    endDate: Date.now() + 86400000,
    prizes: ['🥇 1000 coins', '🥈 500 coins', '🥉 250 coins'],
    participants: 0,
    status: 'active',
    leaderboard: []
  }
]

export default createPlugin(
  { id: 'tournaments', name: 'Tournaments', version: '1.0.0', description: 'Competitions and seasons', author: 'Sketch Battle Team' },
  (ctx) => ({
    onActivate: () => {
      // Auto-update tournament status
      tournaments.forEach(t => {
        if (Date.now() < t.startDate) t.status = 'upcoming'
        else if (Date.now() > t.endDate) t.status = 'ended'
        else t.status = 'active'
      })
    },
  })
)

export const getTournaments = () => tournaments
export const getActiveTournament = () => tournaments.find(t => t.status === 'active')
