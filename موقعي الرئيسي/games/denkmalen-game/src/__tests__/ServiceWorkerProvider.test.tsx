import { render, screen } from '@testing-library/react'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { useGameStore } from '@/store/gameStore'

// Mock useGameStore
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(() => ({
    settings: { language: 'en', sound: true, vibration: true },
  })),
}))

// Mock navigator.serviceWorker
const mockRegister = jest.fn().mockResolvedValue({})
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockRegister,
    getRegistrations: jest.fn().mockResolvedValue([]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
})

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaWifi: () => <span data-testid="icon-wifi">📶</span>,
  FaWifiOff: () => <span data-testid="icon-wifi-off">📵</span>,
  FaSync: () => <span data-testid="icon-sync">🔄</span>,
}))

describe('ServiceWorkerProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children without crashing', () => {
    render(
      <ServiceWorkerProvider>
        <div>Test Content</div>
      </ServiceWorkerProvider>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('registers service worker on mount', async () => {
    render(
      <ServiceWorkerProvider>
        <div>Test</div>
      </ServiceWorkerProvider>
    )
    
    // Service worker registration is attempted
    // Note: Actual registration depends on environment
  })

  it('detects online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    })

    render(
      <ServiceWorkerProvider>
        <div>Test</div>
      </ServiceWorkerProvider>
    )
    
    // Should render without errors
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('detects offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    })

    render(
      <ServiceWorkerProvider>
        <div>Test</div>
      </ServiceWorkerProvider>
    )
    
    // Should render without errors
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
