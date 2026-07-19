// ═══════════════════════════════════════════════════════════════════════════════
// Test: Simple Plugins — Community, Replay, Settings, Statistics, Teams, Tournaments
// ═══════════════════════════════════════════════════════════════════════════════

// Mock game store
jest.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      settings: { sound: true, music: true },
    })),
  },
}))

// ─── Community Plugin ────────────────────────────────────────────────────────

import {
  getProfile,
  updateProfile,
  getFriends,
  addFriend,
  removeFriend,
} from '@/plugins/community/index'

// ─── Replay Plugin ───────────────────────────────────────────────────────────

import {
  getCurrentReplay,
  isRecordingActive,
  getReplayDuration,
} from '@/plugins/replay/index'

// ─── Settings Plugin ─────────────────────────────────────────────────────────

import {
  getSettings,
  updateSettings,
  getTranslation,
} from '@/plugins/settings/index'

// ─── Statistics Plugin ───────────────────────────────────────────────────────

import {
  getStats,
  getAchievements,
} from '@/plugins/statistics/index'

// ─── Teams Plugin ────────────────────────────────────────────────────────────

import {
  createTeam,
  joinTeam,
  getTeams,
  getTeamScore,
} from '@/plugins/teams/index'

// ─── Tournaments Plugin ──────────────────────────────────────────────────────

import {
  getTournaments,
  getActiveTournament,
} from '@/plugins/tournaments/index'

jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  localStorage.clear()
})

// ═══════════════════════════════════════════════════════════════════════════════
// Community Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Community Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/community/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('community')
  })

  it('getProfile returns profile object', () => {
    const profile = getProfile()
    expect(profile).toHaveProperty('id')
    expect(profile).toHaveProperty('name')
    expect(profile).toHaveProperty('avatar')
    expect(profile).toHaveProperty('title')
    expect(profile).toHaveProperty('level')
    expect(profile).toHaveProperty('xp')
  })

  it('updateProfile updates profile fields', () => {
    updateProfile({ name: 'Rashid', level: 5 })
    const profile = getProfile()
    expect(profile.name).toBe('Rashid')
    expect(profile.level).toBe(5)
  })

  it('getFriends returns empty array initially', () => {
    const friends = getFriends()
    expect(Array.isArray(friends)).toBe(true)
  })

  it('addFriend adds a friend', () => {
    addFriend({ id: 'f1', name: 'Friend1', avatar: '🎨', online: true, lastSeen: Date.now() })
    const friends = getFriends()
    expect(friends.length).toBeGreaterThanOrEqual(1)
  })

  it('addFriend does not add duplicate', () => {
    const friend = { id: 'f1', name: 'Friend1', avatar: '🎨', online: true, lastSeen: Date.now() }
    addFriend(friend)
    addFriend(friend)
    const friends = getFriends()
    const f1s = friends.filter(f => f.id === 'f1')
    expect(f1s).toHaveLength(1)
  })

  it('removeFriend removes a friend', () => {
    addFriend({ id: 'f1', name: 'Friend1', avatar: '🎨', online: true, lastSeen: Date.now() })
    removeFriend('f1')
    const friends = getFriends()
    expect(friends.find(f => f.id === 'f1')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Replay Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Replay Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/replay/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('replay')
  })

  it('getCurrentReplay returns array', () => {
    const replay = getCurrentReplay()
    expect(Array.isArray(replay)).toBe(true)
  })

  it('isRecordingActive returns boolean', () => {
    expect(typeof isRecordingActive()).toBe('boolean')
  })

  it('getReplayDuration returns number', () => {
    expect(typeof getReplayDuration()).toBe('number')
  })

  it('isRecordingActive is false initially', () => {
    expect(isRecordingActive()).toBe(false)
  })

  it('getReplayDuration is 0 when not recording', () => {
    expect(getReplayDuration()).toBe(0)
  })

  it('getCurrentReplay returns empty array initially', () => {
    expect(getCurrentReplay()).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Settings Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Settings Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/settings/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('settings')
  })

  it('getSettings returns default settings', () => {
    const settings = getSettings()
    expect(settings).toHaveProperty('language')
    expect(settings).toHaveProperty('theme')
    expect(settings).toHaveProperty('sound')
    expect(settings).toHaveProperty('music')
    expect(settings).toHaveProperty('vibration')
    expect(settings).toHaveProperty('drawingTime')
    expect(settings).toHaveProperty('rounds')
    expect(settings).toHaveProperty('drawingQuality')
  })

  it('default settings have correct values', () => {
    const settings = getSettings()
    expect(settings.language).toBe('en')
    expect(settings.theme).toBe('system')
    expect(settings.sound).toBe(true)
    expect(settings.music).toBe(true)
    expect(settings.vibration).toBe(true)
    expect(settings.drawingTime).toBe(60)
    expect(settings.rounds).toBe(3)
    expect(settings.drawingQuality).toBe('high')
  })

  it('updateSettings changes settings', () => {
    updateSettings({ language: 'de', drawingTime: 30 })
    const settings = getSettings()
    expect(settings.language).toBe('de')
    expect(settings.drawingTime).toBe(30)
  })

  it('getTranslation returns translation for key', () => {
    const translation = getTranslation('menu.play')
    expect(typeof translation).toBe('string')
    expect(translation.length).toBeGreaterThan(0)
  })

  it('getTranslation falls back for unknown key', () => {
    const result = getTranslation('unknown.key.12345')
    expect(result).toBe('unknown.key.12345')
  })

  it('updateSettings persists to localStorage', () => {
    updateSettings({ rounds: 5 })
    expect(localStorage.setItem).toHaveBeenCalled()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Statistics Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Statistics Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/statistics/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('statistics')
  })

  it('getStats returns default stats', () => {
    const stats = getStats()
    expect(stats).toHaveProperty('gamesPlayed')
    expect(stats).toHaveProperty('wins')
    expect(stats).toHaveProperty('totalScore')
    expect(stats).toHaveProperty('highestScore')
    expect(stats).toHaveProperty('averageScore')
    expect(stats).toHaveProperty('winStreak')
    expect(stats).toHaveProperty('bestWinStreak')
    expect(stats).toHaveProperty('totalDrawingTime')
    expect(stats).toHaveProperty('totalVotes')
  })

  it('default stats are zeroed', () => {
    const stats = getStats()
    expect(stats.gamesPlayed).toBe(0)
    expect(stats.wins).toBe(0)
    expect(stats.totalScore).toBe(0)
    expect(stats.highestScore).toBe(0)
    expect(stats.winStreak).toBe(0)
  })

  it('getAchievements returns array of achievements', () => {
    const achievements = getAchievements()
    expect(Array.isArray(achievements)).toBe(true)
    expect(achievements.length).toBeGreaterThan(0)
  })

  it('achievements have correct structure', () => {
    const achievements = getAchievements()
    achievements.forEach(ach => {
      expect(ach).toHaveProperty('id')
      expect(ach).toHaveProperty('name')
      expect(ach).toHaveProperty('description')
      expect(ach).toHaveProperty('icon')
      expect(ach).toHaveProperty('unlocked')
    })
  })

  it('achievements are initially locked', () => {
    const achievements = getAchievements()
    achievements.forEach(ach => {
      expect(ach.unlocked).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Teams Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Teams Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/teams/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('teams')
  })

  it('createTeam creates a team', () => {
    const team = createTeam('Red Team', '#FF0000', '🔴')
    expect(team).toHaveProperty('id')
    expect(team.name).toBe('Red Team')
    expect(team.color).toBe('#FF0000')
    expect(team.icon).toBe('🔴')
    expect(team.members).toHaveLength(0)
    expect(team.score).toBe(0)
  })

  it('getTeams returns all teams', () => {
    const team = createTeam('Blue Team', '#0000FF', '🔵')
    const teams = getTeams()
    expect(teams.length).toBeGreaterThanOrEqual(1)
  })

  it('joinTeam adds player to team', () => {
    const team = createTeam('Green Team', '#00FF00', '🟢')
    const result = joinTeam(team.id, 'player1')
    expect(result).toBe(true)
    const teams = getTeams()
    const found = teams.find(t => t.id === team.id)
    expect(found?.members).toContain('player1')
  })

  it('joinTeam returns false for non-existent team', () => {
    expect(joinTeam('nonexistent', 'player1')).toBe(false)
  })

  it('joinTeam sets leader for first member', () => {
    const team = createTeam('Yellow Team', '#FFFF00', '🟡')
    joinTeam(team.id, 'player1')
    const teams = getTeams()
    const found = teams.find(t => t.id === team.id)
    expect(found?.leader).toBe('player1')
  })

  it('getTeamScore returns 0 for non-existent team', () => {
    expect(getTeamScore('nonexistent')).toBe(0)
  })

  it('getTeamScore returns team score', () => {
    const team = createTeam('Purple Team', '#800080', '🟣')
    expect(getTeamScore(team.id)).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// Tournaments Plugin
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tournaments Plugin', () => {
  it('should export default plugin factory', () => {
    const pluginFactory = require('@/plugins/tournaments/index').default
    expect(pluginFactory).toBeDefined()
    expect(typeof pluginFactory.create).toBe('function')
    const plugin = pluginFactory.create()
    expect(plugin.manifest.id).toBe('tournaments')
  })

  it('getTournaments returns array', () => {
    const tournaments = getTournaments()
    expect(Array.isArray(tournaments)).toBe(true)
  })

  it('getTournaments has default tournament', () => {
    const tournaments = getTournaments()
    expect(tournaments.length).toBeGreaterThan(0)
  })

  it('tournament has correct structure', () => {
    const tournaments = getTournaments()
    const t = tournaments[0]
    expect(t).toHaveProperty('id')
    expect(t).toHaveProperty('name')
    expect(t).toHaveProperty('description')
    expect(t).toHaveProperty('season')
    expect(t).toHaveProperty('startDate')
    expect(t).toHaveProperty('endDate')
    expect(t).toHaveProperty('prizes')
    expect(t).toHaveProperty('participants')
    expect(t).toHaveProperty('status')
    expect(t).toHaveProperty('leaderboard')
  })

  it('getActiveTournament returns active tournament', () => {
    const active = getActiveTournament()
    if (active) {
      expect(active.status).toBe('active')
    }
  })

  it('tournament status is valid', () => {
    const tournaments = getTournaments()
    tournaments.forEach(t => {
      expect(['upcoming', 'active', 'ended']).toContain(t.status)
    })
  })

  it('tournament prizes is array', () => {
    const tournaments = getTournaments()
    tournaments.forEach(t => {
      expect(Array.isArray(t.prizes)).toBe(true)
    })
  })

  it('tournament leaderboard is array', () => {
    const tournaments = getTournaments()
    tournaments.forEach(t => {
      expect(Array.isArray(t.leaderboard)).toBe(true)
    })
  })
})
