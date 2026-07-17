import { render, screen, fireEvent } from '@testing-library/react'
import { AuthWidget } from '@/components/AuthWidget'
import { useAuth } from '@/components/AuthProvider'
import { useGame } from '@/components/GameProvider'

jest.mock('@/components/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/GameProvider', () => ({
  useGame: jest.fn(),
}))

const mockUseAuth = useAuth as jest.Mock
const mockUseGame = useGame as jest.Mock

describe('AuthWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGame.mockReturnValue({ playSound: jest.fn() })
  })

  it('renders nothing actionable while the session is still loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, signIn: jest.fn(), signOut: jest.fn() })
    render(<AuthWidget />)

    expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument()
  })

  it('shows a Sign in with Google button when signed out, and calls signIn on click', () => {
    const signIn = jest.fn()
    mockUseAuth.mockReturnValue({ user: null, loading: false, signIn, signOut: jest.fn() })
    render(<AuthWidget />)

    const button = screen.getByText('Sign in with Google')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(signIn).toHaveBeenCalled()
  })

  it('shows the account name and a sign-out control when signed in', () => {
    const signOut = jest.fn()
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'player@example.com', user_metadata: { full_name: 'Rashid' } },
      loading: false,
      signIn: jest.fn(),
      signOut,
    })
    render(<AuthWidget />)

    expect(screen.getByText('Rashid')).toBeInTheDocument()
    expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Sign out'))
    expect(signOut).toHaveBeenCalled()
  })

  it('falls back to the email when no display name is set', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'player@example.com', user_metadata: {} },
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })
    render(<AuthWidget />)

    expect(screen.getByText('player@example.com')).toBeInTheDocument()
  })
})
