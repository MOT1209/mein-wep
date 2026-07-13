'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaStar, FaPalette, FaEye, FaLightbulb, FaComment } from 'react-icons/fa'

interface AIEvaluation {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
}

interface AIJudgeProps {
  word: string
  drawingData: string
  category: string
  drawingTime: number
  onEvaluationComplete: (evaluation: AIEvaluation) => void
}

export function AIJudge({ 
  word, 
  drawingData, 
  category, 
  drawingTime,
  onEvaluationComplete 
}: AIJudgeProps) {
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    evaluateDrawing()
  }, [drawingData])

  const evaluateDrawing = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          drawingData,
          category,
          drawingTime,
        }),
      })

      if (!response.ok) {
        throw new Error('Evaluation failed')
      }

      const data: AIEvaluation = await response.json()
      setEvaluation(data)
      onEvaluationComplete(data)

    } catch (err) {
      console.error('AI Evaluation error:', err)
      // Use fallback evaluation
      const fallback: AIEvaluation = {
        score: 65,
        accuracy: 60,
        creativity: 70,
        clarity: 65,
        comment: "Good effort! The AI couldn't evaluate but I'm sure it looks great! 🎨"
      }
      setEvaluation(fallback)
      onEvaluationComplete(fallback)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                   rounded-2xl p-4 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-3xl"
          >
            <FaRobot className="text-purple-500" />
          </motion.div>
          <div>
            <p className="font-bold text-purple-700 dark:text-purple-300">
              AI Judge is evaluating...
            </p>
            <p className="text-sm text-purple-500 dark:text-purple-400">
              Analyzing your drawing ✨
            </p>
          </div>
        </div>
        
        {/* Loading animation */}
        <div className="mt-3 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 rounded-full bg-purple-500"
            />
          ))}
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </p>
      </div>
    )
  }

  // Evaluation result
  if (!evaluation) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                 rounded-2xl p-4 border border-purple-200 dark:border-purple-800"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <FaRobot className="text-purple-500 text-xl" />
        <span className="font-bold text-purple-700 dark:text-purple-300">
          AI Judge Score
        </span>
      </div>

      {/* Main Score */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                     bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl font-bold shadow-lg"
        >
          {evaluation.score}
        </motion.div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">out of 100</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2 mb-4">
        <ScoreBar 
          icon={<FaEye />} 
          label="Accuracy" 
          value={evaluation.accuracy} 
          color="blue" 
        />
        <ScoreBar 
          icon={<FaLightbulb />} 
          label="Creativity" 
          value={evaluation.creativity} 
          color="yellow" 
        />
        <ScoreBar 
          icon={<FaPalette />} 
          label="Clarity" 
          value={evaluation.clarity} 
          color="green" 
        />
      </div>

      {/* Comment */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-3 flex items-start gap-2">
        <FaComment className="text-purple-400 mt-0.5" />
        <p className="text-sm text-slate-700 dark:text-slate-300 italic">
          &quot;{evaluation.comment}&quot;
        </p>
      </div>
    </motion.div>
  )
}

// Score Bar Component
function ScoreBar({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'yellow' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 dark:text-slate-400 w-4">{icon}</span>
      <span className="text-sm text-slate-600 dark:text-slate-300 w-20">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full ${colorClasses[color]} rounded-full`}
        />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
        {value}
      </span>
    </div>
  )
}

// Combined Score Display (Votes + AI)
export function CombinedScoreDisplay({
  voteScore,
  aiScore,
  finalScore,
  aiComment
}: {
  voteScore: number
  aiScore: number
  finalScore: number
  aiComment: string
}) {
  const votesWeight = Math.round(voteScore * 0.7)
  const aiWeight = Math.round(aiScore * 0.3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg"
    >
      <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-center">
        Final Score Breakdown
      </h3>

      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Votes Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{votesWeight}</div>
          <div className="text-xs text-slate-500">from Votes (70%)</div>
        </div>

        <div className="text-2xl text-slate-400">+</div>

        {/* AI Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{aiWeight}</div>
          <div className="text-xs text-slate-500">from AI (30%)</div>
        </div>

        <div className="text-2xl text-slate-400">=</div>

        {/* Final Score */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 
                       bg-clip-text text-transparent"
          >
            {finalScore}
          </motion.div>
          <div className="text-xs text-slate-500">Final Score</div>
        </div>
      </div>

      {/* AI Comment */}
      {aiComment && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <p className="text-sm text-purple-600 dark:text-purple-300 italic">
            🤖 &quot;{aiComment}&quot;
          </p>
        </div>
      )}
    </motion.div>
  )
}
