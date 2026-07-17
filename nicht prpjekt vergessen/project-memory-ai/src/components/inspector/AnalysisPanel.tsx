'use client'

import { useState } from 'react'
import { ShieldAlert, Zap, BrainCircuit, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { AuditReport, AuditIssue } from '@/types/audit'

type Tab = 'security' | 'performance' | 'logic'

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low:      'bg-slate-500/20 text-slate-400 border-slate-500/40',
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold" fontFamily="monospace">{score}</text>
      </svg>
      <span className="text-[10px] text-slate-500 font-mono">Health Score</span>
    </div>
  )
}

function IssueCard({ issue }: { issue: AuditIssue }) {
  const [open, setOpen] = useState(false)
  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.low
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-2 p-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${style}`}>
          {issue.severity.toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-200 font-mono truncate">{issue.title}</p>
          {issue.line && <p className="text-[10px] text-slate-600 mt-0.5">Line {issue.line}</p>}
        </div>
        <span className="text-slate-600 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-2">
          <p className="text-[11px] text-slate-400 leading-relaxed">{issue.description}</p>
          {issue.fix && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2">
              <p className="text-[10px] text-emerald-400 font-semibold mb-1">FIX:</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{issue.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AnalysisPanel({ report, loading, error }: {
  report: AuditReport | null
  loading: boolean
  error: string | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>('security')

  const tabs = [
    { id: 'security' as Tab,    label: 'Security',     icon: ShieldAlert,  count: report?.security.length    },
    { id: 'performance' as Tab, label: 'Perf',         icon: Zap,          count: report?.performance.length },
    { id: 'logic' as Tab,       label: 'Logic',        icon: BrainCircuit, count: report?.logic.length       },
  ]

  const issues = report ? report[activeTab] : []

  return (
    <aside className="w-80 border-l border-white/10 bg-slate-900/60 flex flex-col shrink-0">

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Analysis Terminal</span>
        {report && <CheckCircle2 size={13} className="text-emerald-400" />}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="text-purple-400 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Gemini is analyzing...</p>
          <div className="flex gap-1 mt-1">
            {['Security', 'Performance', 'Logic'].map((l, i) => (
              <span key={i} className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{l}</span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <AlertTriangle size={28} className="text-red-400" />
          <p className="text-xs text-red-400 font-mono text-center">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !report && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <ShieldAlert size={28} className="text-slate-700" />
          <p className="text-xs text-slate-600 font-mono text-center">Paste code and click<br />"Analyze" to audit</p>
        </div>
      )}

      {/* Report */}
      {!loading && !error && report && (
        <>
          {/* Score + Summary */}
          <div className="p-4 border-b border-white/10 flex gap-4 items-center">
            <ScoreRing score={report.score} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 mb-1">{report.language}</p>
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">{report.summary}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-mono transition-colors border-b-2
                  ${activeTab === id
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Icon size={13} />
                <span>{label}</span>
                {count !== undefined && (
                  <span className={`text-[9px] px-1.5 rounded-full ${count > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Issues */}
          <div className="flex-1 overflow-y-auto p-3">
            {issues.length === 0
              ? <div className="flex items-center justify-center h-full text-xs text-emerald-400 font-mono gap-2">
                  <CheckCircle2 size={14} /> No issues found
                </div>
              : issues.map((issue, i) => <IssueCard key={i} issue={issue} />)
            }
          </div>
        </>
      )}
    </aside>
  )
}
