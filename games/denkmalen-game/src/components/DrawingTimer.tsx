'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'

interface DrawingTimerProps {
  timeLeft: number
  totalTime: number
  onWarning?: () => void
  onTimeUp?: () => void
}

/**
 * Animated drawing timer with visual warnings
 */
export function DrawingTimer({ timeLeft, totalTime, onWarning, onTimeUp }: DrawingTimerProps) {
  const [hasWarned, setHasWarned] = useState(false)
  const lang = useGameStore((s) => s.settings.language)

  const percentage = (timeLeft / totalTime) * 100
  
  const getColor = () => {
    if (timeLeft <= 5) return 'text-red-500'
    if (timeLeft <= 10) return 'text-yellow-500'
    return 'text-primary-500'
  }

  const getProgressColor = () => {
    if (timeLeft <= 5) return '#ef4444'
    if (timeLeft <= 10) return '#f59e0b'
    return '#667eea'
  }

  const getBackgroundColor = () => {
    if (timeLeft <= 5) return 'bg-red-100 dark:bg-red-900/30'
    if (timeLeft <= 10) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-primary-100 dark:bg-primary-900/30'
  }

  useEffect(() => {
    if (timeLeft <= 10 && !hasWarned) {
      setHasWarned(true)
      onWarning?.()
    }
    
    if (timeLeft <= 0) {
      onTimeUp?.()
    }
  }, [timeLeft, hasWarned, onWarning, onTimeUp])

  // Circle animation
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${getBackgroundColor()} transition-colors duration-300`}>
      {/* Animated circle */}
      <div className="relative w-12 h-12">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getProgressColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-lg font-bold ${getColor()}`}
            animate={timeLeft <= 5 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {timeLeft}
          </motion.span>
        </div>
      </div>
      
      {/* Label */}
      <div className="hidden sm:block">
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('draw.timeLeft', lang)}</p>
        <p className={`text-sm font-medium ${getColor()}`}>{timeLeft}s</p>
      </div>
    </div>
  )
}