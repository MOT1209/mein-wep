'use client'

import { useRef, useCallback } from 'react'
import { FaShare, FaDownload } from 'react-icons/fa'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'

interface ResultCardProps {
  drawing: string // base64 image
  word: string
  aiComment: string
  score: number
  playerName: string
}

export function ResultCard({ drawing, word, aiComment, score, playerName }: ResultCardProps) {
  const lang = useGameStore((s) => s.settings.language)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCard = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(0.5, '#764ba2')
      gradient.addColorStop(1, '#f093fb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // White card in center
      const cardMargin = 60
      const cardWidth = canvas.width - cardMargin * 2
      const cardHeight = canvas.height - cardMargin * 2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardMargin, cardWidth, cardHeight, 24)
      ctx.fill()

      // Draw the user's drawing
      const img = new Image()
      img.onload = () => {
        // Drawing area
        const drawX = 120
        const drawY = 180
        const drawSize = 400
        
        // Border
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.roundRect(drawX - 4, drawY - 4, drawSize + 8, drawSize + 8, 12)
        ctx.stroke()
        
        // Draw image
        ctx.drawImage(img, drawX, drawY, drawSize, drawSize)

        // Title: DENKMALEN
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 48px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('DENKMALEN', canvas.width / 2, 120)

        // Word
        ctx.fillStyle = '#64748b'
        ctx.font = '32px Arial, sans-serif'
        ctx.fillText(`Word: ${word}`, canvas.width / 2, 160)

        // Score circle
        const scoreX = 700
        const scoreY = 380
        const scoreRadius = 80

        ctx.beginPath()
        ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2)
        ctx.fillStyle = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
        ctx.fill()

        ctx.fillStyle = 'white'
        ctx.font = 'bold 56px Arial, sans-serif'
        ctx.fillText(String(score), scoreX, scoreY + 20)

        ctx.font = '20px Arial, sans-serif'
        ctx.fillText('SCORE', scoreX, scoreY + 45)

        // AI Comment
        ctx.fillStyle = '#1e293b'
        ctx.font = 'italic 24px Arial, sans-serif'
        ctx.textAlign = 'center'
        
        // Word wrap the comment
        const maxWidth = cardWidth - 120
        const words = aiComment.split(' ')
        let line = ''
        let y = 660
        
        for (const word of words) {
          const testLine = line + word + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && line) {
            ctx.fillText(line.trim(), canvas.width / 2, y)
            line = word + ' '
            y += 35
          } else {
            line = testLine
          }
        }
        ctx.fillText(line.trim(), canvas.width / 2, y)

        // Player name
        ctx.fillStyle = '#64748b'
        ctx.font = '28px Arial, sans-serif'
        ctx.fillText(`Drawn by ${playerName}`, canvas.width / 2, 820)

        // Footer
        ctx.fillStyle = '#94a3b8'
        ctx.font = '22px Arial, sans-serif'
        ctx.fillText('rashid-wep.vercel.app/denkmalen', canvas.width / 2, 950)

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/png')
      }

      img.onerror = () => resolve(null)
      img.src = drawing
    })
  }, [drawing, word, aiComment, score, playerName])

  const handleDownload = async () => {
    const blob = await generateCard()
    if (!blob) return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `denkmalen-${word}-${score}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const blob = await generateCard()
    if (!blob) return

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], `denkmalen-${word}-${score}.png`, { type: 'image/png' })
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: t('result.shareTitle', lang),
            text: t('result.shareText', lang).replace('{score}', String(score)).replace('{word}', word),
            files: [file],
          })
          return
        } catch {
          // User cancelled or share failed — fall through to download
        }
      }
    }

    // Fallback to download
    handleDownload()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500
                   text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all
                   text-sm"
      >
        <FaShare />
        {t('result.share', lang)}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700
                   text-slate-700 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all
                   border border-slate-200 dark:border-slate-600 text-sm"
      >
        <FaDownload />
        {t('result.download', lang)}
      </button>
    </div>
  )
}