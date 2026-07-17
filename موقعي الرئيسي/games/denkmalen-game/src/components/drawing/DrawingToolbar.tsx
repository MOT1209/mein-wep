'use client'

import { motion } from 'framer-motion'
import {
  FaUndo, FaRedo, FaEraser, FaPaintBrush,
  FaMarker, FaFillDrip, FaTrash, FaCheck, FaSearchPlus, FaSearchMinus
} from 'react-icons/fa'
import { BsPencil } from 'react-icons/bs'
import { t } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import type { Tool } from './canvasUtils'
import { COLORS, BRUSH_SIZES } from './canvasUtils'

interface DrawingToolbarProps {
  tool: Tool
  color: string
  brushSize: number
  zoom: number
  canUndo: boolean
  canRedo: boolean
  showWarning: boolean
  lang: Lang
  onToolChange: (tool: Tool) => void
  onColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
  onZoomChange: (delta: number) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onSubmit: () => void
  onShowColorPicker: () => void
  onShowBrushSizes: () => void
}

export function DrawingToolbar({
  tool,
  color,
  brushSize,
  zoom,
  canUndo,
  canRedo,
  showWarning,
  lang,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onZoomChange,
  onUndo,
  onRedo,
  onClear,
  onSubmit,
  onShowColorPicker,
  onShowBrushSizes,
}: DrawingToolbarProps) {
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'pencil', icon: <BsPencil className="text-xl" />, label: t('tool.pencil', lang) },
    { id: 'brush', icon: <FaPaintBrush className="text-xl" />, label: t('tool.brush', lang) },
    { id: 'marker', icon: <FaMarker className="text-xl" />, label: t('tool.marker', lang) },
    { id: 'fill', icon: <FaFillDrip className="text-xl" />, label: t('tool.fill', lang) },
    { id: 'eraser', icon: <FaEraser className="text-xl" />, label: t('tool.eraser', lang) },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg p-3">
      {/* Top Row — Tools */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          {/* Undo / Redo */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={t('tool.undo', lang)}
            className="tool-button disabled:opacity-30"
          >
            <FaUndo className="text-xl text-slate-700 dark:text-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onRedo}
            disabled={!canRedo}
            aria-label={t('tool.redo', lang)}
            className="tool-button disabled:opacity-30"
          >
            <FaRedo className="text-xl text-slate-700 dark:text-white" />
          </motion.button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-600 mx-2" />

          {/* Drawing Tools */}
          {tools.map((t) => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToolChange(t.id)}
              aria-label={t.label}
              aria-pressed={tool === t.id}
              className={`tool-button ${tool === t.id ? 'active' : ''}`}
            >
              {t.icon}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2 min-w-max">
          {/* Zoom Controls */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onZoomChange(-0.25)}
            disabled={zoom <= 0.5}
            aria-label={t('tool.zoomOut', lang)}
            className="tool-button disabled:opacity-30"
          >
            <FaSearchMinus className="text-lg text-slate-700 dark:text-white" />
          </motion.button>
          <span aria-live="polite" className="text-xs text-slate-500 dark:text-slate-400 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onZoomChange(0.25)}
            disabled={zoom >= 3}
            aria-label={t('tool.zoomIn', lang)}
            className="tool-button disabled:opacity-30"
          >
            <FaSearchPlus className="text-lg text-slate-700 dark:text-white" />
          </motion.button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />

          {/* Clear */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClear}
            aria-label={t('tool.clearCanvas', lang)}
            className="tool-button text-red-500"
          >
            <FaTrash className="text-xl" />
          </motion.button>
        </div>
      </div>

      {/* Bottom Row — Color & Size */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Color Picker Toggle */}
        <div className="flex items-center gap-2 min-w-max">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onShowColorPicker}
            aria-label={t('tool.currentColor', lang)}
            className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <div className="flex gap-1">
            {COLORS.slice(0, 8).map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                aria-label={`${t('tool.colorNamed', lang)} ${c}`}
                aria-pressed={color === c}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? 'border-primary-500 scale-110' : 'border-white'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Brush Size Toggle */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onShowBrushSizes}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
          >
            <div
              className="rounded-full bg-slate-800 dark:bg-white"
              style={{ width: brushSize + 4, height: brushSize + 4 }}
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">{brushSize}px</span>
          </motion.button>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: showWarning ? 1 : 1.05 }}
          whileTap={{ scale: showWarning ? 1 : 0.95 }}
          onClick={onSubmit}
          disabled={showWarning}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500
                     text-white font-bold rounded-xl shadow-lg flex items-center gap-2
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaCheck />
          {t('draw.done', lang)}
        </motion.button>
      </div>
    </div>
  )
}
