'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useGameStore } from '@/store/gameStore'
import { t } from '@/lib/i18n'

interface AccessibilityContextType {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersDarkMode: boolean
  isScreenReader: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  prefersReducedMotion: false,
  prefersHighContrast: false,
  prefersDarkMode: false,
  isScreenReader: false,
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

interface Props {
  children: ReactNode
}

export function AccessibilityProvider({ children }: Props) {
  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Check for high contrast preference
    const highContrast = window.matchMedia('(prefers-contrast: high)')
    
    // Check for dark mode preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    
    // Check for screen reader (simplified check)
    const isScreenReader = 
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      document.querySelector('[aria-live]') !== null

    // Apply reduced motion class to document
    if (reducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion')
    }

    // Listen for changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches)
    }

    reducedMotion.addEventListener('change', handleReducedMotionChange)

    return () => {
      reducedMotion.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  const value: AccessibilityContextType = {
    prefersReducedMotion: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false,
    prefersHighContrast: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-contrast: high)').matches 
      : false,
    prefersDarkMode: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false,
    isScreenReader: typeof navigator !== 'undefined'
      ? navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver')
      : false,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Skip to main content link for keyboard navigation
 */
export function SkipToContent() {
  const lang = useGameStore((s) => s.settings.language)
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 bg-primary-500 text-white px-4 py-2 rounded-lg z-50"
    >
      {t('a11y.skipToContent', lang)}
    </a>
  )
}

/**
 * Visually hidden text for screen readers
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}