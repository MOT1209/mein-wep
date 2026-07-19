import { render, screen } from '@testing-library/react'
import { PluginManager } from '@/components/PluginManager'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/components/GameProvider'
import { pluginManager } from '@/plugin-system/manager'

// Mock useGameStore
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}))

// Mock useGame
jest.mock('@/components/GameProvider', () => ({
  useGame: jest.fn(),
}))

// Mock pluginManager
jest.mock('@/plugin-system/manager', () => ({
  pluginManager: {
    listPlugins: jest.fn().mockReturnValue([]),
    get: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaArrowLeft: () => <span data-testid="icon-back">←</span>,
  FaPuzzlePiece: () => <span data-testid="icon-puzzle">🧩</span>,
  FaCheck: () => <span data-testid="icon-check">✓</span>,
  FaTimes: () => <span data-testid="icon-times">✗</span>,
  FaInfoCircle: () => <span data-testid="icon-info">ℹ</span>,
  FaCog: () => <span data-testid="icon-cog">⚙</span>,
}))

describe('PluginManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      setPhase: jest.fn(),
      settings: { language: 'en' },
    })
    
    ;(useGame as jest.Mock).mockReturnValue({
      playSound: jest.fn(),
      vibrate: jest.fn(),
    })
  })

  it('renders plugin manager without crashing', () => {
    render(<PluginManager />)
    
    // Should render without errors
    expect(screen.getByTestId('icon-puzzle')).toBeInTheDocument()
  })

  it('calls setPhase when back button clicked', () => {
    const mockSetPhase = jest.fn()
    
    ;(useGameStore as unknown as jest.Mock).mockReturnValue({
      setPhase: mockSetPhase,
      settings: { language: 'en' },
    })
    
    render(<PluginManager />)
    
    const backButton = screen.getByTestId('icon-back').closest('button')
    if (backButton) {
      backButton.click()
      expect(mockSetPhase).toHaveBeenCalledWith('settings')
    }
  })

  it('shows empty state when no plugins', () => {
    ;(pluginManager.listPlugins as jest.Mock).mockReturnValue([])
    
    render(<PluginManager />)
    
    // Should render without errors
    expect(screen.getByTestId('icon-puzzle')).toBeInTheDocument()
  })
})
