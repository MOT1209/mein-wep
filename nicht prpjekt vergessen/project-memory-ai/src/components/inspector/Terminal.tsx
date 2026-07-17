'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react'

interface TerminalProps {
  logs: string[]
  onClear: () => void
}

export function Terminal({ logs, onClear }: TerminalProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className={`
      flex flex-col bg-slate-950 border-t border-white/5 transition-all duration-300
      ${isMaximized ? 'fixed inset-0 z-[100] bg-slate-950' : 'h-48'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">System Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMaximized(!isMaximized)} className="text-slate-500 hover:text-white transition-colors">
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button onClick={onClear} className="text-slate-500 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Log Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-slate-700 italic">No system output. Waiting for audit...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3 mb-1 group">
              <span className="text-slate-600 select-none w-4">{i + 1}</span>
              <span className={`
                ${log.startsWith('>') ? 'text-emerald-400' : ''}
                ${log.includes('ERROR') ? 'text-red-400' : ''}
                ${log.includes('WARN') ? 'text-amber-400' : ''}
                ${log.includes('SUCCESS') ? 'text-cyan-400' : ''}
                text-slate-300
              `}>
                {log}
              </span>
            </div>
          ))
        )}
        <div className="flex gap-2 items-center text-emerald-400 mt-2">
          <span>alking@system:~#</span>
          <span className="w-2 h-4 bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
