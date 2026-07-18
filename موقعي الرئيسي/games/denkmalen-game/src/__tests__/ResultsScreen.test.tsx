import { render, screen } from '@testing-library/react'
import { ResultsScreen } from '@/components/ResultsScreen'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'
import { evaluateDrawings } from '@/lib/gemini'

jest.mock('@/store/gameStore')
jest.mock('@/components/GameProvider')
jest.mock('@/components/SocketProvider')
jest.mock('@/lib/gemini')
jest.mock('@/components/AIJudge', () => ({
  AIJudge: () => null,
  CombinedScoreDisplay: () => null,
}))
jest.mock('@/components/ResultCard', () => ({
  ResultCard: () => null,
}))

const mockUseGameStore = useGameStore as jest.Mock
const mockUseGame = useGame as jest.Mock
const mockUseSocket = useSocket as jest.Mock
const mockEvaluateDrawings = evaluateDrawings as jest.Mock

describe('ResultsScreen', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'offline',
      drawings: [
        { id: 'd1', playerId: '1', word: 'cat', canvasData: 'data:image/png;base64,abc', category: 'animals', timestamp: 1 },
      ],
      votes: [{ voterId: '1', drawingId: 'd1', rank: 1 }],
      players: [{ id: '1', name: 'Player 1', avatar: '😀', score: 10, roundWins: 1, totalVotes: 1 }],
      currentRound: 1, totalRounds: 3,
      setPhase: jest.fn(), resetGame: jest.fn(), nextRound: jest.fn(), setPlayer: jest.fn(),
      gameType: 'classic', currentLetter: null, creativePrompt: null, selectedCategory: 'random',
      settings: { language: 'en', sound: true, vibration: true },
      getState: jest.fn().mockReturnValue({ room: null }),
    })
    mockUseGame.mockReturnValue({ playSound: jest.fn(), vibrate: jest.fn() })
    mockUseSocket.mockReturnValue({ nextRound: jest.fn() })
    mockEvaluateDrawings.mockResolvedValue(new Map())
  })

  afterEach(() => jest.clearAllMocks())

  it('renders results title', () => {
    render(<ResultsScreen />)
    expect(screen.getByText(/Results/i)).toBeInTheDocument()
  })

  it('calls evaluateDrawings on mount', () => {
    render(<ResultsScreen />)
    expect(mockEvaluateDrawings).toHaveBeenCalled()
  })

  it('shows round number', () => {
    render(<ResultsScreen />)
    expect(screen.getByText(/Round 1/)).toBeInTheDocument()
  })
})

describe('ResultsScreen Arabic', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'offline',
      drawings: [
        { id: 'd1', playerId: '1', word: 'cat', canvasData: 'data:image/png;base64,abc', category: 'animals', timestamp: 1 },
      ],
      votes: [{ voterId: '1', drawingId: 'd1', rank: 1 }],
      players: [{ id: '1', name: 'Player 1', avatar: '😀', score: 10, roundWins: 1, totalVotes: 1 }],
      currentRound: 1, totalRounds: 3,
      setPhase: jest.fn(), resetGame: jest.fn(), nextRound: jest.fn(), setPlayer: jest.fn(),
      gameType: 'classic', currentLetter: null, creativePrompt: null, selectedCategory: 'random',
      settings: { language: 'ar', sound: true, vibration: true },
      getState: jest.fn().mockReturnValue({ room: null }),
    })
    mockUseGame.mockReturnValue({ playSound: jest.fn(), vibrate: jest.fn() })
    mockUseSocket.mockReturnValue({ nextRound: jest.fn() })
    mockEvaluateDrawings.mockResolvedValue(new Map())
  })

  it('renders Arabic results title', () => {
    render(<ResultsScreen />)
    expect(screen.getByText(/نتائج الجولة/i)).toBeInTheDocument()
  })
})
