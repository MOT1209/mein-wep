import { useGameStore, calculateScore, calculateFinalScore, getRandomWord, getLetters, getRandomCreativePrompt } from '@/store/gameStore'

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      mode: null,
      phase: 'menu',
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      currentPlayer: null,
      players: [],
      room: null,
      pendingJoinCode: null,
      currentWord: null,
      currentDrawing: null,
      drawings: [],
      drawingHistory: [],
      historyIndex: -1,
      votes: [],
      hasVoted: {},
      aiEvaluations: {},
      aiEvaluating: false,
      currentRound: 1,
      totalRounds: 3,
      drawingTime: 60,
      timeLeft: 60,
      selectedCategory: 'random',
      settings: {
        darkMode: false,
        sound: true,
        music: true,
        vibration: true,
        language: 'en',
      },
      stats: {
        gamesPlayed: 0,
        wins: 0,
        totalVotes: 0,
        favoriteCategory: 'random',
        favoriteGameType: 'classic',
        highestScore: 0,
        totalDrawingTime: 0,
      },
    })
  })

  describe('Phase Management', () => {
    it('initializes with menu phase', () => {
      const state = useGameStore.getState()
      expect(state.phase).toBe('menu')
      expect(state.mode).toBeNull()
    })

    it('sets phase correctly', () => {
      useGameStore.getState().setPhase('settings')
      expect(useGameStore.getState().phase).toBe('settings')
    })

    it('sets mode correctly', () => {
      useGameStore.getState().setMode('offline')
      expect(useGameStore.getState().mode).toBe('offline')
    })
  })

  describe('Player Management', () => {
    it('adds players', () => {
      const player = { id: '1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0 }
      useGameStore.getState().addPlayer(player)
      expect(useGameStore.getState().players).toHaveLength(1)
      expect(useGameStore.getState().players[0].name).toBe('Alice')
    })

    it('removes players', () => {
      const player1 = { id: '1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0 }
      const player2 = { id: '2', name: 'Bob', avatar: '🎭', score: 0, roundWins: 0, totalVotes: 0 }
      useGameStore.getState().addPlayer(player1)
      useGameStore.getState().addPlayer(player2)
      
      useGameStore.getState().removePlayer('1')
      expect(useGameStore.getState().players).toHaveLength(1)
      expect(useGameStore.getState().players[0].name).toBe('Bob')
    })

    it('updates player score', () => {
      const player = { id: '1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0 }
      useGameStore.getState().addPlayer(player)
      
      useGameStore.getState().updatePlayerScore('1', 10)
      expect(useGameStore.getState().players[0].score).toBe(10)
      
      useGameStore.getState().updatePlayerScore('1', 5)
      expect(useGameStore.getState().players[0].score).toBe(15)
    })

    it('sets current player', () => {
      const player = { id: '1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0 }
      useGameStore.getState().setPlayer(player)
      expect(useGameStore.getState().currentPlayer?.name).toBe('Alice')
    })
  })

  describe('Room Management', () => {
    it('creates room with code', () => {
      const room = useGameStore.getState().createRoom({ maxPlayers: 8, rounds: 3 })
      expect(room.code).toHaveLength(6)
      expect(room.maxPlayers).toBe(8)
      expect(useGameStore.getState().room).not.toBeNull()
    })

    it('joins room', () => {
      const player = { id: '1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0 }
      useGameStore.getState().createRoom({})
      useGameStore.getState().joinRoom('ABC123', player)
      expect(useGameStore.getState().room?.players).toHaveLength(1)
    })

    it('updates room', () => {
      useGameStore.getState().createRoom({})
      useGameStore.getState().updateRoom({ rounds: 5 })
      expect(useGameStore.getState().room?.rounds).toBe(5)
    })

    it('sets pending join code', () => {
      useGameStore.getState().setPendingJoinCode('ABC123')
      expect(useGameStore.getState().pendingJoinCode).toBe('ABC123')
    })
  })

  describe('Drawing Management', () => {
    it('sets word', () => {
      const word = { word: 'Cat', emoji: '🐱', category: 'animals' as const }
      useGameStore.getState().setWord(word)
      expect(useGameStore.getState().currentWord).toEqual(word)
    })

    it('adds drawing', () => {
      const drawing = {
        id: '1',
        playerId: 'player1',
        word: 'Cat',
        canvasData: 'data:image/png;base64,...',
        category: 'animals',
        timestamp: Date.now(),
      }
      useGameStore.getState().addDrawing(drawing)
      expect(useGameStore.getState().drawings).toHaveLength(1)
    })

    it('saves drawing to history', () => {
      const dataUrl = 'data:image/png;base64,abc'
      useGameStore.getState().saveDrawingToHistory(dataUrl)
      expect(useGameStore.getState().drawingHistory).toHaveLength(1)
      expect(useGameStore.getState().historyIndex).toBe(0)
      expect(useGameStore.getState().currentDrawing).toBe(dataUrl)
    })

    it('undo and redo', () => {
      useGameStore.getState().saveDrawingToHistory('data:1')
      useGameStore.getState().saveDrawingToHistory('data:2')
      useGameStore.getState().saveDrawingToHistory('data:3')
      
      expect(useGameStore.getState().historyIndex).toBe(2)
      
      useGameStore.getState().undo()
      expect(useGameStore.getState().historyIndex).toBe(1)
      
      useGameStore.getState().redo()
      expect(useGameStore.getState().historyIndex).toBe(2)
    })

    it('undo does nothing at start', () => {
      useGameStore.getState().saveDrawingToHistory('data:1')
      useGameStore.getState().undo()
      expect(useGameStore.getState().historyIndex).toBe(0)
    })

    it('redo does nothing at end', () => {
      useGameStore.getState().saveDrawingToHistory('data:1')
      useGameStore.getState().redo()
      expect(useGameStore.getState().historyIndex).toBe(0)
    })

    it('clears canvas', () => {
      useGameStore.getState().saveDrawingToHistory('data:1')
      useGameStore.getState().clearCanvas()
      expect(useGameStore.getState().drawingHistory).toHaveLength(0)
      expect(useGameStore.getState().historyIndex).toBe(-1)
      expect(useGameStore.getState().currentDrawing).toBeNull()
    })
  })

  describe('Voting', () => {
    it('adds vote', () => {
      const vote = { voterId: 'voter1', drawingId: 'drawing1', rank: 1 }
      useGameStore.getState().addVote(vote)
      expect(useGameStore.getState().votes).toHaveLength(1)
      expect(useGameStore.getState().hasVoted['voter1']).toContain('drawing1')
    })

    it('resets votes', () => {
      useGameStore.getState().addVote({ voterId: 'voter1', drawingId: 'drawing1', rank: 1 })
      useGameStore.getState().resetVotes()
      expect(useGameStore.getState().votes).toHaveLength(0)
      expect(useGameStore.getState().hasVoted).toEqual({})
    })
  })

  describe('Round Management', () => {
    it('advances to next round', () => {
      useGameStore.setState({ currentRound: 1 })
      useGameStore.getState().nextRound()
      expect(useGameStore.getState().currentRound).toBe(2)
      expect(useGameStore.getState().drawings).toHaveLength(0)
      expect(useGameStore.getState().votes).toHaveLength(0)
    })

    it('resets game', () => {
      useGameStore.setState({
        currentRound: 3,
        drawings: [{ id: '1', playerId: 'p1', word: 'cat', canvasData: 'data:1', category: 'animals', timestamp: 1 }],
        votes: [{ voterId: 'v1', drawingId: 'd1', rank: 1 }],
      })
      
      useGameStore.getState().resetGame()
      expect(useGameStore.getState().currentRound).toBe(1)
      expect(useGameStore.getState().drawings).toHaveLength(0)
      expect(useGameStore.getState().votes).toHaveLength(0)
      expect(useGameStore.getState().currentWord).toBeNull()
    })
  })

  describe('Timer', () => {
    it('sets time left', () => {
      useGameStore.getState().setTimeLeft(30)
      expect(useGameStore.getState().timeLeft).toBe(30)
    })

    it('decrements time', () => {
      useGameStore.setState({ timeLeft: 10 })
      useGameStore.getState().decrementTime()
      expect(useGameStore.getState().timeLeft).toBe(9)
    })

    it('does not go below 0', () => {
      useGameStore.setState({ timeLeft: 0 })
      useGameStore.getState().decrementTime()
      expect(useGameStore.getState().timeLeft).toBe(0)
    })
  })

  describe('Settings', () => {
    it('updates settings', () => {
      useGameStore.getState().setSettings({ darkMode: true })
      expect(useGameStore.getState().settings.darkMode).toBe(true)
    })

    it('updates language', () => {
      useGameStore.getState().setSettings({ language: 'ar' })
      expect(useGameStore.getState().settings.language).toBe('ar')
    })

    it('toggles sound', () => {
      expect(useGameStore.getState().settings.sound).toBe(true)
      useGameStore.getState().setSettings({ sound: false })
      expect(useGameStore.getState().settings.sound).toBe(false)
    })
  })

  describe('Statistics', () => {
    it('updates stats', () => {
      useGameStore.getState().updateStats({ gamesPlayed: 5 })
      expect(useGameStore.getState().stats.gamesPlayed).toBe(5)
    })

    it('increments games played', () => {
      useGameStore.getState().updateStats({ gamesPlayed: 1 })
      useGameStore.getState().updateStats({ gamesPlayed: useGameStore.getState().stats.gamesPlayed + 1 })
      expect(useGameStore.getState().stats.gamesPlayed).toBe(2)
    })
  })

  describe('AI Evaluation', () => {
    it('sets AI evaluation', () => {
      const evaluation = { score: 85, accuracy: 90, creativity: 80, clarity: 85, comment: 'Great!' }
      useGameStore.getState().setAIEvaluation('drawing1', evaluation)
      expect(useGameStore.getState().aiEvaluations['drawing1']).toEqual(evaluation)
    })

    it('sets AI evaluating state', () => {
      useGameStore.getState().setAIEvaluating(true)
      expect(useGameStore.getState().aiEvaluating).toBe(true)
    })
  })

  describe('Progression', () => {
    it('unlocks item', () => {
      useGameStore.getState().unlockItem('new-brush')
      expect(useGameStore.getState().unlockedItems).toContain('new-brush')
    })
  })
})

describe('calculateScore', () => {
  it('returns 10 for first place', () => {
    expect(calculateScore(1)).toBe(10)
  })

  it('returns 7 for second place', () => {
    expect(calculateScore(2)).toBe(7)
  })

  it('returns 5 for third place', () => {
    expect(calculateScore(3)).toBe(5)
  })

  it('returns 2 for other places', () => {
    expect(calculateScore(4)).toBe(2)
    expect(calculateScore(5)).toBe(2)
  })
})

describe('calculateFinalScore', () => {
  it('combines vote and AI scores with weights', () => {
    // 70% votes + 30% AI
    const result = calculateFinalScore(100, 100)
    expect(result).toBe(100)
  })

  it('gives more weight to votes', () => {
    const result = calculateFinalScore(100, 0)
    expect(result).toBe(70) // 70% of 100
  })

  it('gives less weight to AI', () => {
    const result = calculateFinalScore(0, 100)
    expect(result).toBe(30) // 30% of 100
  })

  it('rounds the result', () => {
    const result = calculateFinalScore(50, 50)
    expect(result).toBe(50) // 0.7*50 + 0.3*50 = 35 + 15 = 50
  })
})

describe('getLetters', () => {
  it('returns English letters by default', () => {
    const letters = getLetters('en')
    expect(letters).toContain('A')
    expect(letters).toContain('Z')
    expect(letters).toHaveLength(26)
  })

  it('returns Arabic letters for Arabic', () => {
    const letters = getLetters('ar')
    expect(letters).toContain('ا')
    expect(letters.length).toBeGreaterThan(0)
  })
})

describe('getRandomWord', () => {
  it('returns a word from the specified category', () => {
    const word = getRandomWord('animals')
    expect(word.category).toBe('animals')
    expect(word.word).toBeDefined()
    expect(word.emoji).toBeDefined()
  })

  it('returns different words on multiple calls', () => {
    const words = new Set<string>()
    for (let i = 0; i < 20; i++) {
      words.add(getRandomWord('animals').word)
    }
    // Should have at least 2 different words
    expect(words.size).toBeGreaterThan(1)
  })
})

describe('getRandomCreativePrompt', () => {
  it('returns a prompt in English', () => {
    const prompt = getRandomCreativePrompt('en')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('returns a prompt in Arabic', () => {
    const prompt = getRandomCreativePrompt('ar')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('returns a prompt in German', () => {
    const prompt = getRandomCreativePrompt('de')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })
})

describe('CATEGORIES', () => {
  it('contains expected categories', () => {
    const { CATEGORIES } = require('@/store/gameStore')
    expect(CATEGORIES).toBeDefined()
    expect(CATEGORIES.length).toBeGreaterThan(0)
    expect(CATEGORIES.some((c: any) => c.id === 'food')).toBe(true)
    expect(CATEGORIES.some((c: any) => c.id === 'animals')).toBe(true)
    expect(CATEGORIES.some((c: any) => c.id === 'nature')).toBe(true)
  })
})
