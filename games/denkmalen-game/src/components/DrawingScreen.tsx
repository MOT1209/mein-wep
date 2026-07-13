'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, getRandomWord, getRandomCreativePrompt, LETTERS } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { 
  FaArrowLeft, FaUndo, FaRedo, FaEraser, FaPaintBrush,
  FaMarker, FaFillDrip, FaTrash, FaCheck, FaEye, FaSearchPlus, FaSearchMinus, FaUndoAlt
} from 'react-icons/fa'
import { BsPencil } from 'react-icons/bs'

type Tool = 'pencil' | 'brush' | 'marker' | 'eraser' | 'fill'

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF5722', '#795548',
  '#9E9E9E', '#607D8B', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
  '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B',
]

const BRUSH_SIZES = [2, 4, 8, 12, 20, 30]

export function DrawingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { 
    currentWord, currentRound, totalRounds, timeLeft, 
    mode, currentPlayer, players, phase,
    gameType, currentLetter, creativePrompt,
    setPhase, setTimeLeft, decrementTime, nextRound,
    setWord, setCurrentLetter, setCreativePrompt, addDrawing, setDrawing, drawingHistory, historyIndex,
    saveDrawingToHistory, undo, redo, clearCanvas, setPlayer
  } = useGameStore()
  const { playSound, vibrate } = useGame()
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushSizes, setShowBrushSizes] = useState(false)
  const [showWarning, setShowWarning] = useState(true)
  const [showWord, setShowWord] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showClearModal, setShowClearModal] = useState(false)
  const [pinchDistance, setPinchDistance] = useState(0)
  
  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return
    
    const canvas = canvasRef.current
    const container = containerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Save current drawing
    const imageData = canvas.width > 0 && canvas.height > 0 
      ? ctx.getImageData(0, 0, canvas.width, canvas.height) 
      : null
    
    // Set canvas size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    
    // Fill with white
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Restore drawing
    if (imageData) {
      ctx.putImageData(imageData, 0, 0)
    }
    
    setCanvasReady(true)
  }, [])
  
  // Initialize canvas and handle resize
  useEffect(() => {
    resizeCanvas()
    
    // Load from history if exists
    if (drawingHistory.length > 0 && historyIndex >= 0) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
        }
        img.src = drawingHistory[historyIndex]
      }
    }
    
    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [resizeCanvas])
  
  // Clamp zoom
  const clampZoom = (z: number) => Math.min(3, Math.max(0.5, z))
  
  // Get canvas coordinates (accounting for zoom)
  const getCoordinates = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return { x: 0, y: 0 }
    
    // Get the container's bounding rect (not the canvas, since canvas may be scaled)
    const containerRect = container.getBoundingClientRect()
    
    // Calculate position relative to the container
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    // Position relative to container
    const relX = clientX - containerRect.left
    const relY = clientY - containerRect.top
    
    // Account for zoom: divide by zoom to get canvas coordinates
    const scaleX = canvas.width / containerRect.width
    const scaleY = canvas.height / containerRect.height
    
    return {
      x: (relX / zoom) * scaleX + ((zoom - 1) * canvas.width / 2 / zoom) * (1 / scaleX),
      y: (relY / zoom) * scaleY + ((zoom - 1) * canvas.height / 2 / zoom) * (1 / scaleY),
    }
  }, [zoom])
  
  // Drawing functions
  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!canvasRef.current || showWarning) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    const { x, y } = getCoordinates(e)
    
    if (tool === 'fill') {
      // Bucket fill - simple flood fill
      floodFill(ctx, Math.floor(x), Math.floor(y), color)
      saveCanvasState()
      return
    }
    
    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // Set drawing style based on tool
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    switch (tool) {
      case 'pencil':
        ctx.lineWidth = brushSize
        ctx.globalAlpha = 1
        ctx.strokeStyle = color
        break
      case 'brush':
        ctx.lineWidth = brushSize * 1.5
        ctx.globalAlpha = 0.7
        ctx.strokeStyle = color
        break
      case 'marker':
        ctx.lineWidth = brushSize * 2
        ctx.globalAlpha = 0.8
        ctx.strokeStyle = color
        break
      case 'eraser':
        ctx.lineWidth = brushSize * 3
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#FFFFFF'
        break
    }
  }, [tool, color, brushSize, showWarning, getCoordinates])
  
  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current || showWarning) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    const { x, y } = getCoordinates(e)
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, showWarning, getCoordinates])
  
  const stopDrawing = useCallback(() => {
    if (!isDrawing || !canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    ctx.closePath()
    setIsDrawing(false)
    ctx.globalAlpha = 1
    
    saveCanvasState()
  }, [isDrawing])
  
  // Pinch-to-zoom handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setPinchDistance(distance)
    } else if (e.touches.length === 1 && !showWarning) {
      startDrawing(e)
    }
  }, [showWarning, startDrawing])
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDistance > 0) {
      e.preventDefault()
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scale = newDistance / pinchDistance
      setZoom(prev => Math.min(3, Math.max(0.5, prev * scale)))
      setPinchDistance(newDistance)
    } else if (e.touches.length === 1 && !showWarning) {
      draw(e)
    }
  }, [pinchDistance, showWarning, draw])
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setPinchDistance(0)
    }
    if (e.touches.length === 0) {
      stopDrawing()
    }
  }, [stopDrawing])
  
  const saveCanvasState = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    saveDrawingToHistory(dataUrl)
  }
  
  // Flood fill algorithm
  const floodFill = (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const canvas = ctx.canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    const targetColor = getPixelColor(data, startX, startY, canvas.width)
    const fill = hexToRgb(fillColor)
    
    if (colorsMatch(targetColor, fill)) return
    
    const stack: [number, number][] = [[startX, startY]]
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
      
      const currentColor = getPixelColor(data, x, y, canvas.width)
      if (!colorsMatch(currentColor, targetColor)) continue
      
      setPixelColor(data, x, y, canvas.width, fill)
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
    
    ctx.putImageData(imageData, 0, 0)
  }
  
  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const index = (y * width + x) * 4
    return [data[index], data[index + 1], data[index + 2], data[index + 3]]
  }
  
  const setPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number, color: number[]) => {
    const index = (y * width + x) * 4
    data[index] = color[0]
    data[index + 1] = color[1]
    data[index + 2] = color[2]
    data[index + 3] = 255
  }
  
  const colorsMatch = (a: number[], b: number[]) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  }
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ] : [0, 0, 0]
  }
  
  // Handle word/prompt assignment based on game type
  useEffect(() => {
    const state = useGameStore.getState()
    
    if (state.gameType === 'letter') {
      // Letter Mode: pick a random letter and show it
      if (!state.currentLetter) {
        const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
        setCurrentLetter(randomLetter)
      }
    } else if (state.gameType === 'creative') {
      // Creative Challenge: use a random creative prompt
      if (!state.creativePrompt) {
        const prompt = getRandomCreativePrompt()
        setCreativePrompt(prompt)
      }
    } else if (state.gameType === 'category') {
      // Category Mode: get a word from the selected category
      if (!currentWord) {
        const cat = state.selectedCategory || 'random'
        const word = getRandomWord(cat)
        setWord(word)
      }
    } else {
      // Classic Mode: existing behavior
      if (!currentWord) {
        const category = state.selectedCategory
        const word = getRandomWord(category)
        setWord(word)
      }
    }
  }, [])
  
  // Timer
  useEffect(() => {
    if (phase !== 'drawing' || showWarning) return
    
    const timer = setInterval(() => {
      decrementTime()
      if (timeLeft <= 1) {
        clearInterval(timer)
        playSound('end')
        vibrate([200, 100, 200])
        handleTimeUp()
      } else if (timeLeft <= 5) {
        playSound('countdown')
        vibrate(50)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [phase, timeLeft, showWarning])
  
  const handleTimeUp = () => {
    // Save current drawing
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const state = useGameStore.getState()
      const wordText = state.gameType === 'letter' 
        ? (state.currentLetter || '')
        : state.gameType === 'creative'
          ? (state.creativePrompt || '')
          : (currentWord?.word || '')
      const wordCategory = state.gameType === 'category' || state.gameType === 'classic'
        ? (currentWord?.category || 'random')
        : state.gameType === 'letter' ? 'letter' : 'creative'
      addDrawing({
        id: Date.now().toString(),
        playerId: currentPlayer?.id || '',
        word: wordText,
        canvasData: dataUrl,
        category: wordCategory,
        timestamp: Date.now(),
      })
    }
    
    // Check if more rounds
    if (currentRound < totalRounds) {
      nextRound()
      setShowWarning(true)
      setShowWord(false)
      clearCanvas()
    } else {
      setPhase('voting')
    }
  }
  
  const handleRevealWord = () => {
    setShowWarning(false)
    setShowWord(true)
    playSound('success')
    vibrate()
  }
  
  const handleSubmit = () => {
    if (!canvasRef.current) return
    
    playSound('success')
    vibrate([100, 50, 100])
    
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const state = useGameStore.getState()
    const wordText = state.gameType === 'letter' 
      ? (state.currentLetter || '')
      : state.gameType === 'creative'
        ? (state.creativePrompt || '')
        : (currentWord?.word || '')
    const wordCategory = state.gameType === 'category' || state.gameType === 'classic'
      ? (currentWord?.category || 'random')
      : state.gameType === 'letter' ? 'letter' : 'creative'
    addDrawing({
      id: Date.now().toString(),
      playerId: currentPlayer?.id || '',
      word: wordText,
      canvasData: dataUrl,
      category: wordCategory,
      timestamp: Date.now(),
    })
    
    // In offline mode, move to next player or next round
    if (mode === 'offline') {
      const playerIndex = players.findIndex(p => p.id === currentPlayer?.id)
      const nextPlayerIndex = playerIndex + 1
      
      if (nextPlayerIndex < players.length) {
        // More players to draw
        setPlayer(players[nextPlayerIndex])
        setShowWarning(true)
        setShowWord(false)
        clearCanvas()
        useGameStore.setState({ timeLeft: useGameStore.getState().drawingTime })
      } else if (currentRound < totalRounds) {
        // Next round
        nextRound()
        setPlayer(players[0])
        setShowWarning(true)
        setShowWord(false)
        clearCanvas()
        useGameStore.setState({ timeLeft: useGameStore.getState().drawingTime })
      } else {
        // Game over - go to voting
        setPhase('voting')
      }
    }
  }
  
  // Undo/Redo
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
  }, [historyIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { playSound('click'); setPhase('menu') }}
            className="p-2 text-slate-600 dark:text-white"
          >
            <FaArrowLeft className="text-xl" />
          </motion.button>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Round {currentRound}/{totalRounds}
            </p>
            <p className="font-bold text-slate-800 dark:text-white">
              {currentPlayer?.name}
            </p>
          </div>
        </div>
        
        {/* Timer */}
        <div className={`text-3xl font-bold ${
          timeLeft <= 10 ? 'text-red-500 animate-pulse' : 
          timeLeft <= 20 ? 'text-yellow-500' : 'text-primary-500'
        }`}>
          {timeLeft}s
        </div>
        
        {/* Word Display */}
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {gameType === 'letter' ? 'Letter:' : 
             gameType === 'creative' ? 'Challenge:' : 
             gameType === 'category' ? 'Drawing:' : 'Drawing:'}
          </p>
          <p className="font-bold text-slate-800 dark:text-white">
            {!showWord ? '❓ ???' : 
             gameType === 'letter' ? (
               <span className="text-2xl">{currentLetter || ''}</span>
             ) : gameType === 'creative' ? (
               <span className="text-sm">{creativePrompt || ''}</span>
             ) : (
               `${currentWord?.emoji} ${currentWord?.word}`
             )}
          </p>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden"
      >
        {/* Warning Overlay */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 z-20"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">👀</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Only {currentPlayer?.name} should look!
                </h2>
                <p className="text-slate-300 mb-8 text-lg">
                  Pass the device to the current player
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRevealWord}
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 
                             text-white font-bold text-xl rounded-2xl shadow-lg"
                >
                  <FaEye className="inline mr-2" />
                  Reveal Word
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Word Reveal */}
        <AnimatePresence>
          {showWord && !showWarning && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
            >
              {gameType === 'letter' ? (
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
                                px-8 py-4 rounded-full shadow-lg text-center">
                  <p className="text-sm opacity-80">Draw something starting with</p>
                  <p className="text-4xl font-black mt-1">{currentLetter || ''}</p>
                </div>
              ) : gameType === 'creative' ? (
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white 
                                px-6 py-3 rounded-2xl shadow-lg text-center max-w-xs">
                  <p className="text-sm opacity-80 mb-1">Creative Challenge</p>
                  <p className="text-base font-bold leading-tight">{creativePrompt || ''}</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
                                px-6 py-3 rounded-full shadow-lg text-xl font-bold">
                  {currentWord?.emoji} {currentWord?.word}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ 
            backgroundImage: zoom > 1 ? 'none' : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
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
              touchAction: 'none'
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
      
      {/* Tools Bar */}
      <div className="bg-white dark:bg-slate-800 shadow-lg p-3">
        {/* Top Row - Tools */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            {/* Undo/Redo */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); undo() }}
              disabled={historyIndex <= 0}
              className="tool-button disabled:opacity-30"
            >
              <FaUndo className="text-xl text-slate-700 dark:text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); redo() }}
              disabled={historyIndex >= drawingHistory.length - 1}
              className="tool-button disabled:opacity-30"
            >
              <FaRedo className="text-xl text-slate-700 dark:text-white" />
            </motion.button>
            
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600 mx-2" />
            
            {/* Drawing Tools */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setTool('pencil') }}
              className={`tool-button ${tool === 'pencil' ? 'active' : ''}`}
            >
              <BsPencil className="text-xl" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setTool('brush') }}
              className={`tool-button ${tool === 'brush' ? 'active' : ''}`}
            >
              <FaPaintBrush className="text-xl" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setTool('marker') }}
              className={`tool-button ${tool === 'marker' ? 'active' : ''}`}
            >
              <FaMarker className="text-xl" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setTool('fill') }}
              className={`tool-button ${tool === 'fill' ? 'active' : ''}`}
            >
              <FaFillDrip className="text-xl" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setTool('eraser') }}
              className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
            >
              <FaEraser className="text-xl" />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-2 min-w-max">
            {/* Zoom controls */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setZoom(z => clampZoom(z - 0.25)) }}
              disabled={zoom <= 0.5}
              className="tool-button disabled:opacity-30"
            >
              <FaSearchMinus className="text-lg text-slate-700 dark:text-white" />
            </motion.button>
            <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setZoom(z => clampZoom(z + 0.25)) }}
              disabled={zoom >= 3}
              className="tool-button disabled:opacity-30"
            >
              <FaSearchPlus className="text-lg text-slate-700 dark:text-white" />
            </motion.button>
            
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
            
            {/* Clear */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSound('click'); setShowClearModal(true) }}
              className="tool-button text-red-500"
            >
              <FaTrash className="text-xl" />
            </motion.button>
          </div>
        </div>
        
        {/* Bottom Row - Color & Size */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Color Picker */}
          <div className="flex items-center gap-2 min-w-max">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-inner"
              style={{ backgroundColor: color }}
            />
            <div className="flex gap-1">
              {COLORS.slice(0, 8).map((c) => (
                <button
                  key={c}
                  onClick={() => { playSound('click'); setColor(c) }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-primary-500 scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowBrushSizes(!showBrushSizes)}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                       text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
          >
            <FaCheck />
            Done
          </motion.button>
        </div>
      </div>
      
      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 flex items-end p-4"
            onClick={() => setShowColorPicker(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-full"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                Select Color
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      playSound('click')
                      setColor(c)
                      setShowColorPicker(false)
                    }}
                    className={`w-full aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                      color === c ? 'border-primary-500 ring-2 ring-primary-500' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Clear Canvas Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4"
            onClick={() => setShowClearModal(false)}
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
                  Clear Canvas?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  This action cannot be undone. Your current drawing will be erased.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white 
                               font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playSound('click')
                      vibrate()
                      clearCanvas()
                      if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d')
                        if (ctx) {
                          ctx.fillStyle = '#FFFFFF'
                          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                        }
                      }
                      setShowClearModal(false)
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-xl 
                               hover:bg-red-600 transition-colors"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Brush Size Modal */}
      <AnimatePresence>
        {showBrushSizes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 flex items-end p-4"
            onClick={() => setShowBrushSizes(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-full"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                Brush Size
              </h3>
              <div className="flex items-center justify-around">
                {BRUSH_SIZES.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      playSound('click')
                      setBrushSize(size)
                      setShowBrushSizes(false)
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
                      brushSize === size ? 'bg-primary-100 dark:bg-primary-900' : ''
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
    </motion.div>
  )
}
