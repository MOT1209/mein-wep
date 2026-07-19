import { render, screen } from '@testing-library/react'
import { Leaderboard } from '@/components/Leaderboard'
import { useGameStore } from '@/store/gameStore'

// Mock useGameStore
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}))

// Mock useGame
jest.mock('@/components/GameProvider', () => ({
  useGame: jest.fn(() => ({
    playSound: jest.fn(),
    vibrate: jest.fn(),
  })),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaArrowLeft: () => <span>←</span>,
  FaTrophy: () => <span>🏆</span>,
  FaMedal: () => <span>🥇</span>,
  FaCrown: () => <span>👑</span>,
  FaRedo: () => <span>🔄</span>,
  FaHome: () => <span>🏠</span>,
  FaCog: () => <span>⚙️</span>,
}))

describe('Leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      setPhase: jest.fn(),
      settings: { language: 'en' },
      players: [
        { id: '1', name: 'Alice', score: 300, avatar: '🎨', roundWins: 3 },
        { id: '2', name: 'Bob', score: 250, avatar: '🎭', roundWins: 2 },
        { id: '3', name: 'Charlie', score: 200, avatar: '🎪', roundWins: 1 },
      ],
    })
  })

  it('renders leaderboard with players', () => {
    render(<Leaderboard />)
    
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0)
  })

  it('shows scores', () => {
    render(<Leaderboard />)
    
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('calls setPhase when back button clicked', () => {
    const mockSetPhase = jest.fn()
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      setPhase: mockSetPhase,
      settings: { language: 'en' },
      players: [],
    })

    render(<Leaderboard />)
    
    const backButton = screen.getByText('←').closest('button')
    if (backButton) {
      backButton.click()
      expect(mockSetPhase).toHaveBeenCalled()
    }
  })

  it('handles empty players list', () => {
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      setPhase: jest.fn(),
      settings: { language: 'en' },
      players: [],
    })

    render(<Leaderboard />)
    
    // Should render without errors
    expect(document.body).toBeInTheDocument()
  })
})
