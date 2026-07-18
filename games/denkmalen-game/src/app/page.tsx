'use client'

import { useGameStore } from '@/store/gameStore'
import { MainMenu } from '@/components/MainMenu'
import { OfflineSetup } from '@/components/OfflineSetup'
import { OnlineLobby } from '@/components/OnlineLobby'
import { DrawingScreen } from '@/components/DrawingScreen'
import { VotingScreen } from '@/components/VotingScreen'
import { ResultsScreen } from '@/components/ResultsScreen'
import { Leaderboard } from '@/components/Leaderboard'
import { SettingsScreen } from '@/components/SettingsScreen'
import { StatsScreen } from '@/components/StatsScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SkipToContent } from '@/components/AccessibilityProvider'
import { AnimatePresence } from 'framer-motion'

export default function Home() {
  const { phase } = useGameStore()
  
  const renderPhase = () => {
    switch (phase) {
      case 'menu':
        return <MainMenu key="menu" />
      case 'setup':
        return <OfflineSetup key="setup" />
      case 'lobby':
        return <OnlineLobby key="lobby" />
      case 'playing':
      case 'drawing':
        return <DrawingScreen key="drawing" />
      case 'voting':
        return <VotingScreen key="voting" />
      case 'results':
        return <ResultsScreen key="results" />
      case 'leaderboard':
        return <Leaderboard key="leaderboard" />
      case 'stats':
        return <StatsScreen key="stats" />
      case 'settings':
        return <SettingsScreen key="settings" />
      default:
        return <MainMenu key="menu" />
    }
  }

  return (
    <ErrorBoundary>
      <SkipToContent />
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <AnimatePresence mode="wait">
          {renderPhase()}
        </AnimatePresence>
      </main>
    </ErrorBoundary>
  )
}
