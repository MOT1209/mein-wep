'use client'

import { motion } from 'framer-motion'

interface ScoreAnimationProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Animated score display with color based on value
 */
export function ScoreAnimation({ score, size = 'md' }: ScoreAnimationProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getEmoji = (score: number) => {
    if (score >= 90) return '🌟'
    if (score >= 80) return '🎯'
    if (score >= 70) return '👍'
    if (score >= 60) return '🤔'
    if (score >= 50) return '😅'
    return '💪'
  }

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`${sizeClasses[size]} font-bold ${getColor(score)}`}
      >
        {score}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl"
      >
        {getEmoji(score)}
      </motion.div>
    </div>
  )
}