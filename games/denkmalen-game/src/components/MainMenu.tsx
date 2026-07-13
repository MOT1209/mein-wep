'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { 
  FaUsers, FaGlobe, FaCog, FaChartBar, FaPaintBrush, 
  FaGamepad, FaTrophy, FaStar, FaMobileAlt, FaQrcode
} from 'react-icons/fa'

export function MainMenu() {
  const { setPhase, stats } = useGameStore()
  const { startOnlineGame, playSound, vibrate } = useGame()

  const handleOfflineMode = () => {
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
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaPaintBrush className="text-5xl text-primary-500" />
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Draw Battle
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Draw, Vote, Win! 🎨
        </p>
      </motion.div>

      {/* Animated Art Elements */}
      <div className="relative w-64 h-32 mb-8">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-0 top-0 text-4xl"
        >
          🎨
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          className="absolute left-1/3 top-0 text-4xl"
        >
          ✏️
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
          className="absolute right-0 top-0 text-4xl"
        >
          🖌️
        </motion.div>
      </div>

      {/* Main Menu Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Offline Mode - Big Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOfflineMode}
          className="relative overflow-hidden flex items-center justify-center gap-4 py-6 px-6 bg-gradient-to-r from-primary-500 to-primary-600 
                     text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="absolute inset-0 bg-white/10" />
          <FaMobileAlt className="text-3xl relative z-10" />
          <div className="text-left relative z-10">
            <div className="text-xl">Offline Mode</div>
            <div className="text-sm opacity-80 font-normal">Same Device - Pass & Play</div>
          </div>
        </motion.button>

        {/* Online Mode - Big Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOnlineMode}
          className="relative overflow-hidden flex items-center justify-center gap-4 py-6 px-6 bg-gradient-to-r from-secondary-500 to-secondary-600 
                     text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <div className="absolute inset-0 bg-white/10" />
          <FaQrcode className="text-3xl relative z-10" />
          <div className="text-left relative z-10">
            <div className="text-xl">Online Mode</div>
            <div className="text-sm opacity-80 font-normal">QR Code - Different Devices</div>
          </div>
        </motion.button>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSound('click'); setPhase('leaderboard') }}
            className="flex flex-col items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-slate-800 
                       text-slate-700 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all
                       border-2 border-slate-200 dark:border-slate-700"
          >
            <FaTrophy className="text-2xl text-yellow-500" />
            <span>Leaderboard</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSound('click'); setPhase('stats') }}
            className="flex flex-col items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-slate-800 
                       text-slate-700 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all
                       border-2 border-slate-200 dark:border-slate-700"
          >
            <FaChartBar className="text-2xl text-green-500" />
            <span>Statistics</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playSound('click'); setPhase('leaderboard') }}
          className="flex items-center justify-center gap-3 py-3 px-6 bg-white dark:bg-slate-800 
                     text-slate-700 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all
                     border-2 border-slate-200 dark:border-slate-700 mt-2"
        >
          <FaCog className="text-xl" />
          Settings
        </motion.button>
      </div>

      {/* Stats Preview */}
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
