import { render, screen, fireEvent } from '@testing-library/react'
import { OfflineSetup } from '@/components/OfflineSetup'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'

// Mock dependencies
jest.mock('@/store/gameStore')
jest.mock('@/components/GameProvider')

const mockUseGameStore = useGameStore as jest.Mock
const mockUseGame = useGame as jest.Mock

describe('OfflineSetup', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      setCategory: jest.fn(),
      setGameType: jest.fn(),
      setCurrentLetter: jest.fn(),
      setCreativePrompt: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      setState: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      startOfflineGame: jest.fn(),
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders offline mode title', () => {
    render(<OfflineSetup />)
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument()
  })

  it('renders same device subtitle', () => {
    render(<OfflineSetup />)
    expect(screen.getByText(/Same Device/i)).toBeInTheDocument()
  })

  it('shows minimum 2 player inputs', () => {
    render(<OfflineSetup />)
    const inputs = screen.getAllByPlaceholderText(/Player/i)
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('disables next button when less than 2 players named', () => {
    render(<OfflineSetup />)
    const nextButton = screen.getByText(/Next/i)
    expect(nextButton).toBeDisabled()
  })

  it('enables next button when 2 players named', () => {
    render(<OfflineSetup />)
    const inputs = screen.getAllByPlaceholderText(/Player/i)
    fireEvent.change(inputs[0], { target: { value: 'Alice' } })
    fireEvent.change(inputs[1], { target: { value: 'Bob' } })
    
    const nextButton = screen.getByText(/Next/i)
    expect(nextButton).not.toBeDisabled()
  })

  it('shows add player button', () => {
    render(<OfflineSetup />)
    expect(screen.getByLabelText(/Add Player/i)).toBeInTheDocument()
  })

  it('calls setPhase when back button clicked', () => {
    const mockSetPhase = jest.fn()
    mockUseGameStore.mockReturnValue({
      setPhase: mockSetPhase,
      setCategory: jest.fn(),
      setGameType: jest.fn(),
      setCurrentLetter: jest.fn(),
      setCreativePrompt: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
      setState: jest.fn(),
    })

    render(<OfflineSetup />)
    const backButton = screen.getByLabelText(/Back/i)
    fireEvent.click(backButton)
    expect(mockSetPhase).toHaveBeenCalledWith('menu')
  })

  it('navigates to game type step', () => {
    render(<OfflineSetup />)
    
    // Fill in player names
    const inputs = screen.getAllByPlaceholderText(/Player/i)
    fireEvent.change(inputs[0], { target: { value: 'Alice' } })
    fireEvent.change(inputs[1], { target: { value: 'Bob' } })
    
    // Click next
    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    
    // Should show game type selection
    expect(screen.getByText(/Choose Game Type/i)).toBeInTheDocument()
  })

  it('shows all game types', () => {
    render(<OfflineSetup />)
    
    // Navigate to game type step
    const inputs = screen.getAllByPlaceholderText(/Player/i)
    fireEvent.change(inputs[0], { target: { value: 'Alice' } })
    fireEvent.change(inputs[1], { target: { value: 'Bob' } })
    fireEvent.click(screen.getByText(/Next/i))
    
    expect(screen.getByText(/Classic/i)).toBeInTheDocument()
    expect(screen.getByText(/Letter Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Category Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Creative Challenge/i)).toBeInTheDocument()
  })

  it('shows settings after selecting classic mode', () => {
    render(<OfflineSetup />)
    
    // Navigate to game type step
    const inputs = screen.getAllByPlaceholderText(/Player/i)
    fireEvent.change(inputs[0], { target: { value: 'Alice' } })
    fireEvent.change(inputs[1], { target: { value: 'Bob' } })
    fireEvent.click(screen.getByText(/Next/i))
    
    // Select classic mode
    fireEvent.click(screen.getByText(/Classic/i))
    
    // Should show settings
    expect(screen.getByText(/Game Settings/i)).toBeInTheDocument()
  })
})

describe('OfflineSetup Arabic', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      setCategory: jest.fn(),
      setGameType: jest.fn(),
      setCurrentLetter: jest.fn(),
      setCreativePrompt: jest.fn(),
      selectedCategory: 'random',
      totalRounds: 3,
      drawingTime: 60,
      settings: {
        language: 'ar',
        sound: true,
        vibration: true,
      },
      setState: jest.fn(),
    })

    mockUseGame.mockReturnValue({
      startOfflineGame: jest.fn(),
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })
  })

  it('renders Arabic offline mode title', () => {
    render(<OfflineSetup />)
    expect(screen.getByText(/وضع بدون إنترنت/i)).toBeInTheDocument()
  })
})
