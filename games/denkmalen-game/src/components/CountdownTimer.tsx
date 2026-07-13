'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownTimerProps {
  timeLeft: number
  totalTime: number
  onTimeUp?: () => void
  onTick?: (time: number) => void
  showWarning?: boolean
  warningThreshold?: number
  dangerThreshold?: number
}

export function CountdownTimer({
  timeLeft,
  totalTime,
  onTimeUp,
  onTick,
  showWarning = true,
  warningThreshold = 20,
  dangerThreshold = 10,
}: CountdownTimerProps) {
  const [prevTime, setPrevTime] = useState(timeLeft)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (timeLeft !== prevTime) {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 200)
      setPrevTime(timeLeft)
      onTick?.(timeLeft)
    }
  }, [timeLeft, prevTime, onTick])

  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp()
    }
  }, [timeLeft, onTimeUp])

  const getTimerColor = () => {
    if (timeLeft <= dangerThreshold) return 'text-red-500'
    if (timeLeft <= warningThreshold) return 'text-yellow-500'
    return 'text-primary-500'
  }

  const getTimerBg = () => {
    if (timeLeft <= dangerThreshold) return 'bg-red-500'
    if (timeLeft <= warningThreshold) return 'bg-yellow-500'
    return 'bg-primary-500'
  }

  const progress = (timeLeft / totalTime) * 100

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className={`${getTimerColor()} transition-all duration-1000 ease-linear`}
          />
        </svg>
        
        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={timeLeft}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-3xl font-bold ${getTimerColor()} ${
                animate ? 'scale-110' : ''
              }`}
            >
              {timeLeft}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Linear Progress Bar */}
      {showWarning && timeLeft <= warningThreshold && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full mt-4"
        >
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getTimerBg()} transition-all duration-1000 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Warning Messages */}
      <AnimatePresence>
        {showWarning && timeLeft <= dangerThreshold && timeLeft > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-red-500 font-bold animate-pulse"
          >
            ⚠️ Time almost up!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Time's Up */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
          >
            <span className="text-4xl font-bold text-white">TIME'S UP!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
