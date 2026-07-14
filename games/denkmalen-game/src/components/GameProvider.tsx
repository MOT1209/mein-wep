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
  } = useGameStore()
  const { connect: connectSocket } = useSocket()

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
