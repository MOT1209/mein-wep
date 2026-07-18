// ES imports always execute before any other top-level code in this file
// (even code written above them), so the mocked client — including its
// query-builder stub — must be built entirely *inside* the factory below;
// referencing an outer `const` here would hit it before it's initialized.
// We recover stable references afterward from the `supabase` export itself,
// once src/lib/supabase.ts has actually run against the mock.
jest.mock('@supabase/supabase-js', () => {
  const queryBuilder = {
    select: jest.fn(function (this: any) { return this }),
    eq: jest.fn(function (this: any) { return this }),
    maybeSingle: jest.fn(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  }
  return {
    createClient: jest.fn(() => ({
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => queryBuilder),
      __queryBuilder: queryBuilder,
    })),
  }
})

import { signInWithGoogle, signOut, fetchDenkmalenStats, upsertDenkmalenStats, supabase } from '@/lib/supabase'

const mockSignInWithOAuth = supabase.auth.signInWithOAuth as jest.Mock
const mockSignOut = supabase.auth.signOut as jest.Mock
const mockQueryBuilder = (supabase as any).__queryBuilder as {
  maybeSingle: jest.Mock
  upsert: jest.Mock
}

describe('supabase lib', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('signInWithGoogle starts a Google OAuth redirect', () => {
    signInWithGoogle()
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    )
  })

  it('signOut delegates to supabase auth.signOut', () => {
    signOut()
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('fetchDenkmalenStats returns the row on success', async () => {
    mockQueryBuilder.maybeSingle.mockResolvedValue({ data: { user_id: 'u1', games_played: 5 }, error: null })
    const result = await fetchDenkmalenStats('u1')
    expect(result).toEqual({ user_id: 'u1', games_played: 5 })
  })

  it('fetchDenkmalenStats returns null and swallows Supabase errors', async () => {
    mockQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const result = await fetchDenkmalenStats('u1')
    expect(result).toBeNull()
  })

  it('upsertDenkmalenStats writes the row for the given user', async () => {
    await upsertDenkmalenStats('u1', { games_played: 3 })
    expect(mockQueryBuilder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', games_played: 3 }),
      expect.objectContaining({ onConflict: 'user_id' })
    )
  })
})
