import { track, analytics, trackPageLoad, trackWebVitals, trackSessionStart, trackSessionEnd } from '@/lib/analytics'

// Mock window.gtag
const mockGtag = jest.fn()
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
})

describe('analytics', () => {
  beforeEach(() => {
    mockGtag.mockClear()
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('track', () => {
    it('should call gtag with event name and data', () => {
      track('test_event', { key: 'value' })
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' })
    })

    it('should call gtag without data', () => {
      track('test_event')
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', undefined)
    })

    it('should not throw in any environment', () => {
      expect(() => track('test_event', { key: 'value' })).not.toThrow()
    })

    it('should handle gtag errors gracefully', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('gtag error')
      })
      
      expect(() => track('test_event')).not.toThrow()
    })
  })

  describe('analytics events', () => {
    it('should track gameStart', () => {
      analytics.gameStart('offline', 'classic')
      expect(mockGtag).toHaveBeenCalledWith('event', 'game_start', { 
        mode: 'offline', 
        game_type: 'classic' 
      })
    })

    it('should track gameEnd', () => {
      analytics.gameEnd({
        players: 4,
        rounds: 3,
        mode: 'offline',
      })
      expect(mockGtag).toHaveBeenCalledWith('event', 'game_end', {
        players: 4,
        rounds: 3,
        mode: 'offline',
      })
    })

    it('should track drawingStart', () => {
      analytics.drawingStart('cat', 60)
      expect(mockGtag).toHaveBeenCalledWith('event', 'drawing_start', { 
        word: 'cat', 
        time_limit: 60 
      })
    })

    it('should track drawingEnd', () => {
      analytics.drawingEnd({
        word: 'cat',
        duration: 45000,
        toolUsed: 'pencil',
        strokesCount: 15,
      })
      expect(mockGtag).toHaveBeenCalledWith('event', 'drawing_end', {
        word: 'cat',
        duration: 45000,
        toolUsed: 'pencil',
        strokesCount: 15,
      })
    })

    it('should track toolSelect', () => {
      analytics.toolSelect('brush')
      expect(mockGtag).toHaveBeenCalledWith('event', 'tool_select', { tool: 'brush' })
    })

    it('should track aiEvaluationResult', () => {
      analytics.aiEvaluationResult(85, 1500)
      expect(mockGtag).toHaveBeenCalledWith('event', 'ai_evaluation_result', { 
        score: 85, 
        latency_ms: 1500 
      })
    })

    it('should track shareResult', () => {
      analytics.shareResult('native')
      expect(mockGtag).toHaveBeenCalledWith('event', 'share_result', { method: 'native' })
    })

    it('should track error', () => {
      analytics.error('network', 'Connection failed', 'api/evaluate')
      expect(mockGtag).toHaveBeenCalledWith('event', 'error', { 
        type: 'network', 
        message: 'Connection failed', 
        location: 'api/evaluate' 
      })
    })

    it('should track screenView', () => {
      analytics.screenView('menu')
      expect(mockGtag).toHaveBeenCalledWith('event', 'screen_view', { screen_name: 'menu' })
    })

    it('should track buttonClick', () => {
      analytics.buttonClick('play_now', 'menu')
      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', { 
        button_name: 'play_now', 
        location: 'menu' 
      })
    })

    it('should track pluginActivate', () => {
      analytics.pluginActivate('challenges')
      expect(mockGtag).toHaveBeenCalledWith('event', 'plugin_activate', { 
        plugin_id: 'challenges' 
      })
    })
  })

  describe('trackPageLoad', () => {
    it('should not throw when performance API is not available', () => {
      // Mock performance.getEntriesByType to return empty array
      const originalGetEntriesByType = performance.getEntriesByType
      performance.getEntriesByType = jest.fn().mockReturnValue([])
      
      expect(() => trackPageLoad()).not.toThrow()
      
      // Restore original
      performance.getEntriesByType = originalGetEntriesByType
    })
  })

  describe('session tracking', () => {
    it('should track session start', () => {
      trackSessionStart()
      expect(mockGtag).toHaveBeenCalledWith('event', 'session_start', expect.any(Object))
    })

    it('should track session end', () => {
      trackSessionStart()
      trackSessionEnd()
      expect(mockGtag).toHaveBeenCalledWith('event', 'session_end', expect.objectContaining({
        duration_ms: expect.any(Number),
        page_views: expect.any(Number),
      }))
    })
  })
})
