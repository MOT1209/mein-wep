'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { Wand2, Download, Image as ImageIcon, Video, Sparkles } from 'lucide-react'

interface OpenRouterGeneratorProps {
  type: 'image' | 'video'
  onGenerated: (url: string, model: string) => void
}

type OpenRouterModel = 'gemma-4-27b-at' | 'gemma-4-27b' | 'claude-3.5-sonnet' | 'gpt-4o'

export function OpenRouterGenerator({ type, onGenerated }: OpenRouterGeneratorProps) {
  const { lang, t } = useWorkspace()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState<OpenRouterModel>('gemma-4-27b-at')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const textModels: OpenRouterModel[] = [
    'gemma-4-27b-at',
    'gemma-4-27b', 
    'claude-3.5-sonnet',
    'gpt-4o'
  ]

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    setImageUrl(null)
    setVideoUrl(null)

    try {
      const resp = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          model: selectedModel,
          type
        })
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to generate')

      if (type === 'image' && data.imageUrl) {
        setImageUrl(data.imageUrl)
        onGenerated(data.imageUrl, data.model)
      } else if (type === 'video' && data.videoUrl) {
        setVideoUrl(data.videoUrl)
        onGenerated(data.videoUrl, data.model)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      alert(lang === 'ar' ? `خطأ في التوليد: ${msg}` : `Error: ${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/5 backdrop-blur-md">
      <h3 className="text-xs font-black tracking-widest text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2 uppercase">
        <Sparkles size={14} className="text-purple-400" />
        {lang === 'ar' ? 'توليد باستخدام OpenRouter' : 'Generate with OpenRouter'}
      </h3>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-2">
          {lang === 'ar' ? 'اختر النموذج' : 'Select Model'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {textModels.map(model => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                selectedModel === model 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-400' 
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-300'
              }`}
            >
              {model === 'gemma-4-27b-at' ? 'Gemma 4B (Ar)' : 
               model === 'gemma-4-27b' ? 'Gemma 4B' :
               model === 'claude-3.5-sonnet' ? 'Claude 3.5' : 'GPT-4o'}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          type === 'image' 
            ? lang === 'ar' ? 'وصف للصورة...' : 'Describe the image...'
            : lang === 'ar' ? 'وصف للفيديو...' : 'Describe the video...'
        }
        className="w-full h-24 bg-slate-50 dark:bg-slate-950/50 border border-black/10 dark:border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none mb-4"
      />

      {/* Generate Button */}
      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !prompt}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-black text-xs shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all uppercase disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? 
          <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" /> :
          <Wand2 size={16} />
        }
        {isGenerating ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating') : 'Generate'}
      </button>

      {/* Preview */}
      {(imageUrl || videoUrl) && (
        <div className="mt-6 animate-in fade-in zoom-in-95">
          <div className="aspect-video rounded-2xl overflow-hidden border border-black/10 dark:border-white/5 bg-slate-50 dark:bg-slate-950">
            {type === 'image' && imageUrl && (
              <img 
                src={imageUrl} 
                alt="Generated" 
                className="w-full h-full object-cover"
              />
            )}
            {type === 'video' && videoUrl && (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400">
              {lang === 'ar' ? 'تم التوليد بنجاح!' : 'Generated successfully!'}
            </span>
            <button 
              onClick={() => {
                if (imageUrl) {
                  const link = document.createElement('a')
                  link.href = imageUrl
                  link.download = `generated_image_${Date.now()}.jpg`
                  link.click()
                } else if (videoUrl) {
                  const link = document.createElement('a')
                  link.href = videoUrl
                  link.download = `generated_video_${Date.now()}.mp4`
                  link.click()
                }
              }}
              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}