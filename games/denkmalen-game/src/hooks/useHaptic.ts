'use client'

import { useCallback } from 'react'

/**
 * Haptic Feedback Hook for mobile devices
 * Uses Vibration API for tactile feedback
 */
export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  /** Light tap feedback */
  const tap = useCallback(() => {
    vibrate(10)
  }, [vibrate])

  /** Medium impact feedback */
  const impact = useCallback(() => {
    vibrate(20)
  }, [vibrate])

  /** Heavy impact feedback */
  const heavyImpact = useCallback(() => {
    vibrate(30)
  }, [vibrate])

  /** Success feedback pattern */
  const success = useCallback(() => {
    vibrate([10, 50, 20])
  }, [vibrate])

  /** Error feedback pattern */
  const error = useCallback(() => {
    vibrate([30, 50, 30, 50, 30])
  }, [vibrate])

  /** Warning feedback pattern */
  const warning = useCallback(() => {
    vibrate([20, 30, 20])
  }, [vibrate])

  /** Selection changed feedback */
  const selection = useCallback(() => {
    vibrate(5)
  }, [vibrate])

  return {
    tap,
    impact,
    heavyImpact,
    success,
    error,
    warning,
    selection,
  }
}