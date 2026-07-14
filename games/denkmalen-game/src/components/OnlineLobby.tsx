'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, Category, GameType, LETTERS, getRandomWord, getRandomCreativePrompt } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'
import { QRCodeSVG } from 'qrcode.react'
import {
  FaArrowLeft, FaCopy, FaShare, FaUsers, FaPlus,
  FaTimes, FaPlay, FaCog, FaQrcode, FaLink, FaExclamationTriangle
} from 'react-icons/fa'

const CATEGORIES: { id: Category; name: string; emoji: string }[] = [
  { id: 'random', name: 'Random', emoji: '🎲' },
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'animals', name: 'Animals', emoji: '🐱' },
  { id: 'nature', name: 'Nature', emoji: '🌸' },
  { id: 'objects', name: 'Objects', emoji: '💡' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'jobs', name: 'Jobs', emoji: '👨‍🍳' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙' },
  { id: 'technology', name: 'Tech', emoji: '💻' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'history', name: 'History', emoji: '🏛️' },
]

const GAME_TYPES: { id: GameType; name: string; emoji: string; description: string }[] = [
  { id: 'classic', name: 'Classic', emoji: '🎨', description: 'Pick from 3 random words' },
  { id: 'letter', name: 'Letter Mode', emoji: '🔤', description: 'Words start with your letter' },
  { id: 'category', name: 'Category Mode', emoji: '📂', description: 'Draw from a category' },
  { id: 'creative', name: 'Creative Challenge', emoji: '🤖', description: 'AI gives you a prompt' },
]

export function OnlineLobby() {
  const {
    setPhase, room, currentPlayer,
    setCategory, selectedCategory,
    totalRounds, drawingTime, gameType, setGameType,
    currentLetter: storeLetter, setCurrentLetter
  } = useGameStore()
  const { playSound, vibrate } = useGame()
  const { createRoom: socketCreateRoom, joinRoom: socketJoinRoom, startGame: socketStartGame, connected, error, clearError } = useSocket()

  const [wantsToHost, setWantsToHost] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [rounds, setRounds] = useState(totalRounds)
  const [time, setTime] = useState(drawingTime)
  const [selectedGameType, setSelectedGameType] = useState<GameType>(gameType)
  const [selectedLetter, setSelectedLetter] = useState(storeLetter || 'A')
  const [joining, setJoining] = useState(false)

  const isRoomHost = !!(room && currentPlayer && room.hostId === currentPlayer.id)

  useEffect(() => {
    if (room || error) setJoining(false)
  }, [room, error])

  const handleGameTypeChange = (type: GameType) => {
    playSound('click')
    setSelectedGameType(type)
    setGameType(type)
    if (type === 'letter') {
      setCurrentLetter(selectedLetter)
    } else {
      setCurrentLetter(null)
    }
  }

  const handleLetterChange = (letter: string) => {
    playSound('click')
    setSelectedLetter(letter)
    setCurrentLetter(letter)
  }

  const shareUrl = (code: string) =>
    `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/join/${code}`

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code)
      playSound('click')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share && room?.code) {
      try {
        await navigator.share({
          title: 'Denkmalen - Join My Game!',
          text: `Join my Denkmalen game! Use code: ${room.code}`,
          url: shareUrl(room.code),
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  const handleCreateRoom = () => {
    if (!playerName.trim()) return
    clearError()
    playSound('click')
    setJoining(true)
    socketCreateRoom({
      playerName: playerName.trim(),
      rounds,
      drawingTime: time,
      category: selectedCategory,
    })
  }

  const handleJoin = () => {
    if (joinCode.length === 6 && playerName.trim()) {
      clearError()
      playSound('click')
      setJoining(true)
      socketJoinRoom({ roomCode: joinCode, playerName: playerName.trim() })
    }
  }

  const handleStartGame = () => {
    if (!room || room.players.length < 2) return
    playSound('success')
    vibrate([100, 50, 100])
    const words = Array.from({ length: room.players.length }, () => getRandomWord(selectedCategory))
    const letter = selectedGameType === 'letter' ? selectedLetter : null
    const prompt = selectedGameType === 'creative' ? getRandomCreativePrompt() : null
    socketStartGame(words, selectedGameType, letter, prompt)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen flex flex-col p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playSound('click'); setPhase('menu') }}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
        >
          <FaArrowLeft className="text-xl text-slate-700 dark:text-white" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Online Mode
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FaQrcode className="text-secondary-500" />
            Different Devices - Use QR Code or Room Code
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Error banner */}
        {error && (
          <div className="card bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
            <button onClick={clearError} className="text-red-500">
              <FaTimes />
            </button>
          </div>
        )}

        {/* In a room (host or joined) */}
        {room && (
          <>
            {/* Room Code - Big Display */}
            <div className="card text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-2">Share this code with friends:</p>
              <div className="text-6xl font-bold tracking-[0.3em] text-primary-500 mb-4 bg-slate-50 dark:bg-slate-700 py-4 rounded-xl">
                {room.code}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl 
                             flex items-center gap-2 text-slate-700 dark:text-white"
                >
                  <FaCopy />
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-4 py-2 bg-secondary-500 text-white rounded-xl 
                             flex items-center gap-2"
                >
                  <FaShare />
                  Share Link
                </motion.button>
              </div>

              {/* QR Code */}
              <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Or scan QR Code to join:
                </p>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG
                      value={shareUrl(room.code)}
                      size={180}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaUsers className="text-primary-500" />
                  Players ({room.players.length}/{room.maxPlayers})
                </h2>
              </div>

              <div className="space-y-3">
                {room.players.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">⏳</div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Waiting for players to join...
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                      Share the code or QR code above
                    </p>
                  </div>
                ) : (
                  room.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 
                                      flex items-center justify-center text-xl">
                        {player.avatar}
                      </div>
                      <span className="flex-1 font-medium text-slate-800 dark:text-white">
                        {player.name}
                      </span>
                      {player.id === room.hostId && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 
                                         dark:text-yellow-300 text-xs rounded-full font-medium">
                          Host
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Game Settings (host only) */}
            {isRoomHost && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FaCog className="text-primary-500" />
                  Game Settings
                </h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-primary-500"
                >
                  {showSettings ? '▲' : '▼'}
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {/* Game Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Game Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {GAME_TYPES.map((type) => (
                          <motion.button
                            key={type.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGameTypeChange(type.id)}
                            className={`p-3 rounded-xl text-left transition-all ${
                              selectedGameType === type.id
                                ? 'bg-primary-500 text-white ring-2 ring-primary-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{type.emoji}</span>
                              <span className="font-bold text-sm">{type.name}</span>
                            </div>
                            <p className={`text-xs ${
                              selectedGameType === type.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {type.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Letter Picker (shown only in Letter Mode) */}
                    {selectedGameType === 'letter' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                          Starting Letter
                        </label>
                        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                          {LETTERS.map((letter) => (
                            <motion.button
                              key={letter}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLetterChange(letter)}
                              className={`min-w-[36px] h-9 rounded-lg font-bold text-sm transition-all ${
                                selectedLetter === letter
                                  ? 'bg-secondary-500 text-white shadow-md'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                              }`}
                            >
                              {letter}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Rounds */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Rounds
                      </label>
                      <div className="flex gap-2">
                        {[2, 3, 4, 5].map((r) => (
                          <motion.button
                            key={r}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { playSound('click'); setRounds(r) }}
                            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                              rounds === r
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                            }`}
                          >
                            {r}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Drawing Time: {time}s
                      </label>
                      <input
                        type="range"
                        min={30}
                        max={120}
                        step={10}
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Category
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              playSound('click')
                              setCategory(cat.id)
                            }}
                            className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                              selectedCategory === cat.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                            }`}
                          >
                            {cat.emoji} {cat.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
          </>
        )}

        {/* Setup (before joining/creating a room) */}
        {!room && (
          <>
            {wantsToHost ? (
              <div className="card">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaQrcode className="text-primary-500" />
                  Host a Game
                </h2>

                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your Name"
                  className="input mb-4"
                  maxLength={20}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim() || joining}
                  className={`w-full py-4 rounded-2xl font-bold text-xl transition-all ${
                    playerName.trim() && !joining
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {joining ? 'Creating Room...' : 'Create Room'}
                </motion.button>
              </div>
            ) : (
              <div className="card">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaLink className="text-secondary-500" />
                  Join a Game
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Enter the room code from your friend&apos;s screen
                </p>

                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your Name"
                  className="input mb-4"
                  maxLength={20}
                />

                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter Room Code"
                  className="input mb-4 text-center text-3xl tracking-[0.3em] uppercase font-bold"
                  maxLength={6}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={joinCode.length !== 6 || !playerName.trim() || joining}
                  className={`w-full py-4 rounded-2xl font-bold text-xl transition-all ${
                    joinCode.length === 6 && playerName.trim() && !joining
                      ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {joining ? 'Joining Room...' : 'Join Game'}
                </motion.button>
              </div>
            )}

            {/* Toggle Host/Join */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound('click'); setWantsToHost(true) }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  wantsToHost
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                }`}
              >
                <FaQrcode />
                Host Game
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound('click'); setWantsToHost(false) }}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  !wantsToHost
                    ? 'bg-secondary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                }`}
              >
                <FaLink />
                Join Game
              </motion.button>
            </div>

            {!connected && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Connecting to game server...
              </p>
            )}
          </>
        )}

        {/* Start Button (Host Only) */}
        {room && isRoomHost && room.players.length >= 2 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500
                       text-white font-bold text-xl rounded-2xl shadow-lg
                       flex items-center justify-center gap-3"
          >
            <FaPlay />
            Start Game ({room.players.length} players)
          </motion.button>
        )}

        {/* Waiting message (joined players, not host) */}
        {room && !isRoomHost && (
          <div className="card text-center text-slate-500 dark:text-slate-400">
            <div className="w-6 h-6 mx-auto mb-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Waiting for the host to start the game...
          </div>
        )}
      </div>
    </motion.div>
  )
}
