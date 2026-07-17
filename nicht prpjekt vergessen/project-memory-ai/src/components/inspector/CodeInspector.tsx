'use client'

import React, { useState } from 'react'
import { FileTree } from './FileTree'
import { CodeEditor } from './CodeEditor'
import { AnalysisPanel } from './AnalysisPanel'
import { Terminal } from './Terminal'
import { AlKingAssistant } from './AlKingAssistant'
import { ProjectFile, useWorkspace } from '@/store/workspace-store'
import { AuditReport } from '@/types/audit'
import { BarChart3, Brain, Search } from 'lucide-react'

export function CodeInspector() {
  const { t, lang } = useWorkspace()
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rightTab, setRightTab] = useState<'audit' | 'agent'>('audit')
  const [logs, setLogs] = useState<string[]>([
    lang === 'ar' ? '> تم تشغيل محرك AlKing Security v2.0' : '> AlKing Security Engine v2.0 initialized',
    lang === 'ar' ? '> بانتظار رفع المشروع...' : '> Awaiting project upload...',
  ])

  const addLog = (msg: string) => setLogs(prev => [...prev, msg])

  const handleAudit = async (code: string, filename: string) => {
    setIsLoading(true)
    addLog(`> Starting audit for: ${filename}`)
    addLog('> Sending payload to Gemini 1.5 Flash...')

    try {
      const response = await fetch('/api/gemini/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Audit failed')
      setAuditReport(data)
      addLog(`> SUCCESS: Score ${data.score}/100`)
      addLog(`> Security issues found: ${data.security?.length ?? 0}`)
      addLog(`> Performance issues: ${data.performance?.length ?? 0}`)
      setRightTab('audit')
    } catch (err: any) {
      addLog(`> ERROR: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Controls bar */}
      <div className="h-11 border-b border-white/5 flex items-center justify-between px-4 bg-slate-900/30 shrink-0">
        <div className="flex items-center gap-2 bg-slate-950/50 border border-white/5 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all">
          <Search size={13} className="text-slate-600" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث في المشروع...' : 'Search in project...'}
            className="bg-transparent border-none outline-none text-[11px] w-44 text-slate-400 placeholder:text-slate-700"
          />
        </div>
        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-400 transition-all border border-white/5 tracking-widest uppercase">
          {lang === 'ar' ? 'تصدير التقرير' : 'EXPORT REPORT'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-60 border-r border-white/5 shrink-0 flex flex-col">
          <FileTree selectedFile={selectedFile} onFileSelect={setSelectedFile} />
        </div>

        {/* Center: Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden">
            <CodeEditor file={selectedFile} onAudit={handleAudit} isLoading={isLoading} />
          </div>
          <Terminal logs={logs} onClear={() => setLogs([])} />
        </div>

        {/* Right: Audit / Agent */}
        <div className="w-80 border-l border-white/5 shrink-0 flex flex-col bg-slate-900/20">
          {/* Tab switcher */}
          <div className="flex p-1 gap-1 border-b border-white/5 bg-slate-950/40">
            <TabBtn
              active={rightTab === 'audit'}
              onClick={() => setRightTab('audit')}
              icon={<BarChart3 size={12} />}
              label={t('audit')}
              color="purple"
            />
            <TabBtn
              active={rightTab === 'agent'}
              onClick={() => setRightTab('agent')}
              icon={<Brain size={12} />}
              label={t('agent')}
              color="cyan"
            />
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === 'audit'
              ? <AnalysisPanel report={auditReport} loading={isLoading} error={null} />
              : <AlKingAssistant />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label, color }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  color: 'purple' | 'cyan'
}) {
  const activeStyle = color === 'purple'
    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all border
        ${active ? activeStyle : 'border-transparent text-slate-500 hover:text-slate-300'}`}
    >
      {icon} {label}
    </button>
  )
}
