// Game Types
export type GameMode = 'offline' | 'online' | null
export type GamePhase = 'menu' | 'setup' | 'lobby' | 'playing' | 'drawing' | 'voting' | 'results' | 'leaderboard' | 'settings' | 'stats'

export interface Player {
  id: string
  name: string
  avatar: string
  score: number
  roundWins: number
  totalVotes: number
  isOnline?: boolean
  socketId?: string
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
  | 'random' 
  | 'custom'

export interface Word {
  word: string
  emoji: string
  category: Category
}

// Drawing Tools
export type DrawingTool = 'pencil' | 'brush' | 'marker' | 'eraser' | 'fill'

export interface ToolSettings {
  tool: DrawingTool
  color: string
  brushSize: number
}

// Settings
export interface GameSettings {
  darkMode: boolean
  sound: boolean
  music: boolean
  vibration: boolean
  language: 'en' | 'ar'
}

// Statistics
export interface GameStats {
  gamesPlayed: number
  wins: number
  totalVotes: number
  favoriteCategory: Category
  highestScore: number
  totalDrawingTime: number
}

// Socket Events
export interface SocketEvents {
  // Client -> Server
  'create-room': (data: { playerName: string; avatar?: string; settings?: Partial<Room> }) => void
  'join-room': (data: { roomCode: string; playerName: string; avatar?: string }) => void
  'start-game': (data: { words: Word[] }) => void
  'drawing-update': (data: { drawingData: string }) => void
  'submit-drawing': (data: { word: string; canvasData: string; category: string }) => void
  'submit-vote': (data: { drawingId: string; rank: number }) => void
  'next-round': () => void
  
  // Server -> Client
  'room-created': (data: { room: Room }) => void
  'room-joined': (data: { room: Room }) => void
  'player-joined': (data: { player: Player; players: Player[] }) => void
  'player-left': (data: { playerId: string; players: Player[]; newHost: string }) => void
  'game-started': (data: { room: Room; round: number }) => void
  'drawing-progress': (data: { playerId: string; drawingData: string }) => void
  'drawing-submitted': (data: { playerId: string }) => void
  'all-drawings-submitted': (data: { drawings: Omit<Drawing, 'canvasData'>[] }) => void
  'vote-submitted': (data: { voterId: string }) => void
  'round-results': (data: { results: Result[] }) => void
  'next-round-started': (data: { round: number }) => void
  'error': (data: { message: string }) => void
}

export interface Result {
  playerId: string
  playerName: string
  playerAvatar: string
  votes: number
  score: number
  rank: number
}
