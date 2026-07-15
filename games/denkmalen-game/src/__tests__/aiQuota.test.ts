import { hasQuota, getRemainingQuota, incrementQuota, getQuotaStatus, resetQuota } from '@/lib/aiQuota'

describe('aiQuota', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('hasQuota', () => {
    it('returns true when no quota used', () => {
      expect(hasQuota()).toBe(true)
    })

    it('returns false after exceeding daily limit', () => {
      // Simulate 20 calls
      for (let i = 0; i < 20; i++) {
        incrementQuota()
      }
      expect(hasQuota()).toBe(false)
    })

    it('returns false after exceeding session limit', () => {
      // Simulate 10 calls
      for (let i = 0; i < 10; i++) {
        incrementQuota()
      }
      expect(hasQuota()).toBe(false)
    })
  })

  describe('getRemainingQuota', () => {
    it('returns full quota initially', () => {
      const quota = getRemainingQuota()
      expect(quota.daily).toBe(20)
      expect(quota.session).toBe(10)
    })

    it('decrements after incrementing', () => {
      incrementQuota()
      const quota = getRemainingQuota()
      expect(quota.daily).toBe(19)
      expect(quota.session).toBe(9)
    })
  })

  describe('getQuotaStatus', () => {
    it('returns correct initial status', () => {
      const status = getQuotaStatus()
      expect(status.available).toBe(true)
      expect(status.dailyUsed).toBe(0)
      expect(status.dailyLimit).toBe(20)
      expect(status.sessionUsed).toBe(0)
      expect(status.sessionLimit).toBe(10)
      expect(status.message).toBe('')
    })

    it('shows correct message when daily limit exceeded', () => {
      for (let i = 0; i < 20; i++) {
        incrementQuota()
      }
      const status = getQuotaStatus()
      expect(status.available).toBe(false)
      expect(status.message).toContain('Daily AI limit')
    })

    it('shows correct message when session limit exceeded', () => {
      for (let i = 0; i < 10; i++) {
        incrementQuota()
      }
      const status = getQuotaStatus()
      expect(status.available).toBe(false)
      expect(status.message).toContain('Session AI limit')
    })
  })

  describe('resetQuota', () => {
    it('resets quota to initial state', () => {
      // Use some quota
      for (let i = 0; i < 5; i++) {
        incrementQuota()
      }
      
      // Reset
      resetQuota()
      
      // Check it's reset
      const quota = getRemainingQuota()
      expect(quota.daily).toBe(20)
      expect(quota.session).toBe(10)
    })
  })
})