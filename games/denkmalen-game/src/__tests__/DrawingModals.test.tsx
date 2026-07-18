import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPickerModal, BrushSizeModal, ClearCanvasModal } from '@/components/drawing/DrawingModals'

describe('ColorPickerModal', () => {
  const defaultProps = {
    isOpen: true,
    currentColor: '#000000',
    lang: 'en' as const,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders when open', () => {
    render(<ColorPickerModal {...defaultProps} />)
    expect(screen.getByText('Select Color')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ColorPickerModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Select Color')).not.toBeInTheDocument()
  })

  it('shows color swatches', () => {
    render(<ColorPickerModal {...defaultProps} />)
    const swatches = screen.getAllByRole('button')
    // 30 colors + close (from backdrop click area)
    expect(swatches.length).toBeGreaterThanOrEqual(30)
  })

  it('calls onSelect when color clicked', () => {
    render(<ColorPickerModal {...defaultProps} />)
    const buttons = screen.getAllByRole('button')
    // Find the red color button (has backgroundColor style)
    const redButton = buttons.find(b => b.getAttribute('style')?.includes('rgb(255, 0, 0)'))
    expect(redButton).toBeInTheDocument()
    fireEvent.click(redButton!)
    expect(defaultProps.onSelect).toHaveBeenCalled()
  })
})

describe('BrushSizeModal', () => {
  const defaultProps = {
    isOpen: true,
    currentSize: 4,
    lang: 'en' as const,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders when open', () => {
    render(<BrushSizeModal {...defaultProps} />)
    expect(screen.getByText('Brush Size')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<BrushSizeModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Brush Size')).not.toBeInTheDocument()
  })

  it('shows all brush sizes', () => {
    render(<BrushSizeModal {...defaultProps} />)
    expect(screen.getByText('2px')).toBeInTheDocument()
    expect(screen.getByText('4px')).toBeInTheDocument()
    expect(screen.getByText('8px')).toBeInTheDocument()
    expect(screen.getByText('12px')).toBeInTheDocument()
    expect(screen.getByText('20px')).toBeInTheDocument()
    expect(screen.getByText('30px')).toBeInTheDocument()
  })

  it('calls onSelect when size clicked', () => {
    render(<BrushSizeModal {...defaultProps} />)
    fireEvent.click(screen.getByText('8px'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith(8)
  })
})

describe('ClearCanvasModal', () => {
  const defaultProps = {
    isOpen: true,
    lang: 'en' as const,
    onConfirm: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders when open', () => {
    render(<ClearCanvasModal {...defaultProps} />)
    expect(screen.getByText('Clear Canvas?')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ClearCanvasModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Clear Canvas?')).not.toBeInTheDocument()
  })

  it('shows warning message', () => {
    render(<ClearCanvasModal {...defaultProps} />)
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument()
  })

  it('has cancel and clear buttons', () => {
    render(<ClearCanvasModal {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('calls onConfirm when Clear clicked', () => {
    render(<ClearCanvasModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancel clicked', () => {
    render(<ClearCanvasModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})
