import { renderHook, act } from '@testing-library/react'
import { useHaptic } from '@/hooks/useHaptic'
import { useLongPress } from '@/hooks/useLongPress'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Mock navigator.vibrate
const mockVibrate = jest.fn()
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
})

describe('useHaptic', () => {
  beforeEach(() => {
    mockVibrate.mockClear()
  })

  it('should return haptic feedback functions', () => {
    const { result } = renderHook(() => useHaptic())
    expect(result.current).toHaveProperty('tap')
    expect(result.current).toHaveProperty('impact')
    expect(result.current).toHaveProperty('heavyImpact')
    expect(result.current).toHaveProperty('success')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('warning')
    expect(result.current).toHaveProperty('selection')
  })

  it('should call vibrate for tap', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.tap()
    })
    expect(mockVibrate).toHaveBeenCalledWith(10)
  })

  it('should call vibrate for impact', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.impact()
    })
    expect(mockVibrate).toHaveBeenCalledWith(20)
  })

  it('should call vibrate for heavyImpact', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.heavyImpact()
    })
    expect(mockVibrate).toHaveBeenCalledWith(30)
  })

  it('should call vibrate for success', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.success()
    })
    expect(mockVibrate).toHaveBeenCalledWith([10, 50, 20])
  })

  it('should call vibrate for error', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.error()
    })
    expect(mockVibrate).toHaveBeenCalledWith([30, 50, 30, 50, 30])
  })

  it('should call vibrate for warning', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.warning()
    })
    expect(mockVibrate).toHaveBeenCalledWith([20, 30, 20])
  })

  it('should call vibrate for selection', () => {
    const { result } = renderHook(() => useHaptic())
    act(() => {
      result.current.selection()
    })
    expect(mockVibrate).toHaveBeenCalledWith(5)
  })
})

describe('useLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return mouse/touch handlers', () => {
    const { result } = renderHook(() => 
      useLongPress({ onLongPress: jest.fn() })
    )
    expect(result.current).toHaveProperty('onMouseDown')
    expect(result.current).toHaveProperty('onMouseUp')
    expect(result.current).toHaveProperty('onMouseLeave')
    expect(result.current).toHaveProperty('onTouchStart')
    expect(result.current).toHaveProperty('onTouchEnd')
  })

  it('should call onLongPress after delay', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => 
      useLongPress({ onLongPress, delay: 500 })
    )

    act(() => {
      result.current.onMouseDown({} as any)
    })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onLongPress).toHaveBeenCalled()
  })

  it('should not call onLongPress if released before delay', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => 
      useLongPress({ onLongPress, delay: 500 })
    )

    act(() => {
      result.current.onMouseDown({} as any)
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    act(() => {
      result.current.onMouseUp({} as any)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('should call onClick on short press', () => {
    const onClick = jest.fn()
    const onLongPress = jest.fn()
    const { result } = renderHook(() => 
      useLongPress({ onLongPress, onClick, delay: 500 })
    )

    act(() => {
      result.current.onMouseDown({} as any)
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    act(() => {
      result.current.onMouseUp({} as any)
    })

    expect(onClick).toHaveBeenCalled()
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('should cancel on mouse leave', () => {
    const onLongPress = jest.fn()
    const { result } = renderHook(() => 
      useLongPress({ onLongPress, delay: 500 })
    )

    act(() => {
      result.current.onMouseDown({} as any)
    })

    act(() => {
      result.current.onMouseLeave()
    })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })
})

describe('useMediaQuery', () => {
  it('should return false for non-matching query', () => {
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

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should return true for matching query', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })
})
