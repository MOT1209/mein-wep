'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaEye } from 'react-icons/fa'
import { t } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'

// ── Warning Overlay (Pass Device) ────────────────────────────────────────────

interface WarningOverlayProps {
  playerName: string
  lang: Lang
  onReveal: () => void
}

export function WarningOverlay({ playerName, lang, onReveal }: WarningOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 z-20 select-none"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-6">👀</div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {playerName} {t('draw.onlyPlayer', lang)}
        </h2>
        <p className="text-slate-300 mb-8 text-lg">
          {t('draw.passDevice', lang)}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReveal}
          className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 
                     text-white font-bold text-xl rounded-2xl shadow-lg"
        >
          <FaEye className="inline mr-2" />
          {t('draw.reveal', lang)}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── Waiting Overlay (Online Mode) ────────────────────────────────────────────

interface WaitingOverlayProps {
  lang: Lang
  submittedCount: number
  totalPlayers: number
}

export function WaitingOverlay({ lang, submittedCount, totalPlayers }: WaitingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 z-20"
    >
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
        {t('draw.submitted', lang)}
      </h2>
      <p className="text-slate-300 text-lg">
        {t('draw.waitingOthers', lang)} ({submittedCount}/{totalPlayers})
      </p>
    </motion.div>
  )
}

// ── Word Reveal Banner ───────────────────────────────────────────────────────

interface WordRevealProps {
  gameType: string
  currentLetter: string | null
  creativePrompt: string | null
  wordEmoji: string
  wordText: string
  lang: Lang
}

export function WordRevealBanner({ gameType, currentLetter, creativePrompt, wordEmoji, wordText, lang }: WordRevealProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
    >
      {gameType === 'letter' ? (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
                        px-8 py-4 rounded-full shadow-lg text-center">
          <p className="text-sm opacity-80">{t('draw.drawStartsWith', lang)}</p>
          <p className="text-4xl font-black mt-1">{currentLetter || ''}</p>
        </div>
      ) : gameType === 'creative' ? (
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white 
                        px-6 py-3 rounded-2xl shadow-lg text-center max-w-xs">
          <p className="text-sm opacity-80 mb-1">{t('gametype.creative', lang)}</p>
          <p className="text-base font-bold leading-tight">{creativePrompt || ''}</p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
                        px-6 py-3 rounded-full shadow-lg text-xl font-bold">
          {wordEmoji} {wordText}
        </div>
      )}
    </motion.div>
  )
}
