/**
 * AI Quota Manager
 * 
 * Tracks AI API calls per session and per day.
 * Falls back to template-based evaluations when quota is exceeded.
 */

const QUOTA_KEY = 'denkmalen_ai_quota'
const DAILY_LIMIT = 20 // Max AI evaluations per day
const SESSION_LIMIT = 10 // Max AI evaluations per session

interface QuotaData {
  daily: {
    count: number
    date: string // YYYY-MM-DD
  }
  session: {
    count: number
    id: string // Random session ID
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let id = sessionStorage.getItem('denkmalen_session_id')
  if (!id) {
    id = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('denkmalen_session_id', id)
  }
  return id
}

function loadQuota(): QuotaData {
  if (typeof window === 'undefined') {
    return { daily: { count: 0, date: getToday() }, session: { count: 0, id: 'server' } }
  }

  try {
    const stored = localStorage.getItem(QUOTA_KEY)
    if (stored) {
      const data = JSON.parse(stored) as QuotaData
      
      // Reset daily count if it's a new day
      if (data.daily.date !== getToday()) {
        data.daily = { count: 0, date: getToday() }
      }
      
      // Reset session count if it's a new session
      if (data.session.id !== getSessionId()) {
        data.session = { count: 0, id: getSessionId() }
      }
      
      return data
    }
  } catch {
    // Invalid data — reset
  }

  return {
    daily: { count: 0, date: getToday() },
    session: { count: 0, id: getSessionId() }
  }
}

function saveQuota(data: QuotaData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Check if AI calls are available
 */
export function hasQuota(): boolean {
  const quota = loadQuota()
  return quota.daily.count < DAILY_LIMIT && quota.session.count < SESSION_LIMIT
}

/**
 * Get remaining quota
 */
export function getRemainingQuota(): { daily: number; session: number } {
  const quota = loadQuota()
  return {
    daily: Math.max(0, DAILY_LIMIT - quota.daily.count),
    session: Math.max(0, SESSION_LIMIT - quota.session.count)
  }
}

/**
 * Increment quota counter (call after successful AI evaluation)
 */
export function incrementQuota(): void {
  const quota = loadQuota()
  quota.daily.count++
  quota.session.count++
  saveQuota(quota)
}

/**
 * Get quota status for display
 */
export function getQuotaStatus(): {
  available: boolean
  dailyUsed: number
  dailyLimit: number
  sessionUsed: number
  sessionLimit: number
  message: string
} {
  const quota = loadQuota()
  const available = hasQuota()
  
  let message = ''
  if (!available) {
    if (quota.daily.count >= DAILY_LIMIT) {
      message = 'Daily AI limit reached. Using template feedback.'
    } else {
      message = 'Session AI limit reached. Using template feedback.'
    }
  }

  return {
    available,
    dailyUsed: quota.daily.count,
    dailyLimit: DAILY_LIMIT,
    sessionUsed: quota.session.count,
    sessionLimit: SESSION_LIMIT,
    message
  }
}

/**
 * Reset quota (for testing or admin)
 */
export function resetQuota(): void {
  saveQuota({
    daily: { count: 0, date: getToday() },
    session: { count: 0, id: getSessionId() }
  })
}