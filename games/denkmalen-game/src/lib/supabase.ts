/**
 * Supabase client for Denkmalen — reuses the site's main project so that
 * signing in here uses the same account as the rest of rashid-wep.vercel.app.
 *
 * The URL and publishable key are public by design (same values already
 * embedded client-side across the main site, see src/js/config/supabase.js)
 * — safe to ship in a static bundle, unlike a service-role key.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kcltollasghlvuoxvjqa.supabase.co'

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_H6DYBEKQ3UAZp6qoI63K3Q_UhmyNycm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Persist the session in localStorage so a signed-in player stays
    // signed in across visits (same behavior as the main site).
    persistSession: true,
    autoRefreshToken: true,
    // The static export has no server route to land the OAuth code on, so
    // the client must pick the session up straight out of the redirect URL.
    detectSessionInUrl: true,
  },
})

export interface DenkmalenStatsRow {
  user_id: string
  games_played: number
  wins: number
  total_votes: number
  highest_score: number
  total_drawing_time: number
  favorite_category: string | null
  favorite_game_type: string | null
  display_name: string | null
  avatar_url: string | null
  updated_at: string
}

/**
 * Starts the Google OAuth redirect. The user leaves the page entirely (real
 * Google consent screen) and comes back to this same URL with the session
 * embedded — GameProvider picks it up via onAuthStateChange.
 */
export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : undefined,
    },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

export async function fetchDenkmalenStats(userId: string): Promise<DenkmalenStatsRow | null> {
  const { data, error } = await supabase
    .from('denkmalen_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load Denkmalen stats:', error.message)
    return null
  }
  return data
}

export async function upsertDenkmalenStats(
  userId: string,
  stats: Partial<Omit<DenkmalenStatsRow, 'user_id' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('denkmalen_stats')
    .upsert({ user_id: userId, ...stats, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to save Denkmalen stats:', error.message)
  }
}
