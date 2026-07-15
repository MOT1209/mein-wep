'use client'

import { motion } from 'framer-motion'
import { FaGoogle, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '@/components/AuthProvider'
import { useGame } from '@/components/GameProvider'

/**
 * Optional account sign-in, shown as a small row at the top of the main
 * menu. Signing in is never required to play — guests just never click it,
 * and every other button on the menu works identically either way.
 */
export function AuthWidget() {
  const { user, loading, signIn, signOut } = useAuth()
  const { playSound } = useGame()

  if (loading) return <div className="h-9" />

  if (user) {
    const name = user.user_metadata?.full_name || user.email || 'Player'
    const avatar = user.user_metadata?.avatar_url as string | undefined

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-slate-800/70 rounded-full shadow-sm mb-4"
      >
        {avatar ? (
          <img src={avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm text-slate-700 dark:text-slate-200 max-w-[140px] truncate">{name}</span>
        <button
          onClick={() => { playSound('click'); signOut() }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Sign out"
        >
          <FaSignOutAlt className="text-sm" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => { playSound('click'); signIn() }}
      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300
                 text-sm font-medium rounded-full shadow-sm border border-slate-200 dark:border-slate-700
                 hover:shadow-md transition-all mb-4"
    >
      <FaGoogle className="text-red-500" />
      <span>Sign in with Google</span>
    </motion.button>
  )
}
