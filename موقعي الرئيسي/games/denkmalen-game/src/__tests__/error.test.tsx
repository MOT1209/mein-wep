import { render, screen, fireEvent } from '@testing-library/react'
import ErrorPage from '@/app/error'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

describe('Error Page', () => {
  const mockReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders error message', () => {
    const error = new Error('Test error message')
    render(<ErrorPage error={error} reset={mockReset} />)
    
    expect(screen.getByText(/oops/i)).toBeInTheDocument()
  })

  it('renders error details in development', () => {
    const error = new Error('Test error')
    render(<ErrorPage error={error} reset={mockReset} />)
    
    // Should show some error info
    expect(screen.getByText(/oops/i)).toBeInTheDocument()
  })

  it('calls reset when try again button clicked', () => {
    const error = new Error('Test error')
    render(<ErrorPage error={error} reset={mockReset} />)
    
    const tryAgainButton = screen.getByText(/try again/i)
    fireEvent.click(tryAgainButton)
    
    expect(mockReset).toHaveBeenCalled()
  })
})
