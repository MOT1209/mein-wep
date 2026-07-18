import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders without text', () => {
    const { container } = render(<LoadingSpinner />)
    // Should render without errors - look for the border class
    const spinner = container.querySelector('[class*="border-4"]')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const spinner = container.querySelector('.w-8')
    expect(spinner).toBeInTheDocument()
  })

  it('renders medium size', () => {
    const { container } = render(<LoadingSpinner size="md" />)
    const spinner = container.querySelector('.w-12')
    expect(spinner).toBeInTheDocument()
  })

  it('renders large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('.w-16')
    expect(spinner).toBeInTheDocument()
  })
})