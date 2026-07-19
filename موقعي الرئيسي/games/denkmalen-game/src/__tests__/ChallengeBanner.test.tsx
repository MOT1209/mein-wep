import { render, screen, fireEvent } from '@testing-library/react'
import { ActiveChallenge, ChallengeSelection } from '@/components/ChallengeBanner'
import { useGameStore } from '@/store/gameStore'

// Mock useGameStore
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(() => ({
    settings: { language: 'en' },
  })),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('ActiveChallenge', () => {
  const mockChallenge = {
    id: 'no-eraser',
    name: 'No Eraser',
    description: 'Draw without erasing',
    icon: '🚫',
    difficulty: 2,
    category: 'restrictive' as const,
    bonusPoints: 150,
    apply: jest.fn(),
    check: jest.fn(),
  }

  it('renders compact challenge display', () => {
    render(
      <ActiveChallenge
        challenge={mockChallenge}
      />
    )
    
    expect(screen.getByText('No Eraser')).toBeInTheDocument()
    expect(screen.getByText('🚫')).toBeInTheDocument()
  })

  it('shows completed state', () => {
    render(
      <ActiveChallenge
        challenge={mockChallenge}
        completed={true}
      />
    )
    
    expect(screen.getByText('No Eraser')).toBeInTheDocument()
  })
})

describe('ChallengeSelection', () => {
  const mockChallenges = [
    {
      id: 'speed',
      name: 'Speed Demon',
      description: 'Draw quickly',
      icon: '⚡',
      difficulty: 1,
      category: 'difficulty' as const,
      bonusPoints: 100,
      apply: jest.fn(),
      check: jest.fn(),
    },
    {
      id: 'no-eraser',
      name: 'No Eraser',
      description: 'No erasing allowed',
      icon: '🚫',
      difficulty: 4,
      category: 'restrictive' as const,
      bonusPoints: 200,
      apply: jest.fn(),
      check: jest.fn(),
    },
  ]

  it('renders list of challenges', () => {
    render(
      <ChallengeSelection
        challenges={mockChallenges}
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />
    )
    
    expect(screen.getByText('Speed Demon')).toBeInTheDocument()
    expect(screen.getByText('No Eraser')).toBeInTheDocument()
  })

  it('calls onSelect when challenge clicked', () => {
    const onSelect = jest.fn()
    
    render(
      <ChallengeSelection
        challenges={mockChallenges}
        onSelect={onSelect}
        onClose={jest.fn()}
      />
    )
    
    const challengeButton = screen.getByText('Speed Demon').closest('button')
    fireEvent.click(challengeButton!)
    
    // onSelect receives the full challenge object
    expect(onSelect).toHaveBeenCalledWith(mockChallenges[0])
  })
})
