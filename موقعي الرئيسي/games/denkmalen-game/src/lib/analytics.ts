/**
 * Analytics Module for Denkmalen
 * Lightweight event tracking without external dependencies
 * 
 * Usage:
 *   import { analytics } from '@/lib/analytics'
 *   analytics.gameStart('offline')
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

// ─── Core Track Function ──────────────────────────────────────────────────

/**
 * Track an analytics event
 * @param event - Event name
 * @param data - Optional event data
 */
export function track(event: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  // Send to Google Analytics 4 if available
  if (window.gtag) {
    try {
      window.gtag('event', event, data)
    } catch (err) {
      console.warn('[Analytics] Failed to send to gtag:', err)
    }
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, data || '')
  }
}

// ─── Game Events ──────────────────────────────────────────────────────────

export const analytics = {
  // ── Game Lifecycle ──────────────────────────────────────────────────
  
  /** Track game start */
  gameStart: (mode: 'offline' | 'online', gameType?: string) => 
    track('game_start', { mode, game_type: gameType }),
  
  /** Track game end */
  gameEnd: (data: { 
    players: number
    rounds: number
    winner?: string
    duration?: number
    mode: 'offline' | 'online'
  }) => track('game_end', data),
  
  /** Track round start */
  roundStart: (round: number, totalRounds: number) => 
    track('round_start', { round, total_rounds: totalRounds }),
  
  /** Track round end */
  roundEnd: (round: number, duration: number) => 
    track('round_end', { round, duration }),

  // ── Drawing Events ──────────────────────────────────────────────────
  
  /** Track drawing start */
  drawingStart: (word: string, timeLimit: number) => 
    track('drawing_start', { word, time_limit: timeLimit }),
  
  /** Track drawing end */
  drawingEnd: (data: {
    word: string
    duration: number
    toolUsed: string
    strokesCount: number
  }) => track('drawing_end', data),
  
  /** Track tool selection */
  toolSelect: (tool: string) => 
    track('tool_select', { tool }),
  
  /** Track color change */
  colorChange: (color: string) => 
    track('color_change', { color }),
  
  /** Track brush size change */
  brushSizeChange: (size: number) => 
    track('brush_size_change', { size }),

  // ── AI Events ───────────────────────────────────────────────────────
  
  /** Track AI evaluation request */
  aiEvaluationRequest: (word: string) => 
    track('ai_evaluation_request', { word }),
  
  /** Track AI evaluation result */
  aiEvaluationResult: (score: number, latencyMs: number) => 
    track('ai_evaluation_result', { score, latency_ms: latencyMs }),
  
  /** Track AI error */
  aiError: (errorType: string, word?: string) => 
    track('ai_error', { error_type: errorType, word }),

  // ── Voting Events ───────────────────────────────────────────────────
  
  /** Track manual vote */
  manualVote: (targetPlayerId: string) => 
    track('manual_vote', { target_player_id: targetPlayerId }),
  
  /** Track vote received */
  voteReceived: (drawingId: string) => 
    track('vote_received', { drawing_id: drawingId }),

  // ── Social Events ───────────────────────────────────────────────────
  
  /** Track share result */
  shareResult: (method: 'native' | 'download' | 'clipboard') => 
    track('share_result', { method }),
  
  /** Track room creation */
  roomCreate: () => 
    track('room_create'),
  
  /** Track room join */
  roomJoin: (method: 'code' | 'link') => 
    track('room_join', { method }),

  // ── UI Events ───────────────────────────────────────────────────────
  
  /** Track screen view */
  screenView: (screenName: string) => 
    track('screen_view', { screen_name: screenName }),
  
  /** Track button click */
  buttonClick: (buttonName: string, location: string) => 
    track('button_click', { button_name: buttonName, location }),
  
  /** Track settings change */
  settingsChange: (setting: string, value: unknown) => 
    track('settings_change', { setting, value }),

  // ── Plugin Events ───────────────────────────────────────────────────
  
  /** Track plugin activation */
  pluginActivate: (pluginId: string) => 
    track('plugin_activate', { plugin_id: pluginId }),
  
  /** Track plugin deactivation */
  pluginDeactivate: (pluginId: string) => 
    track('plugin_deactivate', { plugin_id: pluginId }),
  
  /** Track challenge start */
  challengeStart: (challengeId: string) => 
    track('challenge_start', { challenge_id: challengeId }),
  
  /** Track challenge completed */
  challengeComplete: (challengeId: string, completed: boolean) => 
    track('challenge_complete', { challenge_id: challengeId, completed }),

  // ── Error Events ────────────────────────────────────────────────────
  
  /** Track error */
  error: (type: string, message: string, location?: string) => 
    track('error', { type, message, location }),
  
  /** Track performance issue */
  performance: (metric: string, value: number, unit: string) => 
    track('performance', { metric, value, unit }),
}

// ─── Performance Tracking ─────────────────────────────────────────────────

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (typeof window === 'undefined' || !window.performance) return
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return
  
  const loadTime = navigation.loadEventEnd - navigation.startTime
  const domReady = navigation.domContentLoadedEventEnd - navigation.startTime
  
  analytics.performance('page_load_time', loadTime, 'ms')
  analytics.performance('dom_ready_time', domReady, 'ms')
}

/**
 * Track Web Vitals (CLS, FID, LCP)
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return
  
  // Track CLS (Cumulative Layout Shift)
  try {
    const observer = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      if (clsValue > 0) {
        analytics.performance('cls', clsValue, 'score')
      }
    })
    observer.observe({ type: 'layout-shift', buffered: true })
  } catch {
    // CLS not supported
  }
}

// ─── Session Tracking ─────────────────────────────────────────────────────

let sessionStartTime = Date.now()
let pageViews = 0

/**
 * Track session start
 */
export function trackSessionStart(): void {
  sessionStartTime = Date.now()
  pageViews = 0
  track('session_start', {
    referrer: document.referrer,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
  })
}

/**
 * Track page view
 */
export function trackPageView(screenName: string): void {
  pageViews++
  analytics.screenView(screenName)
}

/**
 * Track session end (call before unload)
 */
export function trackSessionEnd(): void {
  const duration = Date.now() - sessionStartTime
  track('session_end', {
    duration_ms: duration,
    page_views: pageViews,
  })
}

// ─── Auto-track session ───────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // Track page load performance on load
  window.addEventListener('load', () => {
    setTimeout(trackPageLoad, 100)
    trackWebVitals()
  })
  
  // Track session end on unload
  window.addEventListener('beforeunload', trackSessionEnd)
}
