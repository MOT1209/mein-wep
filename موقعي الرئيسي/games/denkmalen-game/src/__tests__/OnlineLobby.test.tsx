import { render, screen, fireEvent } from '@testing-library/react'
import { OnlineLobby } from '@/components/OnlineLobby'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { useSocket } from '@/components/SocketProvider'

// Mock dependencies
jest.mock('@/store/gameStore')
jest.mock('@/components/GameProvider')
jest.mock('@/components/SocketProvider')
jest.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code" data-value={value} />,
}))

const mockUseGameStore = useGameStore as jest.Mock
const mockUseGame = useGame as jest.Mock
const mockUseSocket = useSocket as jest.Mock

describe('OnlineLobby', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      room: null,
      currentPlayer: null,
      setCategory: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      gameType: 'classic',
      setGameType: jest.fn(),
      currentLetter: null,
      setCurrentLetter: jest.fn(),
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      pendingJoinCode: null,
      setPendingJoinCode: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: true,
      error: null,
      clearError: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders online mode title', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/Online Mode/i)).toBeInTheDocument()
  })

  it('shows player name input', () => {
    render(<OnlineLobby />)
    expect(screen.getByPlaceholderText(/Your Name/i)).toBeInTheDocument()
  })

  it('disables create room button when no name', () => {
    render(<OnlineLobby />)
    const createButton = screen.getByText(/Create Room/i)
    expect(createButton).toBeDisabled()
  })

  it('enables create room button when name entered', () => {
    render(<OnlineLobby />)
    const nameInput = screen.getByPlaceholderText(/Your Name/i)
    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    
    const createButton = screen.getByText(/Create Room/i)
    expect(createButton).not.toBeDisabled()
  })

  it('calls createRoom when create button clicked', () => {
    const mockCreateRoom = jest.fn()
    mockUseSocket.mockReturnValue({
      createRoom: mockCreateRoom,
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: true,
      error: null,
      clearError: jest.fn(),
    })

    render(<OnlineLobby />)
    const nameInput = screen.getByPlaceholderText(/Your Name/i)
    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    
    fireEvent.click(screen.getByText(/Create Room/i))
    expect(mockCreateRoom).toHaveBeenCalledWith({
      playerName: 'Alice',
      rounds: 3,
      drawingTime: 60,
      category: 'random',
    })
  })

  it('calls setPhase when back button clicked', () => {
    const mockSetPhase = jest.fn()
    mockUseGameStore.mockReturnValue({
      setPhase: mockSetPhase,
      room: null,
      currentPlayer: null,
      setCategory: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      gameType: 'classic',
      setGameType: jest.fn(),
      currentLetter: null,
      setCurrentLetter: jest.fn(),
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      pendingJoinCode: null,
      setPendingJoinCode: jest.fn(),
    })

    render(<OnlineLobby />)
    const backButton = screen.getByLabelText(/Back/i)
    fireEvent.click(backButton)
    expect(mockSetPhase).toHaveBeenCalledWith('menu')
  })

  it('shows connecting message when not connected', () => {
    mockUseSocket.mockReturnValue({
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: false,
      error: null,
      clearError: jest.fn(),
    })

    render(<OnlineLobby />)
    expect(screen.getByText(/Connecting/i)).toBeInTheDocument()
  })
})

describe('OnlineLobby in room', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      room: {
        id: 'room1',
        code: 'ABC123',
        hostId: 'player1',
        players: [
          { id: 'player1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0, isHost: true },
          { id: 'player2', name: 'Bob', avatar: '🎭', score: 0, roundWins: 0, totalVotes: 0 },
        ],
        maxPlayers: 8,
        rounds: 3,
        currentRound: 1,
        drawingTime: 60,
        category: 'random',
        phase: 'lobby',
      },
      currentPlayer: { id: 'player1', name: 'Alice', avatar: '🎨', score: 0, roundWins: 0, totalVotes: 0, isHost: true },
      setCategory: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      gameType: 'classic',
      setGameType: jest.fn(),
      currentLetter: null,
      setCurrentLetter: jest.fn(),
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      pendingJoinCode: null,
      setPendingJoinCode: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: true,
      error: null,
      clearError: jest.fn(),
    })
  })

  it('shows room code', () => {
    render(<OnlineLobby />)
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('shows player list', () => {
    render(<OnlineLobby />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows host badge', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/Host/i)).toBeInTheDocument()
  })

  it('shows copy code button', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/Copy Code/i)).toBeInTheDocument()
  })

  it('shows share link button', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/Share Link/i)).toBeInTheDocument()
  })

  it('shows QR code', () => {
    render(<OnlineLobby />)
    expect(screen.getByTestId('qr-code')).toBeInTheDocument()
  })

  it('shows start game button when host and 2+ players', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/Start Game/)).toBeInTheDocument()
  })
})

describe('OnlineLobby with error', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      room: null,
      currentPlayer: null,
      setCategory: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      gameType: 'classic',
      setGameType: jest.fn(),
      currentLetter: null,
      setCurrentLetter: jest.fn(),
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      pendingJoinCode: null,
      setPendingJoinCode: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: true,
      error: 'Room not found',
      clearError: jest.fn(),
    })
  })

  it('shows error message', () => {
    render(<OnlineLobby />)
    expect(screen.getByText('Room not found')).toBeInTheDocument()
  })
})

describe('OnlineLobby Arabic', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      room: null,
      currentPlayer: null,
      setCategory: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      gameType: 'classic',
      setGameType: jest.fn(),
      currentLetter: null,
      setCurrentLetter: jest.fn(),
      settings: {
        language: 'ar',
        sound: true,
        vibration: true,
      },
      pendingJoinCode: null,
      setPendingJoinCode: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })

    mockUseSocket.mockReturnValue({
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      startGame: jest.fn(),
      connected: true,
      error: null,
      clearError: jest.fn(),
    })
  })

  it('renders Arabic online mode title', () => {
    render(<OnlineLobby />)
    expect(screen.getByText(/وضع إنترنت/i)).toBeInTheDocument()
  })
})
