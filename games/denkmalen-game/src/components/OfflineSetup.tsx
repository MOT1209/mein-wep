'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, Category, GameType, getLetters, getRandomCreativePrompt } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { t } from '@/lib/i18n'
import { FaArrowLeft, FaPlus, FaTimes, FaPlay, FaUsers, FaMobile } from 'react-icons/fa'

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
  { id: 'technology', name: 'Technology', emoji: '💻' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'history', name: 'History', emoji: '🏛️' },
]

const GAME_TYPES: { id: GameType; title: string; description: string; icon: string; color: string }[] = [
  {
    id: 'classic',
    title: 'Classic',
    description: 'Draw the secret word!',
    icon: '🎨',
    color: 'from-primary-400 to-primary-600',
  },
  {
    id: 'letter',
    title: 'Letter Mode',
    description: 'Draw anything starting with a letter!',
    icon: '🔤',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'category',
    title: 'Category Mode',
    description: 'Draw from a specific category!',
    icon: '📂',
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'Same prompt for everyone today!',
    icon: '📅',
    color: 'from-rose-400 to-rose-600',
  },
  {
    id: 'creative',
    title: 'Creative Challenge',
    description: 'AI-generated creative prompts!',
    icon: '🤖',
    color: 'from-emerald-400 to-emerald-600',
  },
]

// GAME_TYPES above carries id/icon/color only as stable metadata; title and
// description are looked up through these so every language stays in sync
// with the shared gametype.* / gametype.*.desc dictionary entries.
const gameTypeTitle = (id: GameType, lang: 'en' | 'ar' | 'de') => t(`gametype.${id}`, lang)
const gameTypeDesc = (id: GameType, lang: 'en' | 'ar' | 'de') => t(`gametype.${id}.desc`, lang)

export function OfflineSetup() {
  const { setPhase, setCategory, setGameType, setCurrentLetter, setCreativePrompt, selectedCategory, totalRounds, drawingTime, settings } = useGameStore()
  const { startOfflineGame, playSound, vibrate } = useGame()
  
  const [players, setPlayers] = useState<{ name: string }[]>([
    { name: '' },
    { name: '' },
  ])
  const [rounds, setRounds] = useState(totalRounds)
  const [time, setTime] = useState(drawingTime)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showLetterPicker, setShowLetterPicker] = useState(false)
  const [step, setStep] = useState<'names' | 'gametype' | 'settings'>('names')
  const [localGameType, setLocalGameType] = useState<GameType>('classic')
  const [localLetter, setLocalLetter] = useState<string | null>(null)
  const [localCategory, setLocalCategory] = useState(selectedCategory)

  const addPlayer = () => {
    if (players.length < 8) {
      playSound('click')
      setPlayers([...players, { name: '' }])
    }
  }

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      playSound('click')
      vibrate()
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players]
    newPlayers[index] = { name }
    setPlayers(newPlayers)
  }

  const canProceed = players.filter(p => p.name.trim()).length >= 2
  const canStart = players.filter(p => p.name.trim()).length >= 2

  const getStepNumber = (s: 'names' | 'gametype' | 'settings') => {
    const order = ['names', 'gametype', 'settings']
    return order.indexOf(s) + 1
  }

  const handleStart = () => {
    if (!canStart) return
    
    playSound('success')
    vibrate([100, 50, 100])
    
    // Update store settings
    useGameStore.setState({ 
      totalRounds: rounds, 
      drawingTime: time 
    })
    
    startOfflineGame(players.filter(p => p.name.trim()))
  }

  const handleGameTypeSelect = (type: GameType) => {
    playSound('click')
    setLocalGameType(type)
    setLocalLetter(null)
    
    if (type === 'classic' || type === 'daily') {
      // Classic/Daily don't need extra config, go to settings
      setGameType(type)
      setCurrentLetter(null)
      setCreativePrompt(null)
      setStep('settings')
    } else if (type === 'letter') {
      // Show letter picker
      setShowLetterPicker(true)
    } else if (type === 'category') {
      // Show category picker
      setShowCategoryPicker(true)
    } else if (type === 'creative') {
      // Creative mode: set prompt and go to settings
      setGameType(type)
      setCurrentLetter(null)
      setCreativePrompt(getRandomCreativePrompt(settings.language))
      setStep('settings')
    }
  }

  const handleLetterSelect = (letter: string) => {
    playSound('click')
    setLocalLetter(letter)
    setShowLetterPicker(false)
    setGameType('letter')
    setCurrentLetter(letter)
    setCreativePrompt(null)
    setStep('settings')
  }

  const handleCategorySelect = (cat: Category) => {
    playSound('click')
    setLocalCategory(cat)
    setShowCategoryPicker(false)
    setGameType('category')
    setCurrentLetter(null)
    setCreativePrompt(null)
    setCategory(cat)
    setStep('settings')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen flex flex-col p-4 md:p-8"
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
            {t('setup.offlineMode', settings.language)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <FaMobile className="text-primary-500" />
            {t('setup.sameDevice', settings.language)}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['names', 'gametype', 'settings'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
              step === s
                ? 'bg-primary-500 text-white shadow-lg scale-105'
                : getStepNumber(step) > getStepNumber(s)
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              <span className="font-bold">{getStepNumber(s) > getStepNumber(s) ? '✓' : getStepNumber(s)}</span>
              <span className="hidden sm:inline">
                {s === 'names' ? t('setup.playersCount', settings.language) : s === 'gametype' ? t('setup.gameType', settings.language) : t('settings.title', settings.language)}
              </span>
            </div>
            {i < 2 && (
              <div className={`w-6 h-0.5 rounded ${
                getStepNumber(step) > getStepNumber(s)
                  ? 'bg-green-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Step 1: Player Names */}
        {step === 'names' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaUsers className="text-primary-500" />
                {t('setup.playersCount', settings.language)} ({players.length}/8)
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={addPlayer}
                disabled={players.length >= 8}
                className="p-2 bg-primary-500 text-white rounded-xl disabled:opacity-50"
              >
                <FaPlus />
              </motion.button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('setup.enterNames', settings.language)}
            </p>

            <div className="space-y-3">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 
                                    flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(index, e.target.value)}
                      placeholder={`${t('setup.playerName', settings.language)} ${index + 1}`}
                      className="input flex-1"
                      maxLength={20}
                    />
                    {players.length > 2 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePlayer(index)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl"
                      >
                        <FaTimes />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {players.filter(p => p.name.trim()).length < 2 && (
              <p className="text-sm text-amber-500 mt-4 text-center">
                ⚠️ {t('setup.minPlayersWarning', settings.language)}
              </p>
            )}
          </motion.div>
        )}

        {/* Step 2: Game Type Selection */}
        {step === 'gametype' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {t('setup.chooseGameType', settings.language)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('setup.selectHow', settings.language)}
            </p>

            <div className="grid grid-cols-1 gap-3">
              {GAME_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGameTypeSelect(type.id)}
                  className={`relative overflow-hidden p-4 rounded-2xl text-left transition-all ${
                    localGameType === type.id && (type.id === 'classic' || type.id === 'daily')
                      ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${type.color} -translate-y-8 translate-x-8`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {gameTypeTitle(type.id, settings.language)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {gameTypeDesc(type.id, settings.language)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <motion.div
                        animate={{ x: localGameType === type.id && (type.id === 'classic' || type.id === 'daily') ? 0 : -10 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          localGameType === type.id && (type.id === 'classic' || type.id === 'daily')
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                        }`}
                      >
                        <FaArrowLeft className="text-xs" style={{ transform: 'rotate(180deg)' }} />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Settings */}
        {step === 'settings' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {t('setup.gameSettings', settings.language)}
            </h2>

            {/* Selected Game Type Badge */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('setup.gameMode', settings.language)}: </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-sm font-bold">
                {GAME_TYPES.find(g => g.id === localGameType)?.icon}{' '}
                {gameTypeTitle(localGameType, settings.language)}
              </span>
              {localGameType === 'letter' && localLetter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold ml-2">
                  {t('draw.letter', settings.language)} {localLetter}
                </span>
              )}
              {localGameType === 'category' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold ml-2">
                  {CATEGORIES.find(c => c.id === localCategory)?.emoji}{' '}
                  {t(`category.${localCategory}`, settings.language)}
                </span>
              )}
            </div>

            {/* Players Preview */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('setup.playersCount', settings.language)}:</span>
              <div className="flex flex-wrap gap-1">
                {players.filter(p => p.name.trim()).map((p, i) => (
                  <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {t('setup.rounds', settings.language)}
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((r) => (
                  <motion.button
                    key={r}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSound('click'); setRounds(r) }}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
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

            {/* Drawing Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {t('setup.time', settings.language)}: {time}s
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
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>30s</span>
                <span>60s</span>
                <span>90s</span>
                <span>120s</span>
              </div>
            </div>

            {/* Category (only for Category Mode) */}
            {(localGameType === 'category' || localGameType === 'classic') && (
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t('setup.category', settings.language)}
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCategoryPicker(true)}
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 rounded-xl 
                             flex items-center justify-between text-left"
                >
                  <span className="text-slate-700 dark:text-white font-medium">
                    {CATEGORIES.find(c => c.id === (localGameType === 'category' ? localCategory : selectedCategory))?.emoji}{' '}
                    {t(`category.${localGameType === 'category' ? localCategory : selectedCategory}`, settings.language)}
                  </span>
                  <span className="text-slate-400">▼</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step === 'gametype' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('click'); setStep('names') }}
              className="flex-1 py-4 rounded-2xl font-bold text-lg bg-slate-200 dark:bg-slate-700 
                         text-slate-700 dark:text-white"
            >
              {t('common.back', settings.language)}
            </motion.button>
          )}
          
          {step === 'settings' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playSound('click'); setStep('gametype') }}
              className="flex-1 py-4 rounded-2xl font-bold text-lg bg-slate-200 dark:bg-slate-700 
                         text-slate-700 dark:text-white"
            >
              {t('common.back', settings.language)}
            </motion.button>
          )}

          {step === 'names' ? (
            <motion.button
              whileHover={{ scale: canProceed ? 1.05 : 1 }}
              whileTap={{ scale: canProceed ? 0.95 : 1 }}
              onClick={() => { playSound('click'); setStep('gametype') }}
              disabled={!canProceed}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${
                canProceed
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {t('setup.nextGameType', settings.language)}
            </motion.button>
          ) : step === 'gametype' ? (
            <motion.button
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
              onClick={() => handleStart()}
              disabled={!canStart}
              className={`flex-1 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FaPlay />
              {t('common.startGame', settings.language)}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
              onClick={handleStart}
              disabled={!canStart}
              className={`flex-1 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FaPlay />
              {t('common.startGame', settings.language)}
            </motion.button>
          )}
        </div>
      </div>

      {/* Category Picker Modal */}
      <AnimatePresence>
        {showCategoryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              if (localGameType === 'category') {
                setShowCategoryPicker(false)
              } else {
                setShowCategoryPicker(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('setup.selectCategory', settings.language)}
              </h3>
              {localGameType === 'category' && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {t('setup.chooseCategory', settings.language)}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (localGameType === 'category') {
                        handleCategorySelect(cat.id)
                      } else {
                        playSound('click')
                        setCategory(cat.id)
                        setShowCategoryPicker(false)
                      }
                    }}
                    className={`py-4 px-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      (localGameType === 'category' ? localCategory : selectedCategory) === cat.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-sm font-medium">{t(`category.${cat.id}`, settings.language)}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Picker Modal */}
      <AnimatePresence>
        {showLetterPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLetterPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('setup.chooseLetter', settings.language)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t('setup.letterHint', settings.language)}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {getLetters(settings.language).map((letter) => (
                  <motion.button
                    key={letter}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLetterSelect(letter)}
                    className={`py-3 px-2 rounded-xl font-bold text-lg transition-all ${
                      localLetter === letter
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    {letter}
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
