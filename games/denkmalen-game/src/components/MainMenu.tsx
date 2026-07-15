'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { FEATURES } from '@/lib/flags'
import {
  FaCog, FaPaintBrush, FaChartBar, FaPlay,
  FaGamepad, FaTrophy, FaStar
} from 'react-icons/fa'

export function MainMenu() {
  const { setPhase, stats } = useGameStore()
  const { playSound, vibrate } = useGame()

  const handlePlayNow = () => {
    playSound('click')
    vibrate()
    setPhase('setup')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="text-center mb-8 max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaPaintBrush className="text-4xl text-primary-500" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Denkmalen
          </h1>
        </div>

        {/* Headline - One sentence explaining the game */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Draw words, challenge friends, and let AI judge your art!
        </h2>

        {/* Subline - AI as differentiator */}
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
          Powered by AI that gives instant, fun feedback on every drawing 🤖
        </p>
      </motion.div>

      {/* Demo Video Placeholder */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md mb-8 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 aspect-video flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600"
      >
        <div className="text-center p-4">
          <div className="text-5xl mb-3">🎬</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Demo video coming soon</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">6 seconds of gameplay</p>
        </div>
      </motion.div>

      {/* Primary CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayNow}
        className="relative overflow-hidden flex items-center justify-center gap-3 py-5 px-10 bg-gradient-to-r from-primary-500 to-primary-600 
                   text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all mb-6"
      >
        <div className="absolute inset-0 bg-white/10" />
        <FaPlay className="text-xl relative z-10" />
        <span className="relative z-10">Play Now</span>
      </motion.button>

      {/* Secondary link */}
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        No download needed • Works on any device
      </p>

      {/* Secondary buttons - only show if there's data */}
      {(FEATURES.leaderboard && stats.gamesPlayed > 0) || (FEATURES.statistics && stats.gamesPlayed > 0) ? (
        <div className="flex gap-4 mb-4">
          {FEATURES.leaderboard && stats.gamesPlayed > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('click'); setPhase('leaderboard') }}
              className="flex items-center gap-2 py-3 px-5 bg-white dark:bg-slate-800 
                         text-slate-700 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all
                         border-2 border-slate-200 dark:border-slate-700"
            >
              <FaTrophy className="text-yellow-500" />
              <span>Leaderboard</span>
            </motion.button>
          )}

          {FEATURES.statistics && stats.gamesPlayed > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('click'); setPhase('stats') }}
              className="flex items-center gap-2 py-3 px-5 bg-white dark:bg-slate-800 
                         text-slate-700 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all
                         border-2 border-slate-200 dark:border-slate-700"
            >
              <FaChartBar className="text-green-500" />
              <span>Statistics</span>
            </motion.button>
          )}
        </div>
      ) : null}

      {/* Settings link */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { playSound('click'); setPhase('settings') }}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
      >
        <FaCog className="text-sm" />
        <span className="text-sm">Settings</span>
      </motion.button>

      {/* Stats Preview - only if player has played */}
      {stats.gamesPlayed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400"
        >
          <div className="flex items-center gap-1">
            <FaGamepad />
            <span>{stats.gamesPlayed} Games</span>
          </div>
          <div className="flex items-center gap-1">
            <FaTrophy className="text-yellow-500" />
            <span>{stats.wins} Wins</span>
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-purple-500" />
            <span>Best: {stats.highestScore}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}