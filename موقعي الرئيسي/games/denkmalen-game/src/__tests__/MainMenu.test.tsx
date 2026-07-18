import { render, screen, fireEvent } from '@testing-library/react'
import { MainMenu } from '@/components/MainMenu'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'

// Mock the store
jest.mock('@/store/gameStore')
jest.mock('@/components/GameProvider')
jest.mock('@/lib/flags', () => ({
  FEATURES: {
    onlineMode: false,
    leaderboard: true,
    statistics: true,
    demoVideo: false,
  },
}))

const mockUseGameStore = useGameStore as jest.Mock
const mockUseGame = useGame as jest.Mock

describe('MainMenu', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      stats: {
        gamesPlayed: 0,
        wins: 0,
        highestScore: 0,
      },
      settings: {
        language: 'en',
        sound: true,
        vibration: true,
      },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
      startOnlineGame: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders game title', () => {
    render(<MainMenu />)
    expect(screen.getByText(/Denkmalen/)).toBeInTheDocument()
  })

  it('renders headline', () => {
    render(<MainMenu />)
    // The headline comes from t('menu.headline', lang)
    expect(screen.getByText(/Draw words/i)).toBeInTheDocument()
  })

  it('renders play now button', () => {
    render(<MainMenu />)
    expect(screen.getByText(/Play Now/i)).toBeInTheDocument()
  })

  it('calls setPhase when Play Now clicked', () => {
    const mockSetPhase = jest.fn()
    mockUseGameStore.mockReturnValue({
      setPhase: mockSetPhase,
      stats: { gamesPlayed: 0, wins: 0, highestScore: 0 },
      settings: { language: 'en', sound: true, vibration: true },
    })

    render(<MainMenu />)
    fireEvent.click(screen.getByText(/Play Now/i))
    expect(mockSetPhase).toHaveBeenCalledWith('setup')
  })

  it('calls playSound when Play Now clicked', () => {
    const mockPlaySound = jest.fn()
    mockUseGame.mockReturnValue({
      playSound: mockPlaySound,
      vibrate: jest.fn(),
      startOnlineGame: jest.fn(),
    })

    render(<MainMenu />)
    fireEvent.click(screen.getByText(/Play Now/i))
    expect(mockPlaySound).toHaveBeenCalledWith('click')
  })

  it('shows settings button', () => {
    render(<MainMenu />)
    expect(screen.getByText(/Settings/i)).toBeInTheDocument()
  })

  it('calls setPhase when settings clicked', () => {
    const mockSetPhase = jest.fn()
    mockUseGameStore.mockReturnValue({
      setPhase: mockSetPhase,
      stats: { gamesPlayed: 0, wins: 0, highestScore: 0 },
      settings: { language: 'en', sound: true, vibration: true },
    })

    render(<MainMenu />)
    fireEvent.click(screen.getByText(/Settings/i))
    expect(mockSetPhase).toHaveBeenCalledWith('settings')
  })

  it('hides stats when no games played', () => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      stats: { gamesPlayed: 0, wins: 0, highestScore: 0 },
      settings: { language: 'en', sound: true, vibration: true },
    })

    render(<MainMenu />)
    expect(screen.queryByText(/games/i)).not.toBeInTheDocument()
  })

  it('shows stats when games played', () => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      stats: { gamesPlayed: 5, wins: 2, highestScore: 85 },
      settings: { language: 'en', sound: true, vibration: true },
    })

    render(<MainMenu />)
    // Stats should be visible - look for the games text
    expect(screen.getByText(/games/i)).toBeInTheDocument()
  })
})

describe('MainMenu Arabic', () => {
  beforeEach(() => {
    mockUseGameStore.mockReturnValue({
      setPhase: jest.fn(),
      stats: { gamesPlayed: 0, wins: 0, highestScore: 0 },
      settings: { language: 'ar', sound: true, vibration: true },
    })

    mockUseGame.mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
      startOnlineGame: jest.fn(),
    })
  })

  it('renders Arabic play button', () => {
    render(<MainMenu />)
    // Arabic translation for menu.playNow
    expect(screen.getByText(/العب الآن/i)).toBeInTheDocument()
  })
})
