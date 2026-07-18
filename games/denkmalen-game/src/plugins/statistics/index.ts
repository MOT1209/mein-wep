// ═══════════════════════════════════════════════════════════════════════════════
// Statistics Plugin — Track player stats and achievements
// ═══════════════════════════════════════════════════════════════════════════════

import { createPlugin } from '@/plugin-system/base'

export interface GameStats {
  gamesPlayed: number
  wins: number
  totalScore: number
  highestScore: number
  favoriteGameType: string
  favoriteCategory: string
  totalDrawingTime: number
  totalVotes: number
  averageScore: number
  winStreak: number
  bestWinStreak: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  totalScore: 0,
  highestScore: 0,
  favoriteGameType: 'classic',
  favoriteCategory: 'random',
  totalDrawingTime: 0,
  totalVotes: 0,
  averageScore: 0,
  winStreak: 0,
  bestWinStreak: 0,
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: 'First Steps', description: 'Play your first game', icon: '🎯', unlocked: false },
  { id: 'first_win', name: 'Winner!', description: 'Win your first game', icon: '🏆', unlocked: false },
  { id: 'five_wins', name: 'On Fire', description: 'Win 5 games', icon: '🔥', unlocked: false },
  { id: 'ten_games', name: 'Veteran', description: 'Play 10 games', icon: '⭐', unlocked: false },
  { id: 'high_score', name: 'Perfect!', description: 'Score 100 points', icon: '💯', unlocked: false },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Win with less than 10 seconds left', icon: '⚡', unlocked: false },
  { id: 'artist', name: 'Artist', description: 'Get 90+ AI score', icon: '🎨', unlocked: false },
  { id: 'social', name: 'Social Butterfly', description: 'Play online 5 times', icon: '🦋', unlocked: false },
]

let stats: GameStats = { ...DEFAULT_STATS }
let achievements: Achievement[] = [...ACHIEVEMENTS]

function loadStats(): void {
  try {
    const stored = localStorage.getItem('sketch-battle:stats')
    if (stored) stats = { ...DEFAULT_STATS, ...JSON.parse(stored) }
    const storedAch = localStorage.getItem('sketch-battle:achievements')
    if (storedAch) achievements = JSON.parse(storedAch)
  } catch { /* use defaults */ }
}

function saveStats(): void {
  localStorage.setItem('sketch-battle:stats', JSON.stringify(stats))
  localStorage.setItem('sketch-battle:achievements', JSON.stringify(achievements))
}

function unlockAchievement(id: string): void {
  const ach = achievements.find(a => a.id === id)
  if (ach && !ach.unlocked) {
    ach.unlocked = true
    ach.unlockedAt = Date.now()
    saveStats()
  }
}

export default createPlugin(
  { id: 'statistics', name: 'Statistics', version: '1.0.0', description: 'Track player stats and achievements', author: 'Sketch Battle Team' },
  (ctx) => ({
    onInit: () => { loadStats() },
    onActivate: () => {
      ctx.on('game:start', () => { stats.gamesPlayed++ })
      ctx.on('game:vote:cast', () => { stats.totalVotes++ })
      ctx.on('game:end', (data: unknown) => {
        const d = data as { score?: number; winner?: boolean; drawingTime?: number }
        if (d.score) {
          stats.totalScore += d.score
          stats.highestScore = Math.max(stats.highestScore, d.score)
          stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed)
        }
        if (d.winner) {
          stats.wins++
          stats.winStreak++
          stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.winStreak)
        } else {
          stats.winStreak = 0
        }
        if (d.drawingTime) stats.totalDrawingTime += d.drawingTime
        saveStats()
        ctx.emit('statistics:updated', stats)
      })
      // Check achievements
      ctx.on('game:end', () => {
        if (stats.gamesPlayed >= 1) unlockAchievement('first_game')
        if (stats.wins >= 1) unlockAchievement('first_win')
        if (stats.wins >= 5) unlockAchievement('five_wins')
        if (stats.gamesPlayed >= 10) unlockAchievement('ten_games')
        if (stats.highestScore >= 100) unlockAchievement('high_score')
        if (stats.winStreak >= 3) unlockAchievement('speed_demon')
      })
    },
  })
)

export const getStats = () => ({ ...stats })
export const getAchievements = () => [...achievements]
