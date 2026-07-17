import { render, screen } from '@testing-library/react'
import { ScoreAnimation } from '@/components/ScoreAnimation'

describe('ScoreAnimation', () => {
  it('renders score', () => {
    render(<ScoreAnimation score={85} />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('renders high score with emoji', () => {
    render(<ScoreAnimation score={95} />)
    expect(screen.getByText('95')).toBeInTheDocument()
    expect(screen.getByText('🌟')).toBeInTheDocument()
  })

  it('renders medium score with emoji', () => {
    render(<ScoreAnimation score={70} />)
    expect(screen.getByText('70')).toBeInTheDocument()
    expect(screen.getByText('👍')).toBeInTheDocument()
  })

  it('renders low score with emoji', () => {
    render(<ScoreAnimation score={30} />)
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('💪')).toBeInTheDocument()
  })

  it('renders small size', () => {
    const { container } = render(<ScoreAnimation score={85} size="sm" />)
    const score = container.querySelector('.text-2xl')
    expect(score).toBeInTheDocument()
  })

  it('renders medium size', () => {
    const { container } = render(<ScoreAnimation score={85} size="md" />)
    const score = container.querySelector('.text-4xl')
    expect(score).toBeInTheDocument()
  })

  it('renders large size', () => {
    const { container } = render(<ScoreAnimation score={85} size="lg" />)
    const score = container.querySelector('.text-6xl')
    expect(score).toBeInTheDocument()
  })
})