'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash } from 'react-icons/fa'
import { t } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import { COLORS, BRUSH_SIZES } from './canvasUtils'

// ── Color Picker Modal ───────────────────────────────────────────────────────

interface ColorPickerModalProps {
  isOpen: boolean
  currentColor: string
  lang: Lang
  onSelect: (color: string) => void
  onClose: () => void
}

export function ColorPickerModal({ isOpen, currentColor, lang, onSelect, onClose }: ColorPickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 flex items-end p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-full"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
              {t('draw.selectColor', lang)}
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className={`w-full aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                    currentColor === c
                      ? 'border-primary-500 ring-2 ring-primary-500'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Brush Size Modal ─────────────────────────────────────────────────────────

interface BrushSizeModalProps {
  isOpen: boolean
  currentSize: number
  lang: Lang
  onSelect: (size: number) => void
  onClose: () => void
}

export function BrushSizeModal({ isOpen, currentSize, lang, onSelect, onClose }: BrushSizeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 flex items-end p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-full"
          >
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
              {t('draw.brushSize', lang)}
            </h3>
            <div className="flex items-center justify-around">
              {BRUSH_SIZES.map((size) => (
                <motion.button
                  key={size}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelect(size)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
                    currentSize === size ? 'bg-primary-100 dark:bg-primary-900' : ''
                  }`}
                >
                  <div
                    className="rounded-full bg-slate-800 dark:bg-white"
                    style={{ width: size + 8, height: size + 8 }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{size}px</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Clear Canvas Modal ───────────────────────────────────────────────────────

interface ClearCanvasModalProps {
  isOpen: boolean
  lang: Lang
  onConfirm: () => void
  onClose: () => void
}

export function ClearCanvasModal({ isOpen, lang, onConfirm, onClose }: ClearCanvasModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FaTrash className="text-2xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('draw.clearCanvas', lang)}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {t('draw.clearWarning', lang)}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white 
                             font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('common.cancel', lang)}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl 
                             hover:bg-red-600 transition-colors"
                >
                  {t('draw.clear', lang)}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
