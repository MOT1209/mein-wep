/**
 * Offline Storage Module
 * 
 * Handles local storage of game data for offline play.
 * Stores words, game settings, and recent results.
 */

const STORAGE_PREFIX = 'denkmalen'

// Storage keys
const KEYS = {
  WORDS: `${STORAGE_PREFIX}-words`,
  SETTINGS: `${STORAGE_PREFIX}-settings`,
  RECENT_RESULTS: `${STORAGE_PREFIX}-recent-results`,
  PLAYER_PROFILES: `${STORAGE_PREFIX}-players`,
  GAME_HISTORY: `${STORAGE_PREFIX}-game-history`,
} as const

// Types
export interface OfflineWord {
  word: string
  lang: string
  category: string
  addedAt: number
}

export interface OfflineSettings {
  language: string
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  lastPlayedAt: number
}

export interface OfflineGameResult {
  id: string
  date: number
  players: { name: string; score: number }[]
  winner: string
  rounds: number
  mode: 'offline' | 'online'
}

export interface PlayerProfile {
  id: string
  name: string
  avatar: string
  createdAt: number
  lastPlayedAt: number
  gamesPlayed: number
  totalScore: number
}

// ============== Words ==============

/**
 * Save words to local storage for offline use
 */
export function saveWordsOffline(words: string[], lang: string, category: string = 'general'): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getOfflineWords(lang)
    const newWords: OfflineWord[] = words.map(word => ({
      word,
      lang,
      category,
      addedAt: Date.now(),
    }))
    
    // Merge and deduplicate
    const existingWords = new Set(existing.map(w => w.word))
    const uniqueNewWords = newWords.filter(w => !existingWords.has(w.word))
    const merged = [...existing, ...uniqueNewWords]
    
    localStorage.setItem(`${KEYS.WORDS}-${lang}`, JSON.stringify(merged))
  } catch (error) {
    console.error('[OfflineStorage] Failed to save words:', error)
  }
}

/**
 * Get offline words for a specific language
 */
export function getOfflineWords(lang: string): OfflineWord[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(`${KEYS.WORDS}-${lang}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Get a random offline word
 */
export function getRandomOfflineWord(lang: string): string | null {
  const words = getOfflineWords(lang)
  if (words.length === 0) return null
  return words[Math.floor(Math.random() * words.length)].word
}

/**
 * Get random offline words for a category
 */
export function getRandomOfflineWords(lang: string, count: number): string[] {
  const words = getOfflineWords(lang)
  if (words.length === 0) return []
  
  // Shuffle and return requested count
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(w => w.word)
}

/**
 * Clear all offline words
 */
export function clearOfflineWords(lang?: string): void {
  if (typeof window === 'undefined') return
  
  if (lang) {
    localStorage.removeItem(`${KEYS.WORDS}-${lang}`)
  } else {
    // Clear all word caches
    const keys = Object.keys(localStorage).filter(k => k.startsWith(KEYS.WORDS))
    keys.forEach(k => localStorage.removeItem(k))
  }
}

// ============== Settings ==============

/**
 * Save offline settings
 */
export function saveOfflineSettings(settings: Partial<OfflineSettings>): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getOfflineSettings()
    const merged = { ...existing, ...settings, lastPlayedAt: Date.now() }
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged))
  } catch (error) {
    console.error('[OfflineStorage] Failed to save settings:', error)
  }
}

/**
 * Get offline settings
 */
export function getOfflineSettings(): OfflineSettings {
  if (typeof window === 'undefined') {
    return {
      language: 'en',
      theme: 'system',
      soundEnabled: true,
      lastPlayedAt: Date.now(),
    }
  }
  
  try {
    const data = localStorage.getItem(KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
      language: 'en',
      theme: 'system',
      soundEnabled: true,
      lastPlayedAt: Date.now(),
    }
  } catch {
    return {
      language: 'en',
      theme: 'system',
      soundEnabled: true,
      lastPlayedAt: Date.now(),
    }
  }
}

// ============== Game Results ==============

/**
 * Save a game result
 */
export function saveGameResult(result: OfflineGameResult): void {
  if (typeof window === 'undefined') return
  
  try {
    const results = getRecentResults()
    results.unshift(result)
    
    // Keep only last 20 results
    const trimmed = results.slice(0, 20)
    localStorage.setItem(KEYS.RECENT_RESULTS, JSON.stringify(trimmed))
  } catch (error) {
    console.error('[OfflineStorage] Failed to save result:', error)
  }
}

/**
 * Get recent game results
 */
export function getRecentResults(): OfflineGameResult[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(KEYS.RECENT_RESULTS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Get statistics from recent results
 */
export function getOfflineStats() {
  const results = getRecentResults()
  
  if (results.length === 0) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      averageScore: 0,
      highestScore: 0,
      favoriteMode: 'offline',
    }
  }
  
  const gamesPlayed = results.length
  const gamesWon = results.filter(r => r.winner === 'You').length
  const allScores = results.flatMap(r => r.players.map(p => p.score))
  const averageScore = allScores.length > 0 
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) 
    : 0
  const highestScore = Math.max(...allScores, 0)
  
  // Count modes
  const modeCounts = results.reduce((acc, r) => {
    acc[r.mode] = (acc[r.mode] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const favoriteMode = Object.entries(modeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'offline'
  
  return {
    gamesPlayed,
    gamesWon,
    averageScore,
    highestScore,
    favoriteMode,
  }
}

// ============== Player Profiles ==============

/**
 * Save a player profile
 */
export function savePlayerProfile(profile: Omit<PlayerProfile, 'createdAt' | 'lastPlayedAt' | 'gamesPlayed' | 'totalScore'>): PlayerProfile {
  if (typeof window === 'undefined') {
    return {
      ...profile,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      gamesPlayed: 0,
      totalScore: 0,
    }
  }
  
  try {
    const profiles = getPlayerProfiles()
    const existing = profiles.find(p => p.id === profile.id)
    
    const updated: PlayerProfile = existing
      ? { ...existing, ...profile, lastPlayedAt: Date.now() }
      : {
          ...profile,
          createdAt: Date.now(),
          lastPlayedAt: Date.now(),
          gamesPlayed: 0,
          totalScore: 0,
        }
    
    const newProfiles = existing
      ? profiles.map(p => p.id === profile.id ? updated : p)
      : [...profiles, updated]
    
    localStorage.setItem(KEYS.PLAYER_PROFILES, JSON.stringify(newProfiles))
    return updated
  } catch (error) {
    console.error('[OfflineStorage] Failed to save profile:', error)
    return {
      ...profile,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      gamesPlayed: 0,
      totalScore: 0,
    }
  }
}

/**
 * Get all player profiles
 */
export function getPlayerProfiles(): PlayerProfile[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(KEYS.PLAYER_PROFILES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * Update player stats after a game
 */
export function updatePlayerStats(playerId: string, score: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const profiles = getPlayerProfiles()
    const profile = profiles.find(p => p.id === playerId)
    
    if (profile) {
      const updated: PlayerProfile = {
        ...profile,
        lastPlayedAt: Date.now(),
        gamesPlayed: profile.gamesPlayed + 1,
        totalScore: profile.totalScore + score,
      }
      
      const newProfiles = profiles.map(p => p.id === playerId ? updated : p)
      localStorage.setItem(KEYS.PLAYER_PROFILES, JSON.stringify(newProfiles))
    }
  } catch (error) {
    console.error('[OfflineStorage] Failed to update stats:', error)
  }
}

// ============== Storage Management ==============

/**
 * Get total storage usage in bytes
 */
export function getStorageUsage(): number {
  if (typeof window === 'undefined') return 0
  
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key) || ''
      total += key.length + value.length
    }
  }
  return total * 2 // UTF-16 characters = 2 bytes each
}

/**
 * Get storage usage in a human-readable format
 */
export function getStorageUsageFormatted(): string {
  const bytes = getStorageUsage()
  
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Clear all offline storage
 */
export function clearAllOfflineStorage(): void {
  if (typeof window === 'undefined') return
  
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}

/**
 * Check if storage quota is available
 */
export function hasStorageQuota(estimatedBytes: number = 1024 * 1024): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Try to write a test value
    const testKey = `${STORAGE_PREFIX}-quota-test`
    localStorage.setItem(testKey, 'x'.repeat(estimatedBytes))
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// ============== Word Database Preloading ==============

/**
 * Preload default words for offline use
 * This should be called during app initialization
 */
export function preloadDefaultWords(): void {
  if (typeof window === 'undefined') return
  
  // Only preload if we don't have any words yet
  const enWords = getOfflineWords('en')
  if (enWords.length > 0) return
  
  // Default word lists
  const defaultWords: Record<string, string[]> = {
    en: [
      // Animals
      'cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'bear', 'elephant',
      // Food
      'pizza', 'burger', 'sushi', 'cake', 'apple', 'banana', 'coffee',
      // Objects
      'house', 'car', 'tree', 'sun', 'moon', 'star', 'book', 'phone',
      // Actions
      'run', 'jump', 'swim', 'dance', 'sing', 'draw', 'read', 'write',
      // Nature
      'mountain', 'river', 'ocean', 'forest', 'desert', 'island', 'cloud',
    ],
    ar: [
      'قطة', 'كلب', 'طائر', 'سمكة', 'أسد', 'نمر', 'دب', 'فيل',
      'بيت', 'سيارة', 'شجرة', 'شمس', 'قمر', 'نجمة', 'كتاب', 'هاتف',
      'جبال', 'نهر', 'محيط', 'غابة', 'صحراء', 'جزيرة', 'غيمة',
    ],
    de: [
      'Katze', 'Hund', 'Vogel', 'Fisch', 'Löwe', 'Tiger', 'Bär', 'Elefant',
      'Haus', 'Auto', 'Baum', 'Sonne', 'Mond', 'Stern', 'Buch', 'Telefon',
      'Berg', 'Fluss', 'Ozean', 'Wald', 'Wüste', 'Insel', 'Wolke',
    ],
  }
  
  Object.entries(defaultWords).forEach(([lang, words]) => {
    saveWordsOffline(words, lang, 'default')
  })
}
