'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, calculateScore, calculateFinalScore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { AIJudge, CombinedScoreDisplay } from './AIJudge'
import { FaTrophy, FaMedal, FaStar, FaRedo, FaHome, FaRobot } from 'react-icons/fa'

interface Result {
  rank: number
  playerId: string
  playerName: string
  playerAvatar: string
  votes: number
  voteScore: number
  aiScore: number
  finalScore: number
  aiComment: string
  drawingId: string
  word: string
  aiFailed?: boolean
}

export function ResultsScreen() {
  const { drawings, votes, players, setPhase, resetGame, currentRound, aiEvaluations, gameType, currentLetter, creativePrompt } = useGameStore()
  const { playSound, vibrate } = useGame()
  
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [evaluatingAI, setEvaluatingAI] = useState(true)
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null)

  useEffect(() => {
    evaluateDrawings()
  }, [])

  const evaluateDrawings = async () => {
    setEvaluatingAI(true)
    
    // Calculate vote scores first
    const drawingVotes: Record<string, number> = {}
    votes.forEach(vote => {
      drawingVotes[vote.drawingId] = (drawingVotes[vote.drawingId] || 0) + 1
    })

    const resultsData: Result[] = []
    
    // Create temporary results with vote scores
    drawings.forEach(drawing => {
      const player = players.find(p => p.id === drawing.playerId)
      if (player) {
        const voteCount = drawingVotes[drawing.id] || 0
        const maxVotes = Math.max(...Object.values(drawingVotes), 1)
        const voteScore = Math.round((voteCount / maxVotes) * 100)
        
        resultsData.push({
          rank: 0,
          playerId: drawing.playerId,
          playerName: player.name,
          playerAvatar: player.avatar,
          votes: voteCount,
          voteScore,
          aiScore: 65, // Default
          finalScore: 0,
          aiComment: '',
          drawingId: drawing.id,
          word: drawing.word,
        })
      }
    })

    // Get AI evaluations for each drawing
    let anyAIFailed = false
    for (const drawing of drawings) {
      try {
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: drawing.word,
            drawingData: drawing.canvasData,
            category: drawing.category,
            drawingTime: 60,
          }),
        })

        if (response.ok) {
          const aiEval = await response.json()
          const result = resultsData.find(r => r.drawingId === drawing.id)
          if (result) {
            result.aiScore = aiEval.score
            result.aiComment = aiEval.comment
          }
        } else {
          // AI evaluation API returned error — mark as failed
          const result = resultsData.find(r => r.drawingId === drawing.id)
          if (result) {
            result.aiFailed = true
            result.aiScore = 50 // neutral default
            result.aiComment = 'AI evaluation unavailable'
          }
          anyAIFailed = true
        }
      } catch (error) {
        console.error('AI evaluation failed for drawing:', error)
        const result = resultsData.find(r => r.drawingId === drawing.id)
        if (result) {
          result.aiFailed = true
          result.aiScore = 50
          result.aiComment = 'AI evaluation unavailable'
        }
        anyAIFailed = true
      }
    }

    // If all AI evaluations failed, set all scores to neutral
    if (anyAIFailed) {
      console.warn('Some AI evaluations failed — using vote-based ranking only')
    }

    // Calculate final scores (70% votes + 30% AI)
    resultsData.forEach(result => {
      result.finalScore = calculateFinalScore(result.voteScore, result.aiScore)
    })

    // Sort by final score
    resultsData.sort((a, b) => b.finalScore - a.finalScore)
    resultsData.forEach((result, index) => {
      result.rank = index + 1
    })

    setResults(resultsData)
    setEvaluatingAI(false)
    
    // Animate results
    setTimeout(() => {
      setShowResults(true)
      playSound('winner')
      vibrate([100, 50, 100, 50, 200])
    }, 500)
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-amber-500'
      case 2: return 'from-gray-300 to-gray-400'
      case 3: return 'from-orange-400 to-orange-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      {/* Confetti Effect */}
      {showResults && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -100, 
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                rotate: 0,
              }}
              animate={{ 
                y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
                rotate: 720,
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                ease: 'linear'
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][
                  Math.floor(Math.random() * 6)
                ],
              }}
            />
          ))}
        </div>
      )}
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
          Round Results!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Round {currentRound} - {gameType === 'letter' ? `Letter: ${currentLetter}` : gameType === 'creative' ? 'Creative Challenge' : gameType === 'category' ? 'Category Mode' : 'Classic Mode'}
        </p>
      </motion.div>

      {/* AI Evaluating Animation */}
      {evaluatingAI && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                     rounded-2xl p-6 border border-purple-200 dark:border-purple-800 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-3"
          >
            <FaRobot className="text-4xl text-purple-500" />
          </motion.div>
          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">
            AI Judge is Analyzing Drawings...
          </h3>
          <p className="text-sm text-purple-500 dark:text-purple-400 mt-1">
            Evaluating accuracy, creativity, and clarity ✨
          </p>
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 rounded-full bg-purple-500"
              />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Results List */}
      <div className="w-full max-w-md space-y-4 mb-6">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={result.drawingId}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`rounded-2xl shadow-lg overflow-hidden ${
                result.rank <= 3 
                  ? `bg-gradient-to-r ${getRankColor(result.rank)}` 
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              {/* Main Result Row */}
              <div 
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setSelectedDrawing(selectedDrawing === result.drawingId ? null : result.drawingId)}
              >
                {/* Rank */}
                <div className="text-3xl font-bold w-12 text-center">
                  {getRankIcon(result.rank)}
                </div>
                
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {result.playerAvatar}
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <p className={`font-bold text-lg ${
                    result.rank <= 3 ? 'text-white' : 'text-slate-800 dark:text-white'
                  }`}>
                    {result.playerName}
                  </p>
                  <p className={`text-sm ${
                    result.rank <= 3 ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {result.votes} vote{result.votes !== 1 ? 's' : ''} • {gameType === 'letter' ? `Letter: ${currentLetter}` : gameType === 'creative' ? result.word : result.word}
                  </p>
                  {result.aiFailed && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
                      ⚠️ AI score unavailable
                    </span>
                  )}
                </div>
                
                {/* Score Breakdown */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    result.rank <= 3 ? 'text-white' : 'text-slate-800 dark:text-white'
                  }`}>
                    {result.finalScore}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`${result.rank <= 3 ? 'text-white/70' : 'text-slate-500'}`}>
                      🗳️ {result.voteScore}
                    </span>
                    <span className={`${result.rank <= 3 ? 'text-white/70' : 'text-slate-500'}`}>
                      🤖 {result.aiScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedDrawing === result.drawingId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/20"
                  >
                    <div className="p-4">
                      <CombinedScoreDisplay
                        voteScore={result.voteScore}
                        aiScore={result.aiFailed ? -1 : result.aiScore}
                        finalScore={result.finalScore}
                        aiComment={result.aiFailed ? 'AI evaluation was unavailable for this round. Score is based on votes only.' : result.aiComment}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Winner Spotlight */}
      {results.length > 0 && !evaluatingAI && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="mb-6 text-center"
        >
          <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            🎉 {results[0].playerName} wins this round! 🎉
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <FaStar />
              <span className="font-bold">+{results[0].finalScore} points</span>
            </div>
            {!results[0].aiFailed && (
              <div className="flex items-center gap-1 text-purple-500">
                <FaRobot />
                <span>AI: {results[0].aiScore}</span>
              </div>
            )}
          </div>
          {results[0].aiComment && !results[0].aiFailed && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic max-w-md">
              🤖 "{results[0].aiComment}"
            </p>
          )}
        </motion.div>
      )}
      
      {/* Actions */}
      <div className="flex gap-4">
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
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click')
            setPhase('leaderboard')
          }}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 
                     text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
        >
          <FaTrophy />
          Leaderboard
        </motion.button>
      </div>
    </motion.div>
  )
}
