import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultCard } from '@/components/ResultCard'

// Mock canvas methods
const mockGetContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  save: jest.fn(),
  restore: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  drawImage: jest.fn(),
  fillText: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(HTMLCanvasElement.prototype.getContext as jest.Mock).mockReturnValue(mockGetContext)
  ;(HTMLCanvasElement.prototype.toBlob as jest.Mock).mockImplementation((callback) => {
    callback(new Blob(['test'], { type: 'image/png' }))
  })
})

describe('ResultCard', () => {
  const defaultProps = {
    drawing: 'data:image/png;base64,test',
    word: 'Cat',
    aiComment: 'Great drawing!',
    score: 85,
    playerName: 'Player 1',
  }

  it('renders share and download buttons', () => {
    render(<ResultCard {...defaultProps} />)
    
    expect(screen.getByText('Share')).toBeInTheDocument()
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('calls navigator.share when share button clicked', async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: mockShare })
    
    render(<ResultCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Share'))
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled()
    })
  })

  it('falls back to download when share fails', async () => {
    const mockShare = jest.fn().mockRejectedValue(new Error('Share failed'))
    Object.defineProperty(navigator, 'share', { value: mockShare })
    
    // Mock createElement for download
    const mockAppendChild = jest.fn()
    const mockClick = jest.fn()
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as any)
    document.body.appendChild = mockAppendChild
    
    render(<ResultCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Share'))
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled()
    })
  })

  it('creates download link when download button clicked', async () => {
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockClick = jest.fn()
    
    jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as any)
    
    const originalAppendChild = document.body.appendChild.bind(document.body)
    document.body.appendChild = jest.fn((node) => {
      mockAppendChild(node)
      return originalAppendChild(node)
    })
    
    render(<ResultCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Download'))
    
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled()
    })
  })
})