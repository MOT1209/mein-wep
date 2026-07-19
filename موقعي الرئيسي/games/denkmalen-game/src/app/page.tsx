'use client'

import { useGameStore } from '@/store/gameStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SkipToContent } from '@/components/AccessibilityProvider'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// Dynamic imports for heavy components (code splitting)
const MainMenu = dynamic(
  () => import('@/components/MainMenu').then(mod => ({ default: mod.MainMenu })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const OfflineSetup = dynamic(
  () => import('@/components/OfflineSetup').then(mod => ({ default: mod.OfflineSetup })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const OnlineLobby = dynamic(
  () => import('@/components/OnlineLobby').then(mod => ({ default: mod.OnlineLobby })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const DrawingScreen = dynamic(
  () => import('@/components/DrawingScreen').then(mod => ({ default: mod.DrawingScreen })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const VotingScreen = dynamic(
  () => import('@/components/VotingScreen').then(mod => ({ default: mod.VotingScreen })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const ResultsScreen = dynamic(
  () => import('@/components/ResultsScreen').then(mod => ({ default: mod.ResultsScreen })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const Leaderboard = dynamic(
  () => import('@/components/Leaderboard').then(mod => ({ default: mod.Leaderboard })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const StatsScreen = dynamic(
  () => import('@/components/StatsScreen').then(mod => ({ default: mod.StatsScreen })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const SettingsScreen = dynamic(
  () => import('@/components/SettingsScreen').then(mod => ({ default: mod.SettingsScreen })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

const PluginManager = dynamic(
  () => import('@/components/PluginManager').then(mod => ({ default: mod.PluginManager })),
  { loading: () => <LoadingSpinner />, ssr: false }
)

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
      case 'plugins':
        return <PluginManager key="plugins" />
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
