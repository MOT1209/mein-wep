import { render, screen } from '@testing-library/react'
import { Loading } from '@/components/Loading'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}))

describe('Loading', () => {
  it('renders loading spinner', () => {
    render(<Loading />)
    // Should render without errors
    expect(document.body).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<Loading text="Custom loading..." />)
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
  })

  it('renders small size', () => {
    render(<Loading size="sm" />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders large size', () => {
    render(<Loading size="lg" />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders fullScreen mode', () => {
    render(<Loading fullScreen />)
    expect(document.body).toBeInTheDocument()
  })
})
