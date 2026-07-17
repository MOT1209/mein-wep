'use client'

import { motion } from 'framer-motion'
import { FaArrowLeft } from 'react-icons/fa'
import { t } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import type { GameType, Category } from '@/store/gameStore'

interface DrawingHeaderProps {
  currentRound: number
  totalRounds: number
  currentPlayerName: string
  timeLeft: number
  showWord: boolean
  gameType: GameType
  currentLetter: string | null
  creativePrompt: string | null
  currentWordEmoji: string
  currentWordText: string
  lang: Lang
  onBack: () => void
}

export function DrawingHeader({
  currentRound,
  totalRounds,
  currentPlayerName,
  timeLeft,
  showWord,
  gameType,
  currentLetter,
  creativePrompt,
  currentWordEmoji,
  currentWordText,
  lang,
  onBack,
}: DrawingHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 text-slate-600 dark:text-white"
          aria-label={t('common.back', lang)}
        >
          <FaArrowLeft className="text-xl" />
        </motion.button>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('draw.round', lang)} {currentRound}/{totalRounds}
          </p>
          <p className="font-bold text-slate-800 dark:text-white">
            {currentPlayerName}
          </p>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`text-3xl font-bold ${
          timeLeft <= 10
            ? 'text-red-500 animate-pulse'
            : timeLeft <= 20
              ? 'text-yellow-500'
              : 'text-primary-500'
        }`}
        aria-live="polite"
        aria-label={`${timeLeft} seconds left`}
      >
        {timeLeft}s
      </div>

      {/* Word Display */}
      <div className="text-right">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {gameType === 'letter'
            ? t('draw.letter', lang)
            : gameType === 'creative'
              ? t('draw.challenge', lang)
              : t('draw.label', lang)}
        </p>
        <p className="font-bold text-slate-800 dark:text-white">
          {!showWord
            ? '❓ ???'
            : gameType === 'letter'
              ? <span className="text-2xl">{currentLetter || ''}</span>
              : gameType === 'creative'
                ? <span className="text-sm">{creativePrompt || ''}</span>
                : `${currentWordEmoji} ${currentWordText}`}
        </p>
      </div>
    </div>
  )
}
