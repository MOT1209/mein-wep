'use client'

import { motion } from 'framer-motion'

interface PlayerAvatarProps {
  avatar: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  isActive?: boolean
  score?: number
  rank?: number
  onClick?: () => void
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-3xl',
  xl: 'w-24 h-24 text-4xl',
}

const rankColors = {
  1: 'from-yellow-400 to-amber-500 ring-yellow-300',
  2: 'from-gray-300 to-gray-400 ring-gray-300',
  3: 'from-orange-400 to-orange-500 ring-orange-300',
}

export function PlayerAvatar({
  avatar,
  name,
  size = 'md',
  showName = false,
  isActive = false,
  score,
  rank,
  onClick,
}: PlayerAvatarProps) {
  const sizeClass = sizeClasses[size]
  const rankClass = rank ? rankColors[rank as keyof typeof rankColors] : null

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.1 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        {/* Avatar Circle */}
        <motion.div
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            boxShadow: ['0 0 0 0 rgba(14, 165, 233, 0)', '0 0 0 8px rgba(14, 165, 233, 0.3)', '0 0 0 0 rgba(14, 165, 233, 0)']
          } : undefined}
          transition={isActive ? { duration: 2, repeat: Infinity } : undefined}
          className={`
            ${sizeClass}
            rounded-full 
            flex items-center justify-center
            ${rankClass 
              ? `bg-gradient-to-br ${rankClass} ring-4` 
              : 'bg-gradient-to-br from-primary-400 to-secondary-400'
            }
            shadow-lg
          `}
        >
          <span>{avatar}</span>
        </motion.div>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                       border-2 border-white dark:border-slate-800"
          />
        )}

        {/* Rank Badge */}
        {rank && rank <= 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 
                       rounded-full flex items-center justify-center text-lg shadow-lg"
          >
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </motion.div>
        )}
      </div>

      {/* Name */}
      {showName && name && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300 text-center max-w-[80px] truncate"
        >
          {name}
        </motion.p>
      )}

      {/* Score */}
      {score !== undefined && (
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-1 text-xs font-bold text-primary-500"
        >
          {score} pts
        </motion.p>
      )}
    </motion.div>
  )
}
