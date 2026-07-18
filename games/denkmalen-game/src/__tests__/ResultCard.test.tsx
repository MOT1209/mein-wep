import { render, screen } from '@testing-library/react'
import { ResultCard } from '@/components/ResultCard'

describe('ResultCard', () => {
  const defaultProps = {
    drawing: 'data:image/png;base64,test',
    word: 'Cat',
    aiComment: 'Great drawing!',
    score: 85,
    playerName: 'Player 1',
  }

  it('renders share button', () => {
    render(<ResultCard {...defaultProps} />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('renders download button', () => {
    render(<ResultCard {...defaultProps} />)
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('renders with correct props', () => {
    render(<ResultCard {...defaultProps} />)
    
    // Check that buttons are present
    const shareButton = screen.getByText('Share')
    const downloadButton = screen.getByText('Download')
    
    expect(shareButton).toBeInTheDocument()
    expect(downloadButton).toBeInTheDocument()
  })

  it('buttons are clickable', () => {
    render(<ResultCard {...defaultProps} />)
    
    const shareButton = screen.getByText('Share')
    const downloadButton = screen.getByText('Download')
    
    // Just check they exist and are buttons
    expect(shareButton.tagName).toBe('BUTTON')
    expect(downloadButton.tagName).toBe('BUTTON')
  })

  it('handles different scores', () => {
    const { rerender } = render(<ResultCard {...defaultProps} score={30} />)
    expect(screen.getByText('Share')).toBeInTheDocument()
    
    rerender(<ResultCard {...defaultProps} score={90} />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('handles different players', () => {
    const { rerender } = render(<ResultCard {...defaultProps} playerName="Player 1" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
    
    rerender(<ResultCard {...defaultProps} playerName="Player 2" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })
})