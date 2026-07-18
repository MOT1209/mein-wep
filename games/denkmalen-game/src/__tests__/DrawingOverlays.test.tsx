import { render, screen, fireEvent } from '@testing-library/react'
import { WarningOverlay, WaitingOverlay, WordRevealBanner } from '@/components/drawing/DrawingOverlays'

describe('WarningOverlay', () => {
  const defaultProps = {
    playerName: 'Ahmed',
    lang: 'en' as const,
    onReveal: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders player name', () => {
    render(<WarningOverlay {...defaultProps} />)
    expect(screen.getByText(/Ahmed/)).toBeInTheDocument()
  })

  it('renders reveal button', () => {
    render(<WarningOverlay {...defaultProps} />)
    expect(screen.getByText(/Reveal Word/)).toBeInTheDocument()
  })

  it('calls onReveal when button clicked', () => {
    render(<WarningOverlay {...defaultProps} />)
    fireEvent.click(screen.getByText(/Reveal Word/))
    expect(defaultProps.onReveal).toHaveBeenCalledTimes(1)
  })

  it('renders in Arabic', () => {
    render(<WarningOverlay {...defaultProps} lang="ar" />)
    expect(screen.getByText(/كشف الكلمة/)).toBeInTheDocument()
  })
})

describe('WaitingOverlay', () => {
  it('shows submitted count', () => {
    render(
      <WaitingOverlay lang="en" submittedCount={2} totalPlayers={4} />
    )
    expect(screen.getByText(/2\/4/)).toBeInTheDocument()
  })

  it('shows spinner', () => {
    const { container } = render(
      <WaitingOverlay lang="en" submittedCount={1} totalPlayers={3} />
    )
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})

describe('WordRevealBanner', () => {
  it('shows word in classic mode', () => {
    render(
      <WordRevealBanner
        gameType="classic"
        currentLetter={null}
        creativePrompt={null}
        wordEmoji="🍕"
        wordText="Pizza"
        lang="en"
      />
    )
    expect(screen.getByText('🍕 Pizza')).toBeInTheDocument()
  })

  it('shows letter in letter mode', () => {
    render(
      <WordRevealBanner
        gameType="letter"
        currentLetter="A"
        creativePrompt={null}
        wordEmoji=""
        wordText=""
        lang="en"
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows prompt in creative mode', () => {
    render(
      <WordRevealBanner
        gameType="creative"
        currentLetter={null}
        creativePrompt="A flying elephant"
        wordEmoji=""
        wordText=""
        lang="en"
      />
    )
    expect(screen.getByText('A flying elephant')).toBeInTheDocument()
  })
})
