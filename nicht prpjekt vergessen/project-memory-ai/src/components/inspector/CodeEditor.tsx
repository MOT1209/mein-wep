'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FileCode, ShieldCheck, Save, RotateCcw, Loader2 } from 'lucide-react'
import { ProjectFile } from '@/store/workspace-store'

interface Props {
  file: ProjectFile | null
  onAudit: (code: string, filename: string) => void
  isLoading?: boolean
}

export function CodeEditor({ file, onAudit, isLoading = false }: Props) {
  const [code, setCode] = useState('')
  const [original, setOriginal] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (file) {
      setCode(file.content)
      setOriginal(file.content)
    }
  }, [file])

  const lineCount = code.split('\n').length

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = code.substring(0, start) + '  ' + code.substring(end)
      setCode(next)
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2 }, 0)
    }
  }

  const syncScroll = () => {
    if (textareaRef.current && lineRef.current) {
      lineRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center bg-slate-950/40">
        <FileCode size={48} className="text-slate-800 mb-4" />
        <p className="text-[10px] font-mono text-slate-700 tracking-widest uppercase">
          Upload a project and select a file
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-10 shrink-0 bg-slate-900/50 border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-purple-400" />
          <span className="text-xs font-mono text-slate-300">{file.path}</span>
          {code !== original && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAudit(code, file.name)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold transition-all border
              ${isLoading
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            {isLoading ? 'ANALYZING...' : 'SCAN WITH GEMINI'}
          </button>
          <button
            onClick={() => setCode(original)}
            className="p-1.5 hover:bg-white/5 text-slate-600 hover:text-slate-300 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="p-1.5 hover:bg-white/5 text-slate-600 hover:text-slate-300 rounded-lg transition-colors"
            title="Copy"
          >
            <Save size={13} />
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 flex overflow-hidden bg-slate-950 relative">
        {/* Line numbers */}
        <div
          ref={lineRef}
          className="select-none text-right text-[11px] font-mono text-slate-800 py-4 pr-3 pl-3 overflow-hidden w-12 shrink-0 border-r border-white/5"
          style={{ lineHeight: '1.625rem' }}
        >
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleTab}
          onScroll={syncScroll}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-300 text-xs font-mono p-4 pl-3 outline-none resize-none"
          style={{ lineHeight: '1.625rem', tabSize: 2 }}
        />
      </div>

      {/* Status bar */}
      <div className="h-7 border-t border-white/5 bg-slate-900/60 flex items-center px-4 gap-4 text-[10px] font-mono text-slate-600 shrink-0">
        <span className="truncate max-w-[200px]">{file.name}</span>
        <span>Lines: {lineCount}</span>
        <span>Chars: {code.length}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Gemini Ready
        </span>
      </div>
    </div>
  )
}
