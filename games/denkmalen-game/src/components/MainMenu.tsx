'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { FEATURES } from '@/lib/flags'
import { AuthWidget } from '@/components/AuthWidget'
import { t } from '@/lib/i18n'
import {
  FaCog, FaPaintBrush, FaChartBar, FaPlay,
  FaGamepad, FaTrophy, FaStar, FaUsers
} from 'react-icons/fa'

export function MainMenu() {
  const { setPhase, stats, settings } = useGameStore()
  const { playSound, vibrate, startOnlineGame } = useGame()
  const lang = settings.language

  const handlePlayNow = () => {
    playSound('click')
    vibrate()
    setPhase('setup')
  }

  const handleOnlineMode = () => {
    playSound('click')
    vibrate()
    startOnlineGame()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {/* Optional account sign-in — never blocks play, just sync stats when used */}
      <AuthWidget />

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
          {t('menu.headline', lang)}
        </h2>

        {/* Subline - AI as differentiator */}
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
          {t('menu.subline', lang)}
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('menu.demoSoon', lang)}</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{t('menu.demoLength', lang)}</p>
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
        <span className="relative z-10">{t('menu.playNow', lang)}</span>
      </motion.button>

      {/* Secondary link */}
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        {t('menu.noDownload', lang)}
      </p>

      {/* Online multiplayer entry point (finished & live — see FEATURES.onlineMode) */}
      {FEATURES.onlineMode && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOnlineMode}
          className="flex items-center gap-2 py-3 px-6 mb-6 bg-secondary-50 dark:bg-secondary-900/30
                     text-secondary-600 dark:text-secondary-300 font-semibold rounded-xl
                     border-2 border-secondary-200 dark:border-secondary-800 hover:shadow-lg transition-all"
        >
          <FaUsers />
          <span>{t('menu.playOnline', lang)}</span>
        </motion.button>
      )}

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
              <span>{t('menu.leaderboard', lang)}</span>
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
              <span>{t('menu.statistics', lang)}</span>
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
        <span className="text-sm">{t('menu.settings', lang)}</span>
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
            <span>{stats.gamesPlayed} {t('menu.games', lang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaTrophy className="text-yellow-500" />
            <span>{stats.wins} {t('menu.wins', lang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="text-purple-500" />
            <span>{t('menu.best', lang)} {stats.highestScore}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}