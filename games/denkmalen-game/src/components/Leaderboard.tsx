'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { FaArrowLeft, FaTrophy, FaMedal, FaRedo, FaHome, FaCog } from 'react-icons/fa'

export function Leaderboard() {
  const { players, setPhase, resetGame, currentRound, totalRounds } = useGameStore()
  const { playSound, vibrate } = useGame()
  
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-yellow-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-orange-500/30'
      default:
        return 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
    }
  }
  
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return null
    }
  }

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
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <FaArrowLeft className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Leaderboard
          </h1>
          {currentRound > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Round {currentRound} / {totalRounds}
            </p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('click'); setPhase('menu') }}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <FaCog className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
      </div>
      
      {/* Podium */}
      {sortedPlayers.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8 h-48">
          {/* 2nd Place */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 
                            flex items-center justify-center text-2xl mb-2 shadow-lg">
              {sortedPlayers[1].avatar}
            </div>
            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1">
              {sortedPlayers[1].name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {sortedPlayers[1].score} pts
            </p>
            <div className="w-20 h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg 
                            flex items-center justify-center text-4xl shadow-lg">
              🥈
            </div>
          </motion.div>
          
          {/* 1st Place */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 
                            flex items-center justify-center text-3xl mb-2 shadow-lg ring-4 ring-yellow-300">
              {sortedPlayers[0].avatar}
            </div>
            <p className="font-bold text-slate-800 dark:text-white mb-1">
              {sortedPlayers[0].name}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2 font-bold">
              {sortedPlayers[0].score} pts
            </p>
            <div className="w-24 h-32 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t-lg 
                            flex items-center justify-center text-5xl shadow-lg shadow-yellow-500/30">
              🥇
            </div>
          </motion.div>
          
          {/* 3rd Place */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 
                            flex items-center justify-center text-2xl mb-2 shadow-lg">
              {sortedPlayers[2].avatar}
            </div>
            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1">
              {sortedPlayers[2].name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {sortedPlayers[2].score} pts
            </p>
            <div className="w-20 h-20 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg 
                            flex items-center justify-center text-4xl shadow-lg">
              🥉
            </div>
          </motion.div>
        </div>
      )}
      
      {/* All Players List */}
      <div className="flex-1 max-w-md mx-auto w-full space-y-3">
        {sortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <FaTrophy className="text-6xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No players yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Play a game to see the leaderboard!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('click'); setPhase('setup') }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 
                         text-white font-bold rounded-xl shadow-lg"
            >
              Start Playing
            </motion.button>
          </div>
        )}
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg ${getRankStyle(index + 1)}`}
          >
            {/* Rank */}
            <div className="w-10 text-center text-xl font-bold">
              {getRankBadge(index + 1) || `#${index + 1}`}
            </div>
            
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              {player.avatar}
            </div>
            
            {/* Name */}
            <div className="flex-1">
              <p className="font-bold text-lg">{player.name}</p>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <span>🏆 {player.roundWins} wins</span>
                <span>⭐ {player.totalVotes} votes</span>
              </div>
            </div>
            
            {/* Score */}
            <div className="text-right">
              <p className="text-2xl font-bold">{player.score}</p>
              <p className="text-sm opacity-80">points</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex justify-center gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click')
            resetGame()
            setPhase('menu')
          }}
          className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white 
                     font-bold rounded-xl shadow-lg flex items-center gap-2 border-2 
                     border-slate-200 dark:border-slate-700"
        >
          <FaHome />
          Home
        </motion.button>
        
        {currentRound < totalRounds && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound('click')
              setPhase('setup')
            }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 
                       text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            <FaRedo />
            Play Again
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
