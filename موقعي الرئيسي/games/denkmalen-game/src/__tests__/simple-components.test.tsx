import { render, screen } from '@testing-library/react'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { JsonLd } from '@/components/JsonLd'
import { CountdownTimer } from '@/components/CountdownTimer'
import { DrawingTimer } from '@/components/DrawingTimer'
import { Confetti } from '@/components/Confetti'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaExclamationTriangle: () => <span>⚠️</span>,
  FaRedo: () => <span>🔄</span>,
}))

// Mock useGameStore
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(() => ({
    settings: { language: 'en' },
  })),
}))

describe('Simple Components', () => {
  it('renders PlayerAvatar', () => {
    render(<PlayerAvatar avatar="🎨" size="md" />)
    expect(screen.getByText('🎨')).toBeInTheDocument()
  })

  it('renders PlayerAvatar with different sizes', () => {
    const { rerender } = render(<PlayerAvatar avatar="🎨" size="sm" />)
    expect(screen.getByText('🎨')).toBeInTheDocument()
    
    rerender(<PlayerAvatar avatar="🎭" size="lg" />)
    expect(screen.getByText('🎭')).toBeInTheDocument()
  })

  it('renders JsonLd', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Denkmalen',
    }
    render(<JsonLd data={data} />)
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
  })

  it('renders CountdownTimer', () => {
    render(<CountdownTimer timeLeft={10} totalTime={60} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders CountdownTimer with low time', () => {
    render(<CountdownTimer timeLeft={3} totalTime={60} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders DrawingTimer', () => {
    render(<DrawingTimer timeLeft={60} totalTime={60} />)
    expect(screen.getByText('60')).toBeInTheDocument()
  })

  it('renders DrawingTimer with low time', () => {
    render(<DrawingTimer timeLeft={5} totalTime={60} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders Confetti', () => {
    render(<Confetti />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders Confetti with custom count', () => {
    render(<Confetti count={50} />)
    expect(document.body).toBeInTheDocument()
  })
})
