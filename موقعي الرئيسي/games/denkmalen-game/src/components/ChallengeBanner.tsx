'use client'

import { motion } from 'framer-motion'
import { Challenge, ChallengeID } from '@/plugins/challenges/types'
import { t } from '@/lib/i18n'
import { useGameStore } from '@/store/gameStore'

interface ChallengeBannerProps {
  challenge: Challenge
  onDismiss?: () => void
  showHints?: boolean
}

export function ChallengeBanner({ challenge, onDismiss, showHints = false }: ChallengeBannerProps) {
  const { settings } = useGameStore()
  const lang = settings.language

  // Get difficulty stars
  const difficultyStars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`text-xs ${i < challenge.difficulty ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
    >
      ★
    </span>
  ))

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'creative': return 'from-purple-500 to-pink-500'
      case 'restrictive': return 'from-red-500 to-orange-500'
      case 'difficulty': return 'from-blue-500 to-cyan-500'
      case 'fun': return 'from-green-500 to-emerald-500'
      default: return 'from-amber-500 to-orange-500'
    }
  }

  // Get hints
  const hints = challenge.getHints?.() || []

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-gradient-to-r ${getCategoryColor(challenge.category)} text-white p-4 rounded-2xl mb-4 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
          className="text-4xl"
        >
          {challenge.icon}
        </motion.span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{challenge.name}</h3>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
              +{challenge.bonusPoints} pts
            </span>
          </div>
          
          <p className="text-sm opacity-90 mb-2">{challenge.description}</p>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="opacity-70">Difficulty:</span>
              <div className="flex">{difficultyStars}</div>
            </div>
            <div className="px-2 py-0.5 bg-white/20 rounded-full capitalize">
              {challenge.category}
            </div>
          </div>

          {/* Hints Section */}
          {showHints && hints.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 pt-3 border-t border-white/20"
            >
              <p className="text-xs font-medium mb-1 opacity-70">💡 Hints:</p>
              <ul className="text-xs space-y-1">
                {hints.map((hint, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="opacity-50">•</span>
                    <span className="opacity-90">{hint}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
        
        {onDismiss && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDismiss}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss challenge"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Challenge Selection Modal ──────────────────────────────────────────────

interface ChallengeSelectionProps {
  challenges: Challenge[]
  onSelect: (challenge: Challenge) => void
  onClose: () => void
}

export function ChallengeSelection({ challenges, onSelect, onClose }: ChallengeSelectionProps) {
  const { settings } = useGameStore()
  const lang = settings.language

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Select Challenge
        </h3>

        <div className="space-y-3">
          {challenges.map((challenge) => (
            <motion.button
              key={challenge.id}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(challenge)}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{challenge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">{challenge.name}</h4>
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">
                      +{challenge.bonusPoints}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">Difficulty:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`text-xs ${i < challenge.difficulty ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full mt-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-xl"
        >
          Skip Challenge
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Active Challenge Display ───────────────────────────────────────────────

interface ActiveChallengeProps {
  challenge: Challenge
  completed?: boolean
}

export function ActiveChallenge({ challenge, completed = false }: ActiveChallengeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
        completed
          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
      }`}
    >
      <span>{challenge.icon}</span>
      <span>{challenge.name}</span>
      {completed && <span>✓</span>}
    </motion.div>
  )
}
