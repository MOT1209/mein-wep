'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGameStore, Player, Room, Word, GameType, Vote, Result, Drawing } from '@/store/gameStore'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'

// Shape the server actually sends (nested settings), vs. the flat client Room type
interface ServerRoom {
  id: string
  code: string
  hostId: string
  players: Player[]
  settings: { maxPlayers: number; rounds: number; drawingTime: number; category: string }
  currentRound: number
  phase: Room['phase']
}

function normalizeRoom(serverRoom: ServerRoom): Room {
  return {
    id: serverRoom.id,
    code: serverRoom.code,
    hostId: serverRoom.hostId,
    players: serverRoom.players,
    maxPlayers: serverRoom.settings?.maxPlayers ?? 8,
    rounds: serverRoom.settings?.rounds ?? 3,
    currentRound: serverRoom.currentRound ?? 1,
    drawingTime: serverRoom.settings?.drawingTime ?? 60,
    category: serverRoom.settings?.category ?? 'random',
    phase: serverRoom.phase,
  }
}

interface SocketContextType {
  connected: boolean
  error: string | null
  clearError: () => void
  submittedCount: number
  connect: () => void
  disconnect: () => void
  createRoom: (data: { playerName: string; avatar?: string; maxPlayers?: number; rounds?: number; drawingTime?: number; category?: string }) => void
  joinRoom: (data: { roomCode: string; playerName: string; avatar?: string }) => void
  startGame: (words: Word[], gameType: GameType, currentLetter: string | null, creativePrompt: string | null) => void
  sendDrawingUpdate: (drawingData: string) => void
  submitDrawing: (data: { word: string; canvasData: string; category: string }) => void
  submitVote: (data: { drawingId: string; rank: number }) => void
  nextRound: (words: Word[]) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedCount, setSubmittedCount] = useState(0)

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', () => {
      setError('Could not reach the game server. Check your connection and try again.')
    })

    socket.on('room-created', (data: { room: ServerRoom }) => {
      const room = normalizeRoom(data.room)
      const store = useGameStore.getState()
      store.setRoom(room)
      const me = room.players.find(p => p.id === socket.id)
      if (me) store.setPlayer(me)
      store.setPhase('lobby')
      setError(null)
    })

    socket.on('room-joined', (data: { room: ServerRoom }) => {
      const room = normalizeRoom(data.room)
      const store = useGameStore.getState()
      store.setRoom(room)
      const me = room.players.find(p => p.id === socket.id)
      if (me) store.setPlayer(me)
      store.setPhase('lobby')
      setError(null)
    })

    socket.on('player-joined', (data: { player: Player; players: Player[] }) => {
      useGameStore.getState().updateRoom({ players: data.players })
    })

    socket.on('player-left', (data: { playerId: string; players: Player[]; newHost: string }) => {
      useGameStore.getState().updateRoom({ players: data.players, hostId: data.newHost })
    })

    socket.on('game-started', (data: {
      room: ServerRoom
      round: number
      gameType?: GameType
      currentLetter?: string | null
      creativePrompt?: string | null
    }) => {
      const room = normalizeRoom(data.room)
      const store = useGameStore.getState()
      store.setRoom(room)
      const me = room.players.find(p => p.id === socket.id)
      if (me?.currentWord) store.setWord(me.currentWord)
      if (data.gameType) store.setGameType(data.gameType)
      if (data.currentLetter !== undefined) store.setCurrentLetter(data.currentLetter)
      if (data.creativePrompt !== undefined) store.setCreativePrompt(data.creativePrompt)
      useGameStore.setState({
        drawings: [],
        votes: [],
        hasVoted: {},
        currentRound: data.round,
        timeLeft: room.drawingTime,
      })
      setSubmittedCount(0)
      store.clearCanvas()
      store.setPhase('drawing')
    })

    socket.on('drawing-progress', () => {
      // Live peeking at other players' canvases isn't rendered anywhere in the UI yet.
    })

    socket.on('drawing-submitted', () => {
      setSubmittedCount((c) => c + 1)
    })

    socket.on('all-drawings-submitted', (data: { drawings: Drawing[] }) => {
      useGameStore.setState({ drawings: data.drawings, votes: [], hasVoted: {} })
      useGameStore.getState().setPhase('voting')
    })

    socket.on('vote-submitted', (data: { voterId: string }) => {
      useGameStore.setState((state) => ({
        hasVoted: {
          ...state.hasVoted,
          [data.voterId]: state.hasVoted[data.voterId]?.length ? state.hasVoted[data.voterId] : ['pending'],
        },
      }))
    })

    socket.on('round-results', (data: { results: Result[] }) => {
      const store = useGameStore.getState()
      const { drawings } = store
      const syntheticVotes: Vote[] = []
      data.results.forEach((result) => {
        store.updatePlayerScore(result.playerId, result.score)
        const drawing = drawings.find(d => d.playerId === result.playerId)
        if (drawing) {
          for (let i = 0; i < result.votes; i++) {
            syntheticVotes.push({ voterId: `server-${result.playerId}-${i}`, drawingId: drawing.id, rank: result.rank })
          }
        }
      })
      useGameStore.setState({ votes: syntheticVotes })
      store.setPhase('results')
    })

    socket.on('next-round-started', (data: { round: number; room?: ServerRoom }) => {
      const store = useGameStore.getState()
      let drawingTime = store.drawingTime
      if (data.room) {
        const room = normalizeRoom(data.room)
        store.setRoom(room)
        drawingTime = room.drawingTime
        const me = room.players.find(p => p.id === socket.id)
        if (me?.currentWord) store.setWord(me.currentWord)
      }
      useGameStore.setState({
        currentRound: data.round,
        drawings: [],
        votes: [],
        hasVoted: {},
        timeLeft: drawingTime,
      })
      setSubmittedCount(0)
      store.clearCanvas()
      store.setPhase('drawing')
    })

    socket.on('error', (data: { message: string }) => {
      setError(data.message)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  // Disconnect whenever the player leaves online mode (back to menu, offline game, etc.)
  useEffect(() => {
    return useGameStore.subscribe((state, prevState) => {
      if (prevState.mode === 'online' && state.mode !== 'online') {
        socketRef.current?.disconnect()
        useGameStore.setState({ room: null })
      }
    })
  }, [])

  const connect = useCallback(() => {
    socketRef.current?.connect()
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const createRoom = useCallback((data: {
    playerName: string
    avatar?: string
    maxPlayers?: number
    rounds?: number
    drawingTime?: number
    category?: string
  }) => {
    socketRef.current?.emit('create-room', data)
  }, [])

  const joinRoom = useCallback((data: { roomCode: string; playerName: string; avatar?: string }) => {
    socketRef.current?.emit('join-room', data)
  }, [])

  const startGame = useCallback((words: Word[], gameType: GameType, currentLetter: string | null, creativePrompt: string | null) => {
    socketRef.current?.emit('start-game', { words, gameType, currentLetter, creativePrompt })
  }, [])

  const sendDrawingUpdate = useCallback((drawingData: string) => {
    socketRef.current?.emit('drawing-update', { drawingData })
  }, [])

  const submitDrawing = useCallback((data: { word: string; canvasData: string; category: string }) => {
    socketRef.current?.emit('submit-drawing', data)
  }, [])

  const submitVote = useCallback((data: { drawingId: string; rank: number }) => {
    socketRef.current?.emit('submit-vote', data)
  }, [])

  const nextRound = useCallback((words: Word[]) => {
    socketRef.current?.emit('next-round', { words })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <SocketContext.Provider value={{
      connected,
      error,
      clearError,
      submittedCount,
      connect,
      disconnect,
      createRoom,
      joinRoom,
      startGame,
      sendDrawingUpdate,
      submitDrawing,
      submitVote,
      nextRound,
    }}>
      {children}
    </SocketContext.Provider>
  )
}
