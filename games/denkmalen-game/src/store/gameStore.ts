import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// Types
export type GameMode = 'offline' | 'online' | null
export type GamePhase = 'menu' | 'setup' | 'lobby' | 'playing' | 'drawing' | 'voting' | 'results' | 'leaderboard' | 'stats' | 'settings'

export type GameType = 'classic' | 'letter' | 'category' | 'daily' | 'creative'

export interface Player {
  id: string
  name: string
  avatar: string
  score: number
  roundWins: number
  totalVotes: number
  isOnline?: boolean
  socketId?: string
  isHost?: boolean
  currentWord?: Word
}

export interface Drawing {
  id: string
  playerId: string
  word: string
  canvasData: string
  category: string
  timestamp: number
}

export interface Vote {
  voterId: string
  drawingId: string
  rank: number
}

export interface AIEvaluation {
  score: number        // 0-100 overall score
  accuracy: number     // 0-100 how well it matches the word
  creativity: number   // 0-100 creative interpretation
  clarity: number      // 0-100 visual clarity
  comment: string      // Short friendly feedback
}

export interface RoundResult {
  roundNumber: number
  drawings: Drawing[]
  votes: Vote[]
  scores: Record<string, number>
  aiEvaluations: Record<string, AIEvaluation>
}

// Server-computed round result (online mode, from server.js calculateResults)
export interface Result {
  playerId: string
  playerName: string
  playerAvatar: string
  votes: number
  score: number
  rank: number
}

export interface Room {
  id: string
  code: string
  hostId: string
  players: Player[]
  maxPlayers: number
  rounds: number
  currentRound: number
  drawingTime: number
  category: string
  phase: GamePhase
}

export type Category = 
  | 'food' 
  | 'animals' 
  | 'nature' 
  | 'objects' 
  | 'vehicles' 
  | 'sports' 
  | 'jobs' 
  | 'fantasy' 
  | 'technology'
  | 'space'
  | 'history'
  | 'random' 
  | 'custom'

// Categories metadata for UI display
export const CATEGORIES: Array<{ id: Category; name: string; emoji: string; color: string }> = [
  { id: 'food', name: 'Food', emoji: '🍔', color: '#F59E0B' },
  { id: 'animals', name: 'Animals', emoji: '🐾', color: '#10B981' },
  { id: 'nature', name: 'Nature', emoji: '🌿', color: '#22C55E' },
  { id: 'objects', name: 'Objects', emoji: '📦', color: '#3B82F6' },
  { id: 'vehicles', name: 'Vehicles', emoji: '🚗', color: '#8B5CF6' },
  { id: 'sports', name: 'Sports', emoji: '⚽', color: '#EF4444' },
  { id: 'jobs', name: 'Jobs', emoji: '👷', color: '#6366F1' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙', color: '#EC4899' },
  { id: 'technology', name: 'Technology', emoji: '💻', color: '#06B6D4' },
  { id: 'space', name: 'Space', emoji: '🚀', color: '#1F2937' },
  { id: 'history', name: 'History', emoji: '🏛️', color: '#92400E' },
  { id: 'random', name: 'Random', emoji: '🎲', color: '#6B7280' },
]

export interface Word {
  word: string
  emoji: string
  category: Category
}

// Words Database
export const WORDS: Record<Category, Word[]> = {
  food: [
    { word: 'Apple', emoji: '🍎', category: 'food' },
    { word: 'Pizza', emoji: '🍕', category: 'food' },
    { word: 'Hamburger', emoji: '🍔', category: 'food' },
    { word: 'Ice Cream', emoji: '🍦', category: 'food' },
    { word: 'Cake', emoji: '🎂', category: 'food' },
    { word: 'Sushi', emoji: '🍣', category: 'food' },
    { word: 'Taco', emoji: '🌮', category: 'food' },
    { word: 'Donut', emoji: '🍩', category: 'food' },
    { word: 'Watermelon', emoji: '🍉', category: 'food' },
    { word: 'Popcorn', emoji: '🍿', category: 'food' },
  ],
  animals: [
    { word: 'Cat', emoji: '🐱', category: 'animals' },
    { word: 'Dog', emoji: '🐶', category: 'animals' },
    { word: 'Elephant', emoji: '🐘', category: 'animals' },
    { word: 'Lion', emoji: '🦁', category: 'animals' },
    { word: 'Penguin', emoji: '🐧', category: 'animals' },
    { word: 'Unicorn', emoji: '🦄', category: 'animals' },
    { word: 'Dragon', emoji: '🐉', category: 'animals' },
    { word: 'Dolphin', emoji: '🐬', category: 'animals' },
    { word: 'Butterfly', emoji: '🦋', category: 'animals' },
    { word: 'Owl', emoji: '🦉', category: 'animals' },
  ],
  nature: [
    { word: 'Sun', emoji: '☀️', category: 'nature' },
    { word: 'Moon', emoji: '🌙', category: 'nature' },
    { word: 'Tree', emoji: '🌳', category: 'nature' },
    { word: 'Flower', emoji: '🌸', category: 'nature' },
    { word: 'Mountain', emoji: '⛰️', category: 'nature' },
    { word: 'Ocean', emoji: '🌊', category: 'nature' },
    { word: 'Rainbow', emoji: '🌈', category: 'nature' },
    { word: 'Snowflake', emoji: '❄️', category: 'nature' },
    { word: 'Volcano', emoji: '🌋', category: 'nature' },
    { word: 'Desert', emoji: '🏜️', category: 'nature' },
  ],
  objects: [
    { word: 'Lamp', emoji: '💡', category: 'objects' },
    { word: 'Key', emoji: '🔑', category: 'objects' },
    { word: 'Book', emoji: '📚', category: 'objects' },
    { word: 'Phone', emoji: '📱', category: 'objects' },
    { word: 'Watch', emoji: '⌚', category: 'objects' },
    { word: 'Camera', emoji: '📷', category: 'objects' },
    { word: 'Guitar', emoji: '🎸', category: 'objects' },
    { word: 'Clock', emoji: '⏰', category: 'objects' },
    { word: 'Gift', emoji: '🎁', category: 'objects' },
    { word: 'Crown', emoji: '👑', category: 'objects' },
  ],
  vehicles: [
    { word: 'Car', emoji: '🚗', category: 'vehicles' },
    { word: 'Airplane', emoji: '✈️', category: 'vehicles' },
    { word: 'Boat', emoji: '⛵', category: 'vehicles' },
    { word: 'Train', emoji: '🚂', category: 'vehicles' },
    { word: 'Rocket', emoji: '🚀', category: 'vehicles' },
    { word: 'Bicycle', emoji: '🚲', category: 'vehicles' },
    { word: 'Helicopter', emoji: '🚁', category: 'vehicles' },
    { word: 'Motorcycle', emoji: '🏍️', category: 'vehicles' },
    { word: 'Bus', emoji: '🚌', category: 'vehicles' },
    { word: 'Submarine', emoji: '🚢', category: 'vehicles' },
  ],
  sports: [
    { word: 'Football', emoji: '⚽', category: 'sports' },
    { word: 'Basketball', emoji: '🏀', category: 'sports' },
    { word: 'Tennis', emoji: '🎾', category: 'sports' },
    { word: 'Baseball', emoji: '⚾', category: 'sports' },
    { word: 'Golf', emoji: '⛳', category: 'sports' },
    { word: 'Boxing', emoji: '🥊', category: 'sports' },
    { word: 'Swimming', emoji: '🏊', category: 'sports' },
    { word: 'Skiing', emoji: '⛷️', category: 'sports' },
    { word: 'Surfing', emoji: '🏄', category: 'sports' },
    { word: 'Medal', emoji: '🏅', category: 'sports' },
  ],
  jobs: [
    { word: 'Doctor', emoji: '👨‍⚕️', category: 'jobs' },
    { word: 'Firefighter', emoji: '👨‍🚒', category: 'jobs' },
    { word: 'Astronaut', emoji: '👨‍🚀', category: 'jobs' },
    { word: 'Chef', emoji: '👨‍🍳', category: 'jobs' },
    { word: 'Artist', emoji: '🎨', category: 'jobs' },
    { word: 'Police', emoji: '👮', category: 'jobs' },
    { word: 'Pilot', emoji: '👨‍✈️', category: 'jobs' },
    { word: 'Teacher', emoji: '👩‍🏫', category: 'jobs' },
    { word: 'Scientist', emoji: '👨‍🔬', category: 'jobs' },
    { word: 'Musician', emoji: '🎸', category: 'jobs' },
  ],
  fantasy: [
    { word: 'Wizard', emoji: '🧙', category: 'fantasy' },
    { word: 'Fairy', emoji: '🧚', category: 'fantasy' },
    { word: 'Mermaid', emoji: '🧜', category: 'fantasy' },
    { word: 'Phoenix', emoji: '🔥', category: 'fantasy' },
    { word: 'Castle', emoji: '🏰', category: 'fantasy' },
    { word: 'Treasure', emoji: '💎', category: 'fantasy' },
    { word: 'Magic Wand', emoji: '🪄', category: 'fantasy' },
    { word: 'Ghost', emoji: '👻', category: 'fantasy' },
    { word: 'Zombie', emoji: '🧟', category: 'fantasy' },
    { word: 'Alien', emoji: '👽', category: 'fantasy' },
  ],
  random: [],
  technology: [
    { word: 'Computer', emoji: '💻', category: 'technology' },
    { word: 'Smartphone', emoji: '📱', category: 'technology' },
    { word: 'Robot', emoji: '🤖', category: 'technology' },
    { word: 'Internet', emoji: '🌐', category: 'technology' },
    { word: 'Drone', emoji: '🛸', category: 'technology' },
    { word: 'VR Headset', emoji: '🥽', category: 'technology' },
    { word: 'Wi-Fi Router', emoji: '📡', category: 'technology' },
    { word: 'Microchip', emoji: '🔬', category: 'technology' },
    { word: '3D Printer', emoji: '🖨️', category: 'technology' },
    { word: 'Laser', emoji: '🔦', category: 'technology' },
  ],
  space: [
    { word: 'Astronaut', emoji: '👨‍🚀', category: 'space' },
    { word: 'Satellite', emoji: '🛰️', category: 'space' },
    { word: 'Nebula', emoji: '🌌', category: 'space' },
    { word: 'Alien', emoji: '👽', category: 'space' },
    { word: 'Meteor', emoji: '☄️', category: 'space' },
    { word: 'Spaceship', emoji: '🚀', category: 'space' },
    { word: 'Galaxy', emoji: '🌀', category: 'space' },
    { word: 'Black Hole', emoji: '🕳️', category: 'space' },
    { word: 'Mars Rover', emoji: '🤖', category: 'space' },
    { word: 'Solar Eclipse', emoji: '🌑', category: 'space' },
  ],
  history: [
    { word: 'Pyramid', emoji: '🏛️', category: 'history' },
    { word: 'Dinosaur', emoji: '🦕', category: 'history' },
    { word: 'Crown', emoji: '👑', category: 'history' },
    { word: 'Sword', emoji: '⚔️', category: 'history' },
    { word: 'Shield', emoji: '🛡️', category: 'history' },
    { word: 'Map', emoji: '🗺️', category: 'history' },
    { word: 'Fossil', emoji: '🦴', category: 'history' },
    { word: 'Torch', emoji: '🔥', category: 'history' },
    { word: 'Parchment', emoji: '📜', category: 'history' },
    { word: 'Cannon', emoji: '💣', category: 'history' },
  ],
  custom: [],
}

// Letters for Letter Mode
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Creative Prompts for Creative Mode
export const CREATIVE_PROMPTS: string[] = [
  'A flying elephant wearing sunglasses',
  'A robot cooking pizza on Mars',
  'A castle made of chocolate under the sea',
  'A cat riding a skateboard in space',
  'A dinosaur playing basketball',
  'A wizard brewing potions in a treehouse',
  'A pirate ship sailing on clouds',
  'A snowman sunbathing on a tropical beach',
  'A unicorn racing a sports car',
  'A giant octopus playing piano',
  'A dragon delivering mail by parachute',
  'A frog wearing a top hat at a tea party',
  'A whale flying through a rainbow',
  'A panda DJing at a nightclub',
  'A snail winning a Formula 1 race',
  'An owl teaching math to baby chickens',
  'A shark lifeguarding at a public pool',
  'A bear baking a cake in a tiny kitchen',
  'A penguin performing magic tricks on stage',
  'A turtle winning a marathon against rabbits',
]

export function getRandomCreativePrompt(): string {
  return CREATIVE_PROMPTS[Math.floor(Math.random() * CREATIVE_PROMPTS.length)]
}

// Get random word
export function getRandomWord(category: Category): Word {
  if (category === 'random') {
    const allCategories = Object.keys(WORDS).filter(c => c !== 'random' && c !== 'custom') as Category[]
    const randomCat = allCategories[Math.floor(Math.random() * allCategories.length)]
    return getRandomWord(randomCat)
  }
  
  const words = WORDS[category] || WORDS.random
  return words[Math.floor(Math.random() * words.length)]
}

// Generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Avatars
const AVATARS = [
  '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸', '🎹',
  '🎺', '🎻', '🏆', '🥇', '🥈', '🥉', '👑', '💎',
  '🌟', '⭐', '🔥', '💫', '✨', '🌈', '🎨', '🖌️',
]

function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

// Score calculation
export function calculateScore(rank: number): number {
  switch (rank) {
    case 1: return 10
    case 2: return 7
    case 3: return 5
    default: return 2
  }
}

// Calculate final score combining votes and AI
export function calculateFinalScore(
  voteScore: number,
  aiScore: number
): number {
  const votesWeight = voteScore * 0.7
  const aiWeight = aiScore * 0.3
  return Math.round(votesWeight + aiWeight)
}

// Game State Interface
interface GameState {
  // Game mode and phase
  mode: GameMode
  phase: GamePhase
  gameType: GameType
  currentLetter: string | null
  creativePrompt: string | null
  
  // Players
  currentPlayer: Player | null
  players: Player[]
  
  // Room (online mode)
  room: Room | null
  
  // Drawing
  currentWord: Word | null
  currentDrawing: string | null
  drawings: Drawing[]
  drawingHistory: string[]
  historyIndex: number
  
  // Voting
  votes: Vote[]
  hasVoted: Record<string, string[]>
  
  // AI Evaluations
  aiEvaluations: Record<string, AIEvaluation>
  aiEvaluating: boolean
  
  // Round
  currentRound: number
  totalRounds: number
  drawingTime: number
  timeLeft: number
  
  // Category
  selectedCategory: Category
  
  // Settings
  settings: {
    darkMode: boolean
    sound: boolean
    music: boolean
    vibration: boolean
    language: 'en' | 'ar' | 'de'
  }
  
  // Statistics
  stats: {
    gamesPlayed: number
    wins: number
    totalVotes: number
    favoriteCategory: Category
    favoriteGameType: GameType
    highestScore: number
    totalDrawingTime: number
  }
  
  // Progression
  unlockedItems: string[]
  
  // Actions
  setMode: (mode: GameMode) => void
  setPhase: (phase: GamePhase) => void
  setGameType: (type: GameType) => void
  setCurrentLetter: (letter: string | null) => void
  setCreativePrompt: (prompt: string | null) => void
  setPlayer: (player: Player) => void
  addPlayer: (player: Player) => void
  removePlayer: (id: string) => void
  updatePlayerScore: (id: string, score: number) => void
  
  createRoom: (settings: Partial<Room>) => Room
  joinRoom: (code: string, player: Player) => void
  updateRoom: (updates: Partial<Room>) => void
  setRoom: (room: Room) => void
  
  setWord: (word: Word) => void
  setDrawing: (drawing: string) => void
  addDrawing: (drawing: Drawing) => void
  saveDrawingToHistory: (dataUrl: string) => void
  undo: () => void
  redo: () => void
  clearCanvas: () => void
  
  addVote: (vote: Vote) => void
  resetVotes: () => void
  
  setAIEvaluation: (drawingId: string, evaluation: AIEvaluation) => void
  setAIEvaluating: (evaluating: boolean) => void
  
  nextRound: () => void
  resetGame: () => void
  
  setTimeLeft: (time: number) => void
  decrementTime: () => void
  
  setCategory: (category: Category) => void
  setSettings: (settings: Partial<GameState['settings']>) => void
  updateStats: (updates: Partial<GameState['stats']>) => void
  unlockItem: (item: string) => void
}

// Create store
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: null,
      phase: 'menu',
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      currentPlayer: null,
      players: [],
      room: null,
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
      unlockedItems: ['default-brush', 'basic-colors'],
      
      // Actions
      setMode: (mode) => set({ mode }),
      
      setPhase: (phase) => set({ phase }),
      
      setGameType: (type) => set({ gameType: type }),
      
      setCurrentLetter: (letter) => set({ currentLetter: letter }),
      
      setCreativePrompt: (prompt) => set({ creativePrompt: prompt }),
      
      setPlayer: (player) => set({ currentPlayer: player }),
      
      addPlayer: (player) => set((state) => ({
        players: [...state.players, player]
      })),
      
      removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
      })),
      
      updatePlayerScore: (id, score) => set((state) => ({
        players: state.players.map(p => 
          p.id === id ? { ...p, score: p.score + score } : p
        )
      })),
      
      createRoom: (roomSettings) => {
        const room: Room = {
          id: uuidv4(),
          code: generateRoomCode(),
          hostId: get().currentPlayer?.id || '',
          players: [],
          maxPlayers: 8,
          rounds: 3,
          currentRound: 1,
          drawingTime: 60,
          category: 'random',
          phase: 'lobby',
          ...roomSettings,
        }
        set({ room, players: room.players })
        return room
      },

      joinRoom: (code, player) => set((state) => {
        const room = state.room ? {
          ...state.room,
          players: [...state.room.players, player]
        } : null
        return { room, players: room ? room.players : state.players }
      }),

      updateRoom: (updates) => set((state) => {
        const room = state.room ? { ...state.room, ...updates } : null
        return { room, players: room ? room.players : state.players }
      }),

      setRoom: (room) => set({ room, players: room.players }),
      
      setWord: (word) => set({ currentWord: word }),
      
      setDrawing: (drawing) => set({ currentDrawing: drawing }),
      
      addDrawing: (drawing) => set((state) => ({
        drawings: [...state.drawings, drawing]
      })),
      
      saveDrawingToHistory: (dataUrl) => set((state) => {
        const newHistory = state.drawingHistory.slice(0, state.historyIndex + 1)
        newHistory.push(dataUrl)
        return {
          drawingHistory: newHistory,
          historyIndex: newHistory.length - 1,
          currentDrawing: dataUrl,
        }
      }),
      
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          return {
            historyIndex: newIndex,
            currentDrawing: state.drawingHistory[newIndex],
          }
        }
        return state
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.drawingHistory.length - 1) {
          const newIndex = state.historyIndex + 1
          return {
            historyIndex: newIndex,
            currentDrawing: state.drawingHistory[newIndex],
          }
        }
        return state
      }),
      
      clearCanvas: () => set({
        currentDrawing: null,
        drawingHistory: [],
        historyIndex: -1,
      }),
      
      addVote: (vote) => set((state) => ({
        votes: [...state.votes, vote],
        hasVoted: {
          ...state.hasVoted,
          [vote.voterId]: [...(state.hasVoted[vote.voterId] || []), vote.drawingId],
        }
      })),
      
      resetVotes: () => set({ votes: [], hasVoted: {} }),
      
      setAIEvaluation: (drawingId, evaluation) => set((state) => ({
        aiEvaluations: { ...state.aiEvaluations, [drawingId]: evaluation }
      })),
      
      setAIEvaluating: (evaluating) => set({ aiEvaluating: evaluating }),
      
      nextRound: () => set((state) => ({
        currentRound: state.currentRound + 1,
        drawings: [],
        votes: [],
        hasVoted: {},
        aiEvaluations: {},
        timeLeft: state.drawingTime,
      })),
      
      resetGame: () => set({
        currentRound: 1,
        drawings: [],
        votes: [],
        hasVoted: {},
        aiEvaluations: {},
        aiEvaluating: false,
        currentWord: null,
        currentDrawing: null,
        drawingHistory: [],
        historyIndex: -1,
      }),
      
      setTimeLeft: (time) => set({ timeLeft: time }),
      
      decrementTime: () => set((state) => ({
        timeLeft: Math.max(0, state.timeLeft - 1)
      })),
      
      setCategory: (category) => set({ selectedCategory: category }),
      
      setSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),
      
      unlockItem: (item) => set((state) => ({
        unlockedItems: [...state.unlockedItems, item]
      })),
    }),
    {
      name: 'draw-battle-storage',
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
        unlockedItems: state.unlockedItems,
      }),
    }
  )
)
