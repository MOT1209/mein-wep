import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    document.documentElement.classList.remove('dark')
  })

  it('provides theme context', () => {
    let themeContext: any
    
    function TestComponent() {
      themeContext = useTheme()
      return null
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(themeContext).toBeDefined()
    expect(themeContext.theme).toBe('system')
    expect(themeContext.resolvedTheme).toBe('light')
  })

  it('applies dark class to document for dark theme', () => {
    // Mock matchMedia to return dark preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )
    
    // With system theme and dark preference, dark class should be applied
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class for light theme', () => {
    // Mock matchMedia to return light preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )
    
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme updates theme and saves to localStorage', () => {
    let themeContext: any
    
    function TestComponent() {
      themeContext = useTheme()
      return null
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    themeContext.setTheme('dark')
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('loads theme from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    let themeContext: any
    
    function TestComponent() {
      themeContext = useTheme()
      return null
    }
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(themeContext.theme).toBe('dark')
  })
})
