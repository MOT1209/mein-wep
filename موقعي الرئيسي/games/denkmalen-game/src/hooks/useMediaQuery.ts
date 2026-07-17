'use client'

import { useState, useEffect } from 'react'

/**
 * Hook for responsive design - detects media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// Pre-defined breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 640px)')
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
export const useIsSmallScreen = () => useMediaQuery('(max-width: 768px)')

// Touch detection
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)')

// Reduced motion
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

// Dark mode
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')