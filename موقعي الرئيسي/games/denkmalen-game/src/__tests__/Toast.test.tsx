import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/Toast'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaCheck: () => <span data-testid="icon-check">✓</span>,
  FaTimes: () => <span data-testid="icon-times">✗</span>,
  FaExclamationTriangle: () => <span data-testid="icon-warning">⚠</span>,
  FaInfoCircle: () => <span data-testid="icon-info">ℹ</span>,
}))

function TestComponent() {
  const { showToast } = useToast()
  
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info
      </button>
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders without crashing', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    expect(screen.getByText('Show Success')).toBeInTheDocument()
  })

  it('shows toast when showToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Success'))
    
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('shows different toast types', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Success'))
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Show Error'))
    expect(screen.getByText('Error message')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Show Warning'))
    expect(screen.getByText('Warning message')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Show Info'))
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('auto-hides toast after duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Success'))
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })

  it('hides toast when close button clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    
    fireEvent.click(screen.getByText('Show Success'))
    expect(screen.getByText('Success message')).toBeInTheDocument()
    
    const closeButton = screen.getAllByTestId('icon-times')[0].closest('button')
    fireEvent.click(closeButton!)
    
    expect(screen.queryByText('Success message')).not.toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws error when used outside ToastProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    function TestComponent() {
      useToast()
      return null
    }
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within ToastProvider')
    
    consoleSpy.mockRestore()
  })
})
