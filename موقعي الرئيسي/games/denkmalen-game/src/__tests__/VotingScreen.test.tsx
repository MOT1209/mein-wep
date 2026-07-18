import { render, screen } from '@testing-library/react'
import { VotingScreen } from '@/components/VotingScreen'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'

// Mock dependencies
jest.mock('@/store/gameStore')
jest.mock('@/components/GameProvider')
jest.mock('@/components/SocketProvider')

const mockUseGameStore = useGameStore as jest.Mock
const mockUseGame = useGame as jest.Mock
const mockUseSocket = useSocket as jest.Mock

const mockPlayers = [
  { id: '1', name: 'Player 1', avatar: '😀', score: 0, roundWins: 0, totalVotes: 0 },
  { id: '2', name: 'Player 2', avatar: '😎', score: 0, roundWins: 0, totalVotes: 0 },
]

const mockDrawings = [
  { id: 'd1', playerId: '1', word: 'cat', canvasData: 'data:image/png;base64,abc', category: 'animals', timestamp: 1 },
  { id: 'd2', playerId: '2', word: 'cat', canvasData: 'data:image/png;base64,def', category: 'animals', timestamp: 2 },
]

describe('VotingScreen', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'offline',
      drawings: mockDrawings,
      votes: [],
      hasVoted: {},
      currentPlayer: mockPlayers[0],
      players: mockPlayers,
      addVote: jest.fn(),
      setPhase: jest.fn(),
      updatePlayerScore: jest.fn(),
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      submitVote: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders voting title', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/Vote!/i)).toBeInTheDocument()
  })

  it('shows pass device overlay in offline mode', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/turn to vote!/i)).toBeInTheDocument()
  })

  it('shows start voting button', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/Start Voting/i)).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/Votes Collected/i)).toBeInTheDocument()
  })

  it('shows vote count as 0 initially', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument()
  })
})

describe('VotingScreen with votes', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'offline',
      drawings: mockDrawings,
      votes: [
        { voterId: '1', drawingId: 'd2', rank: 1 },
      ],
      hasVoted: { '1': ['d2'] },
      currentPlayer: mockPlayers[0],
      players: mockPlayers,
      addVote: jest.fn(),
      setPhase: jest.fn(),
      updatePlayerScore: jest.fn(),
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      submitVote: jest.fn(),
    })
  })

  it('shows vote count 1/2', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument()
  })
})

describe('VotingScreen online mode', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'online',
      drawings: mockDrawings,
      votes: [],
      hasVoted: {},
      currentPlayer: mockPlayers[0],
      players: mockPlayers,
      addVote: jest.fn(),
      setPhase: jest.fn(),
      updatePlayerScore: jest.fn(),
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      submitVote: jest.fn(),
    })
  })

  it('does not show pass device overlay in online mode', () => {
    render(<VotingScreen />)
    expect(screen.queryByText(/turn to vote!/i)).not.toBeInTheDocument()
  })

  it('shows submit vote button', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/Submit Vote/i)).toBeInTheDocument()
  })
})

describe('VotingScreen Arabic', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      mode: 'offline',
      drawings: mockDrawings,
      votes: [],
      hasVoted: {},
      currentPlayer: mockPlayers[0],
      players: mockPlayers,
      addVote: jest.fn(),
      setPhase: jest.fn(),
      updatePlayerScore: jest.fn(),
      gameType: 'classic',
      currentLetter: null,
      creativePrompt: null,
      settings: {
        language: 'ar',
        sound: true,
        vibration: true,
      },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      submitVote: jest.fn(),
    })
  })

  it('renders Arabic voting title', () => {
    render(<VotingScreen />)
    expect(screen.getByText(/صوّت/i)).toBeInTheDocument()
  })
})
