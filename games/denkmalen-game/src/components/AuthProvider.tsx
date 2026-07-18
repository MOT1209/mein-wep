'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, signInWithGoogle, signOut, fetchDenkmalenStats, upsertDenkmalenStats } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        // Clean the OAuth redirect params/hash out of the URL now that the
        // client has consumed them — same treatment as the ?join= param.
        window.history.replaceState({}, '', window.location.pathname)
        syncStatsOnSignIn(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keep the account's stats row current as the player earns more, without
  // touching every call site that updates stats: subscribe to the store and
  // push whenever stats change while signed in. No-op for guests (no user).
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (!user || state.stats === prevState.stats) return
      upsertDenkmalenStats(user.id, {
        games_played: state.stats.gamesPlayed,
        wins: state.stats.wins,
        total_votes: state.stats.totalVotes,
        highest_score: state.stats.highestScore,
        total_drawing_time: state.stats.totalDrawingTime,
        favorite_category: state.stats.favoriteCategory,
        favorite_game_type: state.stats.favoriteGameType,
      })
    })
    return unsubscribe
  }, [user])

  const syncStatsOnSignIn = async (signedInUser: User) => {
    const remote = await fetchDenkmalenStats(signedInUser.id)
    const { stats, updateStats } = useGameStore.getState()

    if (remote) {
      // Account already has stats from a previous session — adopt them as
      // the source of truth rather than merging, so switching devices
      // shows the account's real numbers instead of guessing which side
      // "wins" a merge.
      updateStats({
        gamesPlayed: remote.games_played,
        wins: remote.wins,
        totalVotes: remote.total_votes,
        highestScore: remote.highest_score,
        totalDrawingTime: remote.total_drawing_time,
        favoriteCategory: (remote.favorite_category as any) ?? stats.favoriteCategory,
        favoriteGameType: (remote.favorite_game_type as any) ?? stats.favoriteGameType,
      })
    } else {
      // First time this account has signed in — seed the row with
      // whatever was played as a guest so nothing is lost.
      await upsertDenkmalenStats(signedInUser.id, {
        games_played: stats.gamesPlayed,
        wins: stats.wins,
        total_votes: stats.totalVotes,
        highest_score: stats.highestScore,
        total_drawing_time: stats.totalDrawingTime,
        favorite_category: stats.favoriteCategory,
        favorite_game_type: stats.favoriteGameType,
        display_name: signedInUser.user_metadata?.full_name ?? null,
        avatar_url: signedInUser.user_metadata?.avatar_url ?? null,
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn: signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
