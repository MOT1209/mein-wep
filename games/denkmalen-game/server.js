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

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Create room
    socket.on('create-room', (data) => {
      const roomCode = generateRoomCode()
      const room = {
        id: roomCode,
        code: roomCode,
        hostId: socket.id,
        players: [{
          id: socket.id,
          name: data.playerName,
          avatar: data.avatar || '🎨',
          score: 0,
          roundWins: 0,
          totalVotes: 0,
          isOnline: true,
          socketId: socket.id,
          isHost: true
        }],
        settings: {
          maxPlayers: data.maxPlayers || 8,
          rounds: data.rounds || 3,
          drawingTime: data.drawingTime || 60,
          category: data.category || 'random'
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
      console.log(`Room ${roomCode} created by ${data.playerName}`)
    })

    // Join room
    socket.on('join-room', (data) => {
      const room = rooms.get(data.roomCode.toUpperCase())
      
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
        name: data.playerName,
        avatar: data.avatar || '🎮',
        score: 0,
        roundWins: 0,
        totalVotes: 0,
        isOnline: true,
        socketId: socket.id,
        isHost: false
      }

      room.players.push(player)
      socket.join(data.roomCode.toUpperCase())
      socket.roomCode = data.roomCode.toUpperCase()

      // Notify all players
      io.to(data.roomCode.toUpperCase()).emit('player-joined', { 
        player, 
        players: room.players 
      })

      socket.emit('room-joined', { room })
      console.log(`${data.playerName} joined room ${data.roomCode}`)
    })

    // Start game
    socket.on('start-game', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room || room.hostId !== socket.id) return

      room.phase = 'playing'
      room.currentRound = 1

      // Assign word to each player
      const words = data.words || []
      room.players.forEach((player, index) => {
        player.currentWord = words[index % words.length]
      })

      io.to(socket.roomCode).emit('game-started', { 
        room,
        round: 1 
      })
    })

    // Drawing update
    socket.on('drawing-update', (data) => {
      socket.to(socket.roomCode).emit('drawing-progress', {
        playerId: socket.id,
        drawingData: data.drawingData
      })
    })

    // Submit drawing
    socket.on('submit-drawing', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room) return

      const drawing = {
        id: `${socket.id}-${Date.now()}`,
        playerId: socket.id,
        word: data.word,
        canvasData: data.canvasData,
        category: data.category,
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
          drawings: room.drawings.map(d => ({
            ...d,
            canvasData: undefined // Hide who drew what
          }))
        })
      }
    })

    // Submit vote
    socket.on('submit-vote', (data) => {
      const room = rooms.get(socket.roomCode)
      if (!room) return

      const vote = {
        voterId: socket.id,
        drawingId: data.drawingId,
        rank: data.rank
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
    socket.on('next-round', () => {
      const room = rooms.get(socket.roomCode)
      if (!room) return

      room.currentRound++
      room.drawings = []
      room.votes = []
      room.phase = 'playing'

      io.to(socket.roomCode).emit('next-round-started', {
        round: room.currentRound
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
