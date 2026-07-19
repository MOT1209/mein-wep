'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'
import { useGame } from '@/components/GameProvider'
import { getOfflineStats, getRecentResults, getStorageUsageFormatted } from '@/lib/offline-storage'
import { FaArrowLeft, FaChartBar, FaGamepad, FaTrophy, FaStar, FaClock, FaPaintBrush, FaHome, FaWifi, FaWifiOff } from 'react-icons/fa'

export function StatsScreen() {
  const { stats, setPhase, settings } = useGameStore()
  const lang = settings.language
  const { playSound, vibrate } = useGame()
  
  // Get offline statistics
  const offlineStats = getOfflineStats()
  const recentResults = getRecentResults()
  const storageUsage = getStorageUsageFormatted()

  const statItems = [
    { icon: FaGamepad, label: t('stats.gamesPlayed', lang), value: stats.gamesPlayed, color: 'text-blue-500', bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' },
    { icon: FaTrophy, label: t('leader.wins', lang), value: stats.wins, color: 'text-yellow-500', bg: 'from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20' },
    { icon: FaStar, label: t('stats.highestScore', lang), value: stats.highestScore, color: 'text-purple-500', bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20' },
    { icon: FaPaintBrush, label: t('stats.totalVotes', lang), value: stats.totalVotes, color: 'text-green-500', bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' },
    { icon: FaClock, label: t('stats.drawingTime', lang), value: stats.totalDrawingTime, color: 'text-orange-500', bg: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20' },
  ]

  const gameTypeEmoji: Record<string, string> = {
    classic: '✏️',
    letter: '🔤',
    category: '📂',
    creative: '🎨',
    daily: '📅',
  }

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('click'); setPhase('menu') }}
          aria-label={t('common.back', lang)}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <FaArrowLeft className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaChartBar className="text-green-500" />
            {t('menu.statistics', lang)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('stats.yourJourney', lang)}
          </p>
        </div>
        
        <div className="w-12" />
      </div>

      {/* Win Rate Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex justify-center mb-8"
      >
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-slate-200 dark:text-slate-700" />
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" strokeLinecap="round"
              className="text-primary-500"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - winRate / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{winRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('stats.winRate', lang)}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="flex-1 max-w-md mx-auto w-full space-y-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`bg-gradient-to-r ${item.bg} rounded-2xl p-4 border border-white/50 dark:border-slate-700/50`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md`}>
                <item.icon className={`text-xl ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Favorite Game Type */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-800/20 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md text-2xl">
              🎮
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.favoriteGameType', lang)}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {gameTypeEmoji[stats.favoriteGameType] || '🎮'}{' '}
                {t(`gametype.${stats.favoriteGameType}`, lang)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Favorite Category */}
        {stats.favoriteCategory !== 'random' && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md text-2xl">
                ❤️
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.favoriteCategory', lang)}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white capitalize">{t(`category.${stats.favoriteCategory}`, lang)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Offline Stats Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-800/20 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
              <FaWifiOff className="text-xl text-cyan-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Offline Games</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{offlineStats.gamesPlayed}</p>
            </div>
          </div>
          {offlineStats.gamesPlayed > 0 && (
            <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-800">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{offlineStats.gamesWon}</p>
                  <p className="text-xs text-slate-500">Wins</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{offlineStats.averageScore}</p>
                  <p className="text-xs text-slate-500">Avg Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{offlineStats.highestScore}</p>
                  <p className="text-xs text-slate-500">Best</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-r from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md text-2xl">
                🕐
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Recent Games</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{recentResults.length} games</p>
              </div>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentResults.slice(0, 5).map((result, index) => (
                <div key={result.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    🏆 {result.winner}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 border border-white/50 dark:border-slate-700/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
              <FaChartBar className="text-xl text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">Local Storage</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{storageUsage}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Home Button */}
      <div className="flex justify-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click')
            vibrate()
            setPhase('menu')
          }}
          className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white 
                     font-bold rounded-xl shadow-lg flex items-center gap-2 border-2 
                     border-slate-200 dark:border-slate-700"
        >
          <FaHome />
          {t('common.home', lang)}
        </motion.button>
      </div>
    </motion.div>
  )
}
