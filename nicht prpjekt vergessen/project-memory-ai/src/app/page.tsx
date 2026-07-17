'use client'

import { useWorkspace } from '@/store/workspace-store'
import dynamic from 'next/dynamic'

const Dashboard = dynamic(
  () => import('@/components/dashboard/Dashboard').then(mod => ({ default: mod.Dashboard })),
  {
    loading: () => <WorkspaceLoader label="Dashboard" color="purple" />,
    ssr: false
  }
)

const CodeInspector = dynamic(
  () => import('@/components/inspector/CodeInspector').then(mod => ({ default: mod.CodeInspector })),
  {
    loading: () => <WorkspaceLoader label="Code Inspector" color="purple" />,
    ssr: false
  }
)

const ContentStudio = dynamic(
  () => import('@/components/studio/ContentStudio').then(mod => ({ default: mod.ContentStudio })),
  {
    loading: () => <WorkspaceLoader label="Content Studio" color="cyan" />,
    ssr: false
  }
)

const SettingsView = dynamic(
  () => import('@/components/settings/SettingsView').then(mod => ({ default: mod.SettingsView })),
  {
    loading: () => <WorkspaceLoader label="Settings" color="purple" />,
    ssr: false
  }
)

export default function HomePage() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden">
      {activeWorkspace === 'dashboard' && <Dashboard />}
      {activeWorkspace === 'inspector' && <CodeInspector />}
      {activeWorkspace === 'studio' && <ContentStudio />}
      {activeWorkspace === 'settings' && <SettingsView />}
    </div>
  )
}

function WorkspaceLoader({ label, color }: { label: string; color: 'purple' | 'cyan' }) {
  const ring = color === 'purple' ? 'border-purple-500' : 'border-cyan-500'
  const text = color === 'purple' ? 'text-purple-400' : 'text-cyan-400'
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className={`w-10 h-10 rounded-full border-2 border-t-transparent ${ring} animate-spin`} />
      <p className={`text-sm font-mono ${text}`}>Loading {label}...</p>
    </div>
  )
}
