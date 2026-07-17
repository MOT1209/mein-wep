import { render, screen, fireEvent } from '@testing-library/react'
import { DrawingHeader } from '@/components/drawing/DrawingHeader'

const defaultProps = {
  currentRound: 1,
  totalRounds: 3,
  currentPlayerName: 'Player 1',
  timeLeft: 60,
  showWord: true,
  gameType: 'classic' as const,
  currentLetter: null,
  creativePrompt: null,
  currentWordEmoji: '🍕',
  currentWordText: 'Pizza',
  lang: 'en' as const,
  onBack: jest.fn(),
}

describe('DrawingHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders round info', () => {
    render(<DrawingHeader {...defaultProps} />)
    expect(screen.getByText('Round 1/3')).toBeInTheDocument()
  })

  it('renders player name', () => {
    render(<DrawingHeader {...defaultProps} />)
    expect(screen.getByText('Player 1')).toBeInTheDocument()
  })

  it('renders timer', () => {
    render(<DrawingHeader {...defaultProps} />)
    expect(screen.getByText('60s')).toBeInTheDocument()
  })

  it('shows low time warning style', () => {
    render(<DrawingHeader {...defaultProps} timeLeft={5} />)
    const timer = screen.getByText('5s')
    expect(timer.className).toContain('text-red-500')
  })

  it('shows medium time style', () => {
    render(<DrawingHeader {...defaultProps} timeLeft={15} />)
    const timer = screen.getByText('15s')
    expect(timer.className).toContain('text-yellow-500')
  })

  it('shows word when showWord is true', () => {
    render(<DrawingHeader {...defaultProps} />)
    expect(screen.getByText('🍕 Pizza')).toBeInTheDocument()
  })

  it('hides word when showWord is false', () => {
    render(<DrawingHeader {...defaultProps} showWord={false} />)
    expect(screen.getByText('❓ ???')).toBeInTheDocument()
  })

  it('shows letter in letter mode', () => {
    render(
      <DrawingHeader
        {...defaultProps}
        gameType="letter"
        currentLetter="A"
        showWord={true}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows creative prompt in creative mode', () => {
    render(
      <DrawingHeader
        {...defaultProps}
        gameType="creative"
        creativePrompt="A flying elephant"
        showWord={true}
      />
    )
    expect(screen.getByText('A flying elephant')).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', () => {
    render(<DrawingHeader {...defaultProps} />)
    const backButton = screen.getByLabelText('Back')
    fireEvent.click(backButton)
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })
})
