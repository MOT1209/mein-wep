'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/components/SocketProvider'

interface GameContextType {
  // Helper functions
  startOfflineGame: (players: { name: string }[]) => void
  startOnlineGame: () => void
  endGame: () => void
  playSound: (sound: string) => void
  vibrate: (pattern?: number | number[]) => void
}

const GameContext = createContext<GameContextType>({
  startOfflineGame: () => {},
  startOnlineGame: () => {},
  endGame: () => {},
  playSound: () => {},
  vibrate: () => {},
})

export function useGame() {
  return useContext(GameContext)
}

// Sound effects (using Web Audio API for offline support)
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.frequency.value = frequency
  oscillator.type = type
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

export function GameProvider({ children }: { children: ReactNode }) {
  const {
    settings,
    setMode,
    setPhase,
    setPlayer,
    addPlayer,
    currentPlayer,
    updateStats,
    gameType,
    currentLetter,
    creativePrompt,
    setPendingJoinCode,
  } = useGameStore()
  const { connect: connectSocket } = useSocket()

  // Land directly in the online lobby with the code pre-filled when opened
  // via a "Share Link" / QR code (?join=CODE) — e.g. from another player's
  // scan. Runs once on mount; the query string is stripped afterward so a
  // page refresh doesn't re-trigger it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const code = new URLSearchParams(window.location.search).get('join')?.toUpperCase()
    if (!code || !/^[A-Z0-9]{6}$/.test(code)) return

    setPendingJoinCode(code)
    setMode('online')
    setPhase('lobby')
    connectSocket()
    window.history.replaceState({}, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the document's dir/lang attributes in sync with the chosen
  // language — layout.tsx can only render a static 'ltr'/'en' default at
  // build time (static export has no per-request server), so Arabic's
  // right-to-left layout has to be applied client-side once the store
  // hydrates from localStorage, same treatment as ThemeProvider's dark class.
  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = settings.language
  }, [settings.language])

  const playSound = (sound: string) => {
    if (!settings.sound) return
    
    // Resume audio context if suspended (for mobile browsers)
    if (audioContext?.state === 'suspended') {
      audioContext.resume()
    }
    
    switch (sound) {
      case 'click':
        playTone(800, 0.1)
        break
      case 'success':
        playTone(523, 0.1)
        setTimeout(() => playTone(659, 0.1), 100)
        setTimeout(() => playTone(784, 0.2), 200)
        break
      case 'error':
        playTone(200, 0.3, 'sawtooth')
        break
      case 'countdown':
        playTone(440, 0.1)
        break
      case 'end':
        playTone(784, 0.1)
        setTimeout(() => playTone(659, 0.1), 100)
        setTimeout(() => playTone(523, 0.2), 200)
        break
      case 'winner':
        playTone(523, 0.15)
        setTimeout(() => playTone(659, 0.15), 150)
        setTimeout(() => playTone(784, 0.15), 300)
        setTimeout(() => playTone(1047, 0.3), 450)
        break
      case 'vote':
        playTone(600, 0.1)
        break
    }
  }

  const vibrate = (pattern: number | number[] = 50) => {
    if (!settings.vibration || !navigator.vibrate) return
    navigator.vibrate(pattern)
  }

  const v4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const startOfflineGame = (players: { name: string }[]) => {
    const avatars = ['🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸', '🎹']

    const gamePlayers = players.map((p, i) => ({
      id: v4(),
      name: p.name,
      avatar: avatars[i % avatars.length],
      score: 0,
      roundWins: 0,
      totalVotes: 0,
    }))

    // Wipe any leftovers from a previous game (players would otherwise
    // accumulate, and stale round/word/votes would leak into this game)
    useGameStore.getState().resetGame()
    useGameStore.setState({
      players: [],
      currentLetter: null,
      creativePrompt: null,
      timeLeft: useGameStore.getState().drawingTime,
    })

    setMode('offline')
    setPhase('drawing')

    // Set all players
    gamePlayers.forEach(p => addPlayer(p))

    // Set first player as current
    if (gamePlayers.length > 0) {
      setPlayer(gamePlayers[0])
    }

    // Update stats with game type
    updateStats({
      favoriteGameType: gameType,
    })
    
    playSound('success')
    vibrate()
  }

  const startOnlineGame = () => {
    setMode('online')
    setPhase('lobby')
    connectSocket()
    playSound('success')
    vibrate()
  }

  const endGame = () => {
    updateStats({
      gamesPlayed: 1,
    })
    setPhase('results')
    playSound('winner')
    vibrate([100, 50, 100, 50, 200])
  }

  return (
    <GameContext.Provider value={{
      startOfflineGame,
      startOnlineGame,
      endGame,
      playSound,
      vibrate,
    }}>
      {children}
    </GameContext.Provider>
  )
}
