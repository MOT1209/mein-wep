'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/store/gameStore'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { room, setRoom } = useGameStore()

  useEffect(() => {
    // Connect to socket server
    const socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    // Event listeners
    socket.on('connect', () => {
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    socket.on('room-created', (data) => {
      console.log('Room created:', data.room.code)
      setRoom(data.room)
    })

    socket.on('room-joined', (data) => {
      console.log('Room joined:', data.room.code)
      setRoom(data.room)
    })

    socket.on('player-joined', (data) => {
      console.log('Player joined:', data.player.name)
      if (room) {
        setRoom({ ...room, players: data.players })
      }
    })

    socket.on('player-left', (data) => {
      console.log('Player left:', data.playerId)
      if (room) {
        setRoom({ ...room, players: data.players })
      }
    })

    socket.on('game-started', (data) => {
      console.log('Game started!')
      // Update game state
    })

    socket.on('all-drawings-submitted', (data) => {
      console.log('All drawings submitted')
      // Move to voting phase
    })

    socket.on('round-results', (data) => {
      console.log('Round results:', data.results)
      // Show results
    })

    socket.on('error', (data) => {
      console.error('Socket error:', data.message)
    })

    return () => {
      socket.disconnect()
    }
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
    rounds?: number
    drawingTime?: number
    category?: string
  }) => {
    socketRef.current?.emit('create-room', data)
  }, [])

  const joinRoom = useCallback((data: {
    roomCode: string
    playerName: string
    avatar?: string
  }) => {
    socketRef.current?.emit('join-room', data)
  }, [])

  const startGame = useCallback((words: any[]) => {
    socketRef.current?.emit('start-game', { words })
  }, [])

  const sendDrawingUpdate = useCallback((drawingData: string) => {
    socketRef.current?.emit('drawing-update', { drawingData })
  }, [])

  const submitDrawing = useCallback((data: {
    word: string
    canvasData: string
    category: string
  }) => {
    socketRef.current?.emit('submit-drawing', data)
  }, [])

  const submitVote = useCallback((data: {
    drawingId: string
    rank: number
  }) => {
    socketRef.current?.emit('submit-vote', data)
  }, [])

  const nextRound = useCallback(() => {
    socketRef.current?.emit('next-round')
  }, [])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    sendDrawingUpdate,
    submitDrawing,
    submitVote,
    nextRound,
  }
}
