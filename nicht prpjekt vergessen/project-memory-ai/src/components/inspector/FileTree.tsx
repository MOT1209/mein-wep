'use client'

import React from 'react'
import { useWorkspace, ProjectFile } from '@/store/workspace-store'
import { FolderPlus, Trash2, FolderOpen, FileCode } from 'lucide-react'

export function FileTree({ onFileSelect, selectedFile }: {
  onFileSelect: (f: ProjectFile) => void
  selectedFile: ProjectFile | null
}) {
  const { files, setFiles, clearProject, t } = useWorkspace()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files
    if (!uploaded) return

    const newFiles: ProjectFile[] = []
    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i]
      try {
        const text = await file.text()
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          path: (file as any).webkitRelativePath || file.name,
          content: text,
          type: 'file',
        })
      } catch {
        // skip binary files
      }
    }
    setFiles(newFiles)
    e.target.value = ''
  }

  return (
    <div className="h-full flex flex-col bg-slate-950/20">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/40">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <FolderOpen size={12} />
          {t('explorer')}
        </h3>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/10 text-white">
            <FolderPlus size={12} />
            {t('upload')}
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
          <button 
            onClick={clearProject}
            className="w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg border border-white/5 transition-all text-slate-400"
            title={t('clear')}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-2">
        {files.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center px-4">
            <FolderOpen size={32} className="text-slate-800 mb-3" />
            <p className="text-[10px] text-slate-700 font-mono leading-relaxed">
              {t('ar') === 'ar' ? 'لم يتم تحميل أي مشروع بعد.' : 'NO PROJECT LOADED.'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-all group
                  ${selectedFile?.id === file.id 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <FileCode size={14} className={selectedFile?.id === file.id ? 'text-purple-400' : 'text-slate-600'} />
                <span className="truncate flex-1 text-left rtl:text-right">{file.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
