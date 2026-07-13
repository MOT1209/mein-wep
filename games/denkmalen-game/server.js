const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Room storage
const rooms = new Map()

// Simple per-socket rate limit for room creation (prevents a single client from
// spamming the server with rooms).
const CREATE_ROOM_WINDOW_MS = 60000
const CREATE_ROOM_MAX = 5
const createRoomAttempts = new Map()

function isRateLimited(key, windowMs, max, store) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= max) return true
  entry.count++
  return false
}

// ── Validation helpers ──
const VALID_CATEGORIES = new Set([
  'food', 'animals', 'nature', 'objects', 'vehicles', 'sports', 'jobs',
  'fantasy', 'technology', 'space', 'history', 'random', 'custom',
])
const VALID_GAME_TYPES = new Set(['classic', 'letter', 'category', 'daily', 'creative'])
const ROOM_CODE_RE = /^[A-Z0-9]{6}$/

function sanitizeName(name) {
  if (typeof name !== 'string') return null
  const trimmed = name.trim().slice(0, 20)
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeAvatar(avatar, fallback) {
  if (typeof avatar !== 'string' || avatar.length === 0 || avatar.length > 8) return fallback
  return avatar
}

function clamp(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function sanitizeCategory(category) {
  return typeof category === 'string' && VALID_CATEGORIES.has(category) ? category : 'random'
}

function sanitizeGameType(gameType) {
  return typeof gameType === 'string' && VALID_GAME_TYPES.has(gameType) ? gameType : 'classic'
}

function sanitizeWords(words, count) {
  const safeCount = Math.max(1, Math.min(count, 8))
  if (!Array.isArray(words) || words.length === 0) {
    return Array.from({ length: safeCount }, () => ({ word: 'Object', emoji: '❓', category: 'random' }))
  }
  return words
    .filter(w => w && typeof w.word === 'string')
    .slice(0, 50)
    .map(w => ({
      word: w.word.slice(0, 100),
      emoji: typeof w.emoji === 'string' ? w.emoji.slice(0, 8) : '',
      category: sanitizeCategory(w.category),
    }))
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  // In production, only allow the configured origin(s) to open a socket
  // connection — an unset ALLOWED_ORIGIN disables cross-origin access rather
  // than falling back to a wildcard.
  const corsOrigin = dev ? '*' : (process.env.ALLOWED_ORIGIN || false)

  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST']
    }
  })

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Create room
    socket.on('create-room', (data) => {
      if (!data || typeof data !== 'object') return

      const clientIp = socket.handshake.address || socket.id
      if (isRateLimited(clientIp, CREATE_ROOM_WINDOW_MS, CREATE_ROOM_MAX, createRoomAttempts)) {
        socket.emit('error', { message: 'Too many rooms created. Please wait a moment.' })
        return
      }

      const playerName = sanitizeName(data.playerName)
      if (!playerName) {
        socket.emit('error', { message: 'A valid player name is required' })
        return
      }

      const roomCode = generateRoomCode()
      const room = {
        id: roomCode,
        code: roomCode,
        hostId: socket.id,
        players: [{
          id: socket.id,
          name: playerName,
          avatar: sanitizeAvatar(data.avatar, '🎨'),
          score: 0,
          roundWins: 0,
          totalVotes: 0,
          isOnline: true,
          socketId: socket.id,
          isHost: true
        }],
        settings: {
          maxPlayers: clamp(data.maxPlayers, 2, 8, 8),
          rounds: clamp(data.rounds, 2, 10, 3),
          drawingTime: clamp(data.drawingTime, 10, 300, 60),
          category: sanitizeCategory(data.category)
        },
        currentRound: 1,
        phase: 'lobby',
        drawings: [],
        votes: []
      }

      rooms.set(roomCode, room)
      socket.join(roomCode)
      socket.roomCode = roomCode

      socket.emit('room-created', { room })
      console.log(`Room ${roomCode} created by ${playerName}`)
    })

    // Join room
    socket.on('join-room', (data) => {
      if (!data || typeof data !== 'object') return

      const roomCode = typeof data.roomCode === 'string' ? data.roomCode.toUpperCase() : ''
      if (!ROOM_CODE_RE.test(roomCode)) {
        socket.emit('error', { message: 'Invalid room code' })
        return
      }

      const playerName = sanitizeName(data.playerName)
      if (!playerName) {
        socket.emit('error', { message: 'A valid player name is required' })
        return
      }

      const room = rooms.get(roomCode)

      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (room.players.length >= room.settings.maxPlayers) {
        socket.emit('error', { message: 'Room is full' })
        return
      }

      if (room.phase !== 'lobby') {
        socket.emit('error', { message: 'Game already in progress' })
        return
      }

      const player = {
        id: socket.id,
        name: playerName,
        avatar: sanitizeAvatar(data.avatar, '🎮'),
        score: 0,
        roundWins: 0,
        totalVotes: 0,
        isOnline: true,
        socketId: socket.id,
        isHost: false
      }

      room.players.push(player)
      socket.join(roomCode)
      socket.roomCode = roomCode

      // Notify all players
      io.to(roomCode).emit('player-joined', {
        player,
        players: room.players
      })

      socket.emit('room-joined', { room })
      console.log(`${playerName} joined room ${roomCode}`)
    })

    // Start game
    socket.on('start-game', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room || room.hostId !== socket.id || room.phase !== 'lobby') return
      if (!data || typeof data !== 'object') return

      room.phase = 'playing'
      room.currentRound = 1

      const gameType = sanitizeGameType(data.gameType)
      const currentLetter = typeof data.currentLetter === 'string' ? data.currentLetter.slice(0, 1) : null
      const creativePrompt = typeof data.creativePrompt === 'string' ? data.creativePrompt.slice(0, 300) : null

      // Assign a word to each player
      const words = sanitizeWords(data.words, room.players.length)
      room.players.forEach((player, index) => {
        player.currentWord = words[index % words.length]
      })

      io.to(socket.roomCode).emit('game-started', {
        room,
        round: 1,
        gameType,
        currentLetter,
        creativePrompt,
      })
    })

    // Drawing update
    socket.on('drawing-update', (data) => {
      if (!socket.roomCode || !data || typeof data.drawingData !== 'string') return
      socket.to(socket.roomCode).emit('drawing-progress', {
        playerId: socket.id,
        drawingData: data.drawingData
      })
    })

    // Submit drawing
    socket.on('submit-drawing', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room || !data) return
      if (room.drawings.some(d => d.playerId === socket.id)) return // already submitted

      const word = typeof data.word === 'string' ? data.word.slice(0, 100) : ''
      const canvasData = typeof data.canvasData === 'string' ? data.canvasData : ''
      if (!canvasData) return

      const drawing = {
        id: `${socket.id}-${Date.now()}`,
        playerId: socket.id,
        word,
        canvasData,
        category: sanitizeCategory(data.category),
        timestamp: Date.now()
      }

      room.drawings.push(drawing)

      // Notify others
      io.to(socket.roomCode).emit('drawing-submitted', {
        playerId: socket.id
      })

      // Check if all players submitted
      if (room.drawings.length >= room.players.length) {
        room.phase = 'voting'
        io.to(socket.roomCode).emit('all-drawings-submitted', {
          drawings: room.drawings
        })
      }
    })

    // Submit vote
    socket.on('submit-vote', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room || !data || typeof data.drawingId !== 'string') return
      if (room.votes.some(v => v.voterId === socket.id)) return // already voted
      if (!room.drawings.some(d => d.id === data.drawingId)) return // unknown drawing

      const vote = {
        voterId: socket.id,
        drawingId: data.drawingId,
        rank: clamp(data.rank, 1, room.players.length, 1)
      }

      room.votes.push(vote)

      // Notify others
      io.to(socket.roomCode).emit('vote-submitted', {
        voterId: socket.id
      })

      // Check if all voted
      const uniqueVoters = new Set(room.votes.map(v => v.voterId))
      if (uniqueVoters.size >= room.players.length) {
        // Calculate results
        const results = calculateResults(room)
        room.phase = 'results'

        io.to(socket.roomCode).emit('round-results', { results })
      }
    })

    // Next round
    socket.on('next-round', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room || room.hostId !== socket.id) return

      room.currentRound++
      room.drawings = []
      room.votes = []
      room.phase = 'playing'

      const words = sanitizeWords(data && data.words, room.players.length)
      room.players.forEach((player, index) => {
        player.currentWord = words[index % words.length]
      })

      io.to(socket.roomCode).emit('next-round-started', {
        round: room.currentRound,
        room,
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)

      if (socket.roomCode) {
        const room = rooms.get(socket.roomCode)
        if (room) {
          // Remove player
          room.players = room.players.filter(p => p.socketId !== socket.id)

          if (room.players.length === 0) {
            rooms.delete(socket.roomCode)
          } else {
            // Transfer host if needed
            if (room.hostId === socket.id) {
              room.hostId = room.players[0].socketId
              room.players[0].isHost = true
            }

            io.to(socket.roomCode).emit('player-left', {
              playerId: socket.id,
              players: room.players,
              newHost: room.hostId
            })
          }
        }
      }
    })
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

// Helper functions
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function calculateResults(room) {
  const drawingVotes = {}
  room.votes.forEach(vote => {
    drawingVotes[vote.drawingId] = (drawingVotes[vote.drawingId] || 0) + 1
  })

  const results = room.drawings.map(drawing => {
    const player = room.players.find(p => p.id === drawing.playerId)
    const votes = drawingVotes[drawing.id] || 0
    return {
      playerId: drawing.playerId,
      playerName: player?.name || 'Unknown',
      playerAvatar: player?.avatar || '🎨',
      votes,
      score: calculateScore(votes)
    }
  })

  results.sort((a, b) => b.votes - a.votes)
  results.forEach((result, index) => {
    result.rank = index + 1
  })

  // Update player scores
  results.forEach(result => {
    const player = room.players.find(p => p.id === result.playerId)
    if (player) {
      player.score += result.score
      if (result.rank === 1) player.roundWins++
    }
  })

  return results
}

function calculateScore(votes) {
  if (votes >= 10) return 10
  if (votes >= 7) return 7
  if (votes >= 5) return 5
  return 2
}
