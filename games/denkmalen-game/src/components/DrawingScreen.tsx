'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getRandomWord, getRandomCreativePrompt, getLetters } from '@/store/gameStore'
import { t } from '@/lib/i18n'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'
import {
  DrawingHeader,
  WarningOverlay,
  WaitingOverlay,
  WordRevealBanner,
  DrawingToolbar,
  ColorPickerModal,
  BrushSizeModal,
  ClearCanvasModal,
  floodFill,
  getCanvasCoordinates,
  applyToolStyle,
} from '@/components/drawing'
import type { Tool } from '@/components/drawing'

export function DrawingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    currentWord, currentRound, totalRounds, timeLeft,
    mode, currentPlayer, players, phase, room,
    gameType, currentLetter, creativePrompt,
    setPhase, decrementTime,
    setWord, setCurrentLetter, setCreativePrompt, addDrawing,
    saveDrawingToHistory, undo, redo, clearCanvas, setPlayer,
    drawingHistory, historyIndex, settings,
  } = useGameStore()

  const { playSound, vibrate } = useGame()
  const { submitDrawing: socketSubmitDrawing, submittedCount } = useSocket()
  const lang = settings.language

  // ── Local UI State ───────────────────────────────────────────────────────
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [zoom, setZoom] = useState(1)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushSizes, setShowBrushSizes] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [showWarning, setShowWarning] = useState(() => mode !== 'online')
  const [showWord, setShowWord] = useState(() => mode === 'online')
  const [waitingForOthers, setWaitingForOthers] = useState(false)
  const [pinchDistance, setPinchDistance] = useState(0)

  // ── Canvas Helpers ───────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let snapshot: HTMLCanvasElement | null = null
    if (canvas.width > 0 && canvas.height > 0) {
      snapshot = document.createElement('canvas')
      snapshot.width = canvas.width
      snapshot.height = canvas.height
      snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
    }

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (snapshot) ctx.drawImage(snapshot, 0, 0)
  }, [])

  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current) return
    saveDrawingToHistory(canvasRef.current.toDataURL('image/png'))
  }, [saveDrawingToHistory])

  const clearCanvasPixels = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // ── Drawing Handlers ─────────────────────────────────────────────────────

  const getCoords = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 }
      return getCanvasCoordinates(e, containerRef.current, canvasRef.current, zoom)
    },
    [zoom],
  )

  const startDrawing = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!canvasRef.current || showWarning) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return
      const { x, y } = getCoords(e)

      if (tool === 'fill') {
        floodFill(ctx, Math.floor(x), Math.floor(y), color)
        saveCanvasState()
        return
      }

      setIsDrawing(true)
      ctx.beginPath()
      ctx.moveTo(x, y)
      applyToolStyle(ctx, tool, color, brushSize)
    },
    [tool, color, brushSize, showWarning, getCoords, saveCanvasState],
  )

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDrawing || !canvasRef.current || showWarning) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return
      const { x, y } = getCoords(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing, showWarning, getCoords],
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.closePath()
    setIsDrawing(false)
    ctx.globalAlpha = 1
    saveCanvasState()
  }, [isDrawing, saveCanvasState])

  // ── Touch Handlers (pinch-to-zoom + drawing) ─────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        setPinchDistance(Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        ))
      } else if (e.touches.length === 1 && !showWarning) {
        startDrawing(e)
      }
    },
    [showWarning, startDrawing],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchDistance > 0) {
        e.preventDefault()
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        )
        setZoom((z) => Math.min(3, Math.max(0.5, z * (d / pinchDistance))))
        setPinchDistance(d)
      } else if (e.touches.length === 1 && !showWarning) {
        draw(e)
      }
    },
    [pinchDistance, showWarning, draw],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) setPinchDistance(0)
      if (e.touches.length === 0) stopDrawing()
    },
    [stopDrawing],
  )

  // ── Word / Prompt Assignment ─────────────────────────────────────────────

  useEffect(() => {
    const state = useGameStore.getState()
    if (state.mode === 'online') return

    if (state.gameType === 'letter') {
      if (!state.currentLetter) {
        const letters = getLetters(state.settings.language)
        setCurrentLetter(letters[Math.floor(Math.random() * letters.length)])
      }
    } else if (state.gameType === 'creative') {
      if (!state.creativePrompt) setCreativePrompt(getRandomCreativePrompt(state.settings.language))
    } else {
      if (!currentWord) {
        const cat = state.gameType === 'category' ? (state.selectedCategory || 'random') : state.selectedCategory
        setWord(getRandomWord(cat))
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'drawing' || showWarning) return
    const timer = setInterval(() => {
      decrementTime()
      const left = useGameStore.getState().timeLeft
      if (left <= 1) {
        clearInterval(timer)
        playSound('end')
        vibrate([200, 100, 200])
        handleTimeUp()
      } else if (left <= 5) {
        playSound('countdown')
        vibrate(50)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, showWarning]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Undo / Redo visual sync ─────────────────────────────────────────────

  useEffect(() => {
    if (!canvasRef.current || historyIndex < 0) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = drawingHistory[historyIndex]
  }, [historyIndex, drawingHistory])

  // ── Canvas init + resize ────────────────────────────────────────────────

  useEffect(() => {
    resizeCanvas()
    if (drawingHistory.length > 0 && historyIndex >= 0) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0)
        img.src = drawingHistory[historyIndex]
      }
    }
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers for submit logic ─────────────────────────────────────────────

  const getWordAndCategory = () => {
    const s = useGameStore.getState()
    const wordText = s.gameType === 'letter'
      ? (s.currentLetter || '')
      : s.gameType === 'creative'
        ? (s.creativePrompt || '')
        : (currentWord?.word || '')
    const wordCategory = s.gameType === 'category' || s.gameType === 'classic'
      ? (currentWord?.category || 'random')
      : s.gameType === 'letter' ? 'letter' : 'creative'
    return { wordText, wordCategory }
  }

  const submitForOnline = (dataUrl: string) => {
    const { wordText, wordCategory } = getWordAndCategory()
    socketSubmitDrawing({ word: wordText, canvasData: dataUrl, category: wordCategory })
    setWaitingForOthers(true)
  }

  const submitOfflineTurn = (dataUrl: string) => {
    const { wordText, wordCategory } = getWordAndCategory()
    addDrawing({
      id: Date.now().toString(),
      playerId: currentPlayer?.id || '',
      word: wordText,
      canvasData: dataUrl,
      category: wordCategory,
      timestamp: Date.now(),
    })

    const playerIndex = players.findIndex((p) => p.id === currentPlayer?.id)
    const nextPlayerIndex = playerIndex + 1

    if (nextPlayerIndex < players.length) {
      setPlayer(players[nextPlayerIndex])
      setShowWarning(true)
      setShowWord(false)
      clearCanvas()
      clearCanvasPixels()
      useGameStore.setState({ timeLeft: useGameStore.getState().drawingTime })
    } else {
      setPhase('voting')
    }
  }

  const handleTimeUp = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    if (mode === 'online') {
      if (!waitingForOthers) submitForOnline(dataUrl)
      return
    }
    submitOfflineTurn(dataUrl)
  }

  const handleRevealWord = () => {
    setShowWarning(false)
    setShowWord(true)
    playSound('success')
    vibrate()
  }

  const handleSubmit = () => {
    if (!canvasRef.current || showWarning) return
    playSound('success')
    vibrate([100, 50, 100])
    const dataUrl = canvasRef.current.toDataURL('image/png')
    if (mode === 'online') {
      if (waitingForOthers) return
      submitForOnline(dataUrl)
      return
    }
    submitOfflineTurn(dataUrl)
  }

  const handleClearConfirm = () => {
    playSound('click')
    vibrate()
    clearCanvas()
    clearCanvasPixels()
    setShowClearModal(false)
  }

  const clampZoom = (z: number) => Math.min(3, Math.max(0.5, z))

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <DrawingHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentPlayerName={currentPlayer?.name || ''}
        timeLeft={timeLeft}
        showWord={showWord}
        gameType={gameType}
        currentLetter={currentLetter}
        creativePrompt={creativePrompt}
        currentWordEmoji={currentWord?.emoji || ''}
        currentWordText={currentWord?.word || ''}
        lang={lang}
        onBack={() => { playSound('click'); setPhase('menu') }}
      />

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden"
      >
        <AnimatePresence>
          {showWarning && (
            <WarningOverlay
              playerName={currentPlayer?.name || ''}
              lang={lang}
              onReveal={handleRevealWord}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {waitingForOthers && (
            <WaitingOverlay
              lang={lang}
              submittedCount={submittedCount}
              totalPlayers={room?.players.length || 0}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWord && !showWarning && (
            <WordRevealBanner
              gameType={gameType}
              currentLetter={currentLetter}
              creativePrompt={creativePrompt}
              wordEmoji={currentWord?.emoji || ''}
              wordText={currentWord?.word || ''}
              lang={lang}
            />
          )}
        </AnimatePresence>

        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: zoom > 1 ? 'none' : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <canvas
            ref={canvasRef}
            className={`drawing-canvas ${tool === 'eraser' ? 'eraser' : ''}`}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
              touchAction: 'none',
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      </div>

      {/* Toolbar */}
      <DrawingToolbar
        tool={tool}
        color={color}
        brushSize={brushSize}
        zoom={zoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < drawingHistory.length - 1}
        showWarning={showWarning}
        lang={lang}
        onToolChange={setTool}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onZoomChange={(d) => setZoom((z) => clampZoom(z + d))}
        onUndo={() => { playSound('click'); undo() }}
        onRedo={() => { playSound('click'); redo() }}
        onClear={() => { playSound('click'); setShowClearModal(true) }}
        onSubmit={handleSubmit}
        onShowColorPicker={() => setShowColorPicker(true)}
        onShowBrushSizes={() => setShowBrushSizes(true)}
      />

      {/* Modals */}
      <ColorPickerModal
        isOpen={showColorPicker}
        currentColor={color}
        lang={lang}
        onSelect={(c) => { playSound('click'); setColor(c); setShowColorPicker(false) }}
        onClose={() => setShowColorPicker(false)}
      />
      <BrushSizeModal
        isOpen={showBrushSizes}
        currentSize={brushSize}
        lang={lang}
        onSelect={(s) => { playSound('click'); setBrushSize(s); setShowBrushSizes(false) }}
        onClose={() => setShowBrushSizes(false)}
      />
      <ClearCanvasModal
        isOpen={showClearModal}
        lang={lang}
        onConfirm={handleClearConfirm}
        onClose={() => setShowClearModal(false)}
      />
    </motion.div>
  )
}
