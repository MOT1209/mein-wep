import { FEATURES } from '@/lib/flags'

describe('FEATURES', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('has onlineMode flag', () => {
    expect(FEATURES).toHaveProperty('onlineMode')
    expect(typeof FEATURES.onlineMode).toBe('boolean')
  })

  it('has leaderboard flag', () => {
    expect(FEATURES).toHaveProperty('leaderboard')
    expect(typeof FEATURES.leaderboard).toBe('boolean')
  })

  it('has statistics flag', () => {
    expect(FEATURES).toHaveProperty('statistics')
    expect(typeof FEATURES.statistics).toBe('boolean')
  })

  it('onlineMode defaults to false', () => {
    delete process.env.NEXT_PUBLIC_FEATURE_ONLINE_MODE
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.onlineMode).toBe(false)
  })

  it('onlineMode can be enabled', () => {
    process.env.NEXT_PUBLIC_FEATURE_ONLINE_MODE = 'true'
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.onlineMode).toBe(true)
  })

  it('leaderboard defaults to true', () => {
    delete process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.leaderboard).toBe(true)
  })

  it('leaderboard can be disabled', () => {
    process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD = 'false'
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.leaderboard).toBe(false)
  })

  it('statistics defaults to true', () => {
    delete process.env.NEXT_PUBLIC_FEATURE_STATISTICS
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.statistics).toBe(true)
  })

  it('statistics can be disabled', () => {
    process.env.NEXT_PUBLIC_FEATURE_STATISTICS = 'false'
    const { FEATURES } = require('@/lib/flags')
    expect(FEATURES.statistics).toBe(false)
  })
})