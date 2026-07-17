'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { 
  Clapperboard, 
  Image as ImageIcon, 
  FileText, 
  Mic2,
  Sparkles,
  Play,
  Download,
  Wand2,
  Globe2,
  User,
  Scissors
} from 'lucide-react'

import { GlobalDubber } from './GlobalDubber'
import { AIPersona } from './AIPersona'

type StudioTab = 'video' | 'thumbnail' | 'factory' | 'audio' | 'dubber' | 'persona'

type StudioHistoryItem = {
  id: number;
  type: 'video' | 'audio' | 'thumbnail' | 'text';
  prompt?: string;
  text?: string;
  content?: string;
  url?: string;
  contentType?: string;
  status?: string;
  createdAt: number;
}

const STORAGE_KEYS = {
  history: 'alking_studio_history',
  settings: 'alking_studio_settings'
}

function getStoredHistory(): StudioHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]')
  } catch { return [] }
}

function addToHistory(item: Partial<StudioHistoryItem>): void {
  if (typeof window === 'undefined') return
  const history = getStoredHistory()
  const newItem: StudioHistoryItem = {
    id: Date.now(),
    createdAt: Date.now(),
    type: item.type || 'text',
    prompt: item.prompt,
    text: item.text,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    status: item.status,
  }
  history.unshift(newItem)
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 50)))
}

function getThumbnailPresets(lang: string) {
  return [
    { id: 'none', label: lang === 'ar' ? 'بدون' : 'None', prompt: '' },
    { id: 'cinematic', label: lang === 'ar' ? 'سينمائي' : 'Cinematic', prompt: ' cinematic, highly detailed, 8k, professional lighting' },
    { id: 'cyberpunk', label: lang === 'ar' ? 'سايبر بانك' : 'Cyberpunk', prompt: ' cyberpunk style, neon lights, futuristic, vibrant' },
    { id: 'realistic', label: lang === 'ar' ? 'واقعي' : 'Realistic', prompt: ' photorealistic, realistic textures, raw photo' },
    { id: 'anime', label: lang === 'ar' ? 'أنمي' : 'Anime', prompt: ' high quality anime style, studio ghibli feel' },
    { id: '3d', label: '3D', prompt: ' 3D render, unreal engine 5, highly detailed' },
    { id: 'watercolor', label: lang === 'ar' ? 'رسم مائي' : 'Watercolor', prompt: ' watercolor painting, artistic, soft colors' }
  ]
}

export function ContentStudio() {
  const { t, lang } = useWorkspace()
  const [activeTab, setActiveTab] = useState<StudioTab>('video')
  const [showHistory, setShowHistory] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [studioHistory, setStudioHistory] = useState<StudioHistoryItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setStudioHistory(getStoredHistory())
  }, [])

  const showToast = (msg: string) => {
    setGlobalError(msg)
    setTimeout(() => setGlobalError(null), 3000)
  }

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-sm overflow-hidden relative">
      {/* Toast Notification */}
      {globalError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-slate-900 dark:text-white text-xs font-bold rounded-full shadow-2xl animate-in slide-in-from-top-4">
          {globalError}
        </div>
      )}
      {/* Sidebar - Studio Sub-tabs */}
       <div className="w-64 border-r border-black/10 dark:border-white/5 bg-slate-100 dark:bg-slate-900/30 p-4 flex flex-col gap-2 shrink-0">
        <div className="px-3 mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            {t('creative_suite')}
          </h2>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg border transition-all ${showHistory ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-black/10 dark:border-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
            title={t('history')}
          >
            <Sparkles size={14} />
          </button>
        </div>
        
        <StudioSidebarItem 
          active={activeTab === 'video'} 
          onClick={() => setActiveTab('video')} 
          icon={<Clapperboard size={18} />} 
          label={t('video')} 
          description={t('video_desc_sidebar')} 
        />
        <StudioSidebarItem 
          active={activeTab === 'thumbnail'} 
          onClick={() => setActiveTab('thumbnail')} 
          icon={<ImageIcon size={18} />} 
          label={t('thumbnail')} 
          description={t('thumbnail_desc_sidebar')} 
        />
        <StudioSidebarItem 
          active={activeTab === 'factory'} 
          onClick={() => setActiveTab('factory')} 
          icon={<FileText size={18} />} 
          label={t('factory')} 
          description={t('factory_desc_sidebar')} 
        />
        <StudioSidebarItem 
          active={activeTab === 'audio'} 
          onClick={() => setActiveTab('audio')} 
          icon={<Mic2 size={18} />} 
          label={t('audio')} 
          description={t('audio_desc_sidebar')} 
        />
        <StudioSidebarItem 
          active={activeTab === 'dubber'} 
          onClick={() => setActiveTab('dubber')} 
          icon={<Globe2 size={18} />} 
          label={t('dubber')} 
          description={lang === 'ar' ? 'دبلجة الفيديو للغات متعددة' : 'Dub videos to multiple languages'} 
        />
        <StudioSidebarItem 
          active={activeTab === 'persona'} 
          onClick={() => setActiveTab('persona')} 
          icon={<User size={18} />} 
          label={t('persona')} 
          description={lang === 'ar' ? 'إنشاء avatar يتكلم بصوتك' : 'Create avatar that speaks with your voice'} 
        />

        <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-black/10 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
              {t('upgrade_pro')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-3">
            {t('upgrade_desc')}
          </p>
          <button className="w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 text-[10px] font-bold rounded-lg transition-colors border border-black/10 dark:border-white/10 uppercase">
            {t('view_plans')}
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 overflow-auto relative flex flex-col">
        {/* Header Actions */}
        <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center justify-between px-8 bg-slate-50 dark:bg-slate-950/20 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              {t(activeTab)}
            </h1>
            <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase">
              {t('workspace_badge')}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => showToast(lang === 'ar' ? 'تم حفظ المسودة في السجل!' : 'Draft saved to history!')}
                className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-slate-700 dark:text-slate-300"
              >
               <Download size={14} /> {t('save_draft')}
             </button>
             <button 
                onClick={() => showToast(lang === 'ar' ? 'جاري تجهيز المشروع للتصدير...' : 'Preparing project for export...')}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-xs font-black shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all text-slate-900 dark:text-white"
              >
               <Wand2 size={14} /> {t('export')}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 pt-6">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'video' && <VideoEditorView />}
            {activeTab === 'thumbnail' && <ThumbnailView />}
            {activeTab === 'factory' && <FactoryView />}
            {activeTab === 'audio' && <AudioLabView />}
            {activeTab === 'dubber' && <GlobalDubber />}
            {activeTab === 'persona' && <AIPersona />}
          </div>
        </div>
      </div>

{/* History Side Panel */}
      {showHistory && isClient && (
        <div className="w-80 border-l border-black/10 dark:border-white/5 bg-slate-100 dark:bg-slate-900/40 backdrop-blur-md p-6 flex flex-col gap-4 animate-in slide-in-from-right-full duration-300">
           <h3 className="font-bold text-sm flex items-center gap-2">
             <Sparkles size={16} className="text-purple-400" />
             {t('history')}
           </h3>
           <div className="flex-1 overflow-auto space-y-4">
              {studioHistory.length > 0 ? (
                studioHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'video' ? 'bg-purple-500/20 text-purple-400' :
                        item.type === 'audio' ? 'bg-blue-500/20 text-blue-400' :
                        item.type === 'thumbnail' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{item.prompt || item.text || item.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 text-center py-12">
                   <p className="text-xs text-slate-500">{lang === 'ar' ? 'لا يوجد ملفات مولدة بعد' : 'No generated assets yet'}</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  )
}

interface StudioSidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface LayerItemProps {
  active?: boolean;
  label: string;
  type: 'video' | 'audio' | 'text';
}

interface FactoryCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  onClick: () => void;
  loading: boolean;
}

function StudioSidebarItem({ active, onClick, icon, label, description }: StudioSidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left
        ${active 
          ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white shadow-lg shadow-purple-500/5' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:bg-white/5 border border-transparent'
        }
      `}
    >
      <div className={`${active ? 'text-cyan-400' : 'text-slate-500'}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[10px] opacity-50">{description}</div>
      </div>
    </button>
  )
}

/* --- Sub-Views --- */

function VideoEditorView() {
  const { t, lang } = useWorkspace()
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [layerReady, setLayerReady] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

const handleGenerateScene = async () => {
    if (!prompt) return
    setIsGenerating(true)
    setError(null)
    
    try {
      const resp = await fetch('/api/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'video',
          prompt
        })
      })
      
      const data = await resp.json()
      
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate video')
      }
      
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setLayerReady(true)
        addToHistory({ type: 'video', prompt, url: data.videoUrl })
      } else if (data.status === 'processing') {
        setLayerReady(true)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      console.error('Video generation error:', e)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Smart API Status */}
      <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-bold text-purple-400">🔄 Smart API - Auto Failover Enabled</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Preview Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 aspect-video rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-black/10 dark:border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-[2rem]"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                <div className="z-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-black/10 dark:border-white/20 shadow-purple-500/20 shadow-2xl">
                    <Play className="text-slate-900 dark:text-white fill-white ml-1" size={32} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{t('ready_preview')}</p>
                </div>
              </>
            )}
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 overflow-auto pr-2 custom-scrollbar">
          <div className="p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/5 backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2 uppercase">
              <Sparkles size={14} className="text-purple-400" />
              {t('generate_scene')}
            </h3>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('scene_placeholder')}
              className="w-full h-24 bg-slate-50 dark:bg-slate-950/50 border border-black/10 dark:border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none mb-4"
            />
            <button 
              onClick={handleGenerateScene}
              disabled={isGenerating || !prompt}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-black text-xs shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all uppercase disabled:opacity-50"
            >
              {isGenerating ? (lang === 'ar' ? 'جاري التوليد...' : 'Generating') : t('generate')}
            </button>
          </div>

          <div className="p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/5 backdrop-blur-md">
            <h3 className="text-xs font-black tracking-widest text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2 uppercase">
              <Clapperboard size={14} className="text-cyan-400" />
              {t('layers')}
            </h3>
            <div className="space-y-2">
              <LayerItem active label={lang === 'ar' ? 'مشهد 1: المقدمة' : 'Scene 1: Intro'} type="video" />
              {layerReady && <LayerItem active label={lang === 'ar' ? 'مشهد 2: المولد' : 'Scene 2: Generated'} type="video" />}
              <LayerItem label={lang === 'ar' ? 'تعليق صوتي' : 'Voiceover'} type="audio" />
              <LayerItem label={lang === 'ar' ? 'نص توضيحي' : 'Subtitle'} type="text" />
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:border-black/10 dark:border-white/20 transition-all">
              + {t('add_layer')}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="h-48 bg-slate-100 dark:bg-slate-900/40 border border-black/10 dark:border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-inner relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-black/10 dark:border-white/5">
                <span className="text-purple-400">00:00:00</span>
                <span className="opacity-30">/</span>
                <span>00:00:10</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"><Play size={14} /></button>
              <button className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">{t('auto_sync')}</button>
           </div>
        </div>
        
        <div className="flex-1 relative bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-black/10 dark:border-white/5 overflow-hidden">
           {/* Timeline Tracks */}
           <div className="absolute inset-x-0 h-full p-2 space-y-2">
              <div className="h-8 w-1/3 bg-gradient-to-r from-purple-500/40 to-cyan-500/40 border border-black/10 dark:border-white/10 rounded-md relative group">
                 <div className="absolute inset-y-0 right-0 w-1 bg-black/5 dark:bg-white/20 cursor-ew-resize opacity-0 group-hover:opacity-100" />
              </div>
              <div className="h-8 w-1/2 bg-blue-500/20 border border-blue-500/30 rounded-md" />
           </div>
           {/* Playhead */}
           <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white shadow-[0_0_10px_white] z-10" />
        </div>
      </div>
    </div>
  )
}

function LayerItem({ active, label, type }: LayerItemProps) {
  const { lang } = useWorkspace()
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${active ? 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10' : 'border-transparent opacity-60'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${type === 'video' ? 'bg-purple-500' : type === 'audio' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {/* Simple icons for visibility/lock */}
         <div className="w-4 h-4 rounded bg-black/5 dark:bg-white/5" />
      </div>
    </div>
  )
}

function ThumbnailView() {
  const { lang, t } = useWorkspace()
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [activePreset, setActivePreset] = useState('none')
  const [gallery, setGallery] = useState<{url: string; prompt: string; provider: string}[]>([])

const presets = getThumbnailPresets(lang)

  const handleGenerate = async (): Promise<void> => {
    if (!prompt) return
    setLoading(true)
    setImageUrl('')
    
    try {
      const fullPrompt = prompt + (presets.find(p => p.id === activePreset)?.prompt || '')
      
      const resp = await fetch('/api/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'image',
          prompt: fullPrompt
        })
      })
      
      const data = await resp.json()
      
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image')
      }
      
if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        setGallery(prev => [{ url: data.imageUrl, prompt, provider: 'smart' }, ...prev].slice(0, 12))
        addToHistory({ type: 'thumbnail', prompt, url: data.imageUrl })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      alert(lang === 'ar' ? `خطأ: ${msg}` : `Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-100 dark:bg-slate-900/40 rounded-[3rem] border border-black/10 dark:border-white/10 p-10 backdrop-blur-xl shadow-2xl">
        
        {/* Smart API Status Banner */}
        <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-purple-400">
            🔄 Smart API - نظام ذكي مع تحويل تلقائي
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
             <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('thumbnail_placeholder')}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button 
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:bg-slate-700 text-slate-950 font-black rounded-xl transition-all flex items-center gap-2 text-xs uppercase"
              >
                {loading ? <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 animate-spin rounded-full" /> : <Wand2 size={16} />}
                {t('generate')}
              </button>
            </div>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex flex-wrap gap-3 mb-8">
           {presets.map(p => (
             <button
               key={p.id}
               onClick={() => setActivePreset(p.id)}
               className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                 ${activePreset === p.id 
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/5 text-slate-500 hover:border-black/10 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'}
               `}
             >
               {p.label}
             </button>
           ))}
        </div>

        <div className="aspect-video w-full rounded-3xl bg-slate-50 dark:bg-slate-950 border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden relative group shadow-inner">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Generated" className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button onClick={() => {
                  const link = document.createElement('a')
                  link.href = imageUrl
                  link.download = `image_${Date.now()}.jpg`
                  link.click()
                }} className="p-4 bg-white text-slate-950 rounded-2xl hover:scale-110 transition-transform shadow-xl">
                  <Download size={24} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center opacity-40">
              <ImageIcon size={64} className="text-slate-700 mx-auto mb-4" />
              <p className="text-sm font-bold tracking-widest uppercase">{t('waiting_creativity')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FactoryView() {
  const { lang, t } = useWorkspace()
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const generateContent = async (type: string): Promise<void> => {
    if (!topic) {
      alert(lang === 'ar' ? 'الرجاء إدخال الموضوع أولاً' : 'Please enter a topic first');
      return;
    }
    setLoading(true);
    setContent('');
    try {
      const resp = await fetch('/api/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: 'chat',
          prompt: topic,
          type
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || data.content || 'Failed to generate');
      setContent(data.content);
      addToHistory({ 
        type: 'text', 
        prompt: topic, 
        content: data.content, 
        contentType: type,
        status: data.provider || 'smart'
      })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setContent(lang === 'ar' ? `حدث خطأ: ${errorMessage}` : `Error: ${errorMessage}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('factory_topic_placeholder')}
            className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
          />
        </div>

        {/* Smart API Status Banner */}
        <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-purple-400">
            🔄 Smart API - نظام ذكي مع تحويل تلقائي
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FactoryCard 
            title={t('video_script')}
            icon={<Play size={20} />}
            color="from-red-500/20"
            desc={t('video_script_desc')}
            onClick={() => generateContent('script')}
            loading={loading}
          />
          <FactoryCard 
            title={t('seo_blog')}
            icon={<FileText size={20} />}
            color="from-blue-500/20"
            desc={t('seo_blog_desc')}
            onClick={() => generateContent('blog')}
            loading={loading}
          />
          <FactoryCard 
            title={t('viral_ideas')}
            icon={<Sparkles size={20} />}
            color="from-amber-500/20"
            desc={t('viral_ideas_desc')}
            onClick={() => generateContent('ideas')}
            loading={loading}
          />
        </div>

        {content && (
          <div className="mt-8 p-10 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900/40 border border-black/10 dark:border-white/5 backdrop-blur-xl animate-in fade-in zoom-in-95 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">{t('generated_result')}</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 rounded-xl text-[10px] font-bold text-cyan-400 border border-black/10 dark:border-white/5 transition-all"
              >
                {t('copy_text')}
              </button>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl border border-black/10 dark:border-white/5">
              {content}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FactoryCard({ title, icon, color, desc, onClick, loading }: FactoryCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[2rem] bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/5 hover:border-black/10 dark:border-white/20 transition-all cursor-pointer group bg-gradient-to-br ${color} to-transparent
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {loading && <div className="w-4 h-4 border-2 border-black/10 dark:border-white/20 border-t-white animate-spin rounded-full" />}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function AudioLabView() {
  const { lang, t } = useWorkspace()
  const [text, setText] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{url: string, text: string, voiceName: string, timestamp: number, provider: string}[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousAudioRef = useRef<string>('')

  // Cleanup URLs to prevent memory leak
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      history.forEach(item => URL.revokeObjectURL(item.url))
    }
  }, [])

  // Cleanup previous audio when new one is created
  useEffect(() => {
    if (previousAudioRef.current && previousAudioRef.current !== audioUrl) {
      URL.revokeObjectURL(previousAudioRef.current)
    }
    previousAudioRef.current = audioUrl
  }, [audioUrl])

    const voices = [
    { id: 'arabic', icon: '🕌', labelEn: 'Arabic', descEn: 'Arabic TTS', labelAr: 'عربي', descAr: 'تحويل نص لعربي', color: 'from-green-500/20' },
    { id: 'english', icon: '🇬🇧', labelEn: 'English', descEn: 'English TTS', labelAr: 'إنجليزي', descAr: 'تحويل نص لإنجليزي', color: 'from-blue-500/20' },
    { id: 'male', icon: '👨', labelEn: 'Male', descEn: 'Male Voice', labelAr: 'ذكر', descAr: 'صوت ذكر', color: 'from-cyan-500/20' },
    { id: 'female', icon: '👩', labelEn: 'Female', descEn: 'Female Voice', labelAr: 'أنثى', descAr: 'صوت أنثى', color: 'from-pink-500/20' }
  ]

  const [selectedVoice, setSelectedVoice] = useState('arabic')

  const generateAudio = async () => {
    if (!text) return;
    setLoading(true)
    setAudioUrl('')
    try {
      const resp = await fetch('/api/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'tts',
          prompt: text
        })
      })
      
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || `Server error: ${resp.status}`)
      }
      
      const data = await resp.json()
      
      if (data.audioData) {
        // Legacy: server returned base64 audio directly
        const url = `data:audio/mpeg;base64,${data.audioData}`
        setAudioUrl(url)
        setHistory(prev => [{ 
          url, 
          text: text.substring(0, 50) + '...', 
          voiceName: data.provider || 'Smart TTS', 
          timestamp: Date.now(),
          provider: data.provider
        }, ...prev].slice(0, 10))
      } else if (data.useWebSpeech && data.content) {
        // New: use Web Speech API for TTS
        const utterance = new SpeechSynthesisUtterance(data.content)
        utterance.lang = selectedVoice === 'arabic' ? 'ar-SA' : 'en-US'
        utterance.rate = 0.9
        utterance.pitch = 1.0
        
        // Select voice based on preference
        const voices = window.speechSynthesis.getVoices()
        if (selectedVoice === 'arabic') {
          const arabicVoice = voices.find(v => v.lang.startsWith('ar'))
          if (arabicVoice) utterance.voice = arabicVoice
        } else if (selectedVoice === 'female') {
          const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira'))
          if (femaleVoice) utterance.voice = femaleVoice
        } else if (selectedVoice === 'male') {
          const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David'))
          if (maleVoice) utterance.voice = maleVoice
        }
        
        // Create a temporary blob URL for history tracking
        const blob = new Blob([data.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        utterance.onend = () => {
          URL.revokeObjectURL(url)
        }
        
        window.speechSynthesis.speak(utterance)
        
        setAudioUrl(url)
        setHistory(prev => [{ 
          url, 
          text: text.substring(0, 50) + '...', 
          voiceName: (lang === 'ar' ? 'تحدث آلي' : 'Web Speech') + ' - ' + (data.provider || 'AI'), 
          timestamp: Date.now(),
          provider: data.provider || 'webspeech'
        }, ...prev].slice(0, 10))
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        // Fallback: use browser Web Speech API directly with original text
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = selectedVoice === 'arabic' ? 'ar-SA' : 'en-US'
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
        
        // Create a minimal placeholder URL for consistency
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setHistory(prev => [{ 
          url, 
          text: text.substring(0, 50) + '...', 
          voiceName: lang === 'ar' ? 'المتصفح' : 'Browser TTS', 
          timestamp: Date.now(),
          provider: 'browser'
        }, ...prev].slice(0, 10))
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      alert((lang === 'ar' ? 'خطأ في التوليد: ' : 'Error: ') + errorMessage)
      console.error('Audio generation error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const charCount = text.length;
  const estimatedSeconds = Math.ceil(charCount / 15);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Settings & Voices (1/3) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h3 className="text-xs font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase mb-6 flex items-center gap-2">
              <Mic2 size={16} className="text-purple-400" />
              {t('voice_talent')}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {voices.map(v => (
                <button 
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`relative p-4 rounded-3xl transition-all duration-500 overflow-hidden text-left flex flex-col gap-2 items-center text-center
                    ${selectedVoice === v.id 
                      ? 'bg-black/5 dark:bg-white/10 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] scale-105 z-10' 
                      : 'bg-white/[0.02] hover:bg-white/[0.05] grayscale-[50%] hover:grayscale-0'
                    }`}
                >
                  {selectedVoice === v.id && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${v.color} opacity-40`} />
                  )}
                  {selectedVoice === v.id && (
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-3xl" />
                  )}
                  <span className="text-3xl relative z-10 drop-shadow-lg">{v.icon}</span>
                  <div className="relative z-10">
                    <div className="text-[11px] font-black text-slate-800 dark:text-slate-200">{lang === 'ar' ? v.labelAr : v.labelEn}</div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-1">{lang === 'ar' ? v.descAr : v.descEn}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editor & Player (2/3) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-cyan-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="h-full bg-slate-50 dark:bg-slate-950/80 backdrop-blur-3xl rounded-[2.3rem] p-8 relative flex flex-col shadow-inner">
              
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('audio_placeholder')}
                className="flex-1 w-full bg-transparent text-slate-800 dark:text-slate-200 text-lg leading-relaxed focus:outline-none resize-none placeholder:text-slate-700 font-medium tracking-wide custom-scrollbar min-h-[250px]"
              />

              <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                <div className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-widest ${charCount > 2500 ? 'text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                   <div className="flex flex-col gap-1">
                      <span>{lang === 'ar' ? 'حجم النص' : 'Text Size'}</span>
                      <span className={charCount > 2500 ? 'animate-pulse' : 'text-slate-800 dark:text-slate-200'}>{charCount} / 2500</span>
                   </div>
                   <div className="w-px h-8 bg-black/5 dark:bg-white/10" />
                   <div className="flex flex-col gap-1">
                      <span>{lang === 'ar' ? 'الزمن المقدر' : 'Est. Time'}</span>
                      <span className="text-cyan-400">~{estimatedSeconds}s</span>
                   </div>
                </div>
                
                <button 
                  onClick={generateAudio}
                  disabled={loading || !text || charCount > 2500}
                  className="relative group/btn overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 opacity-80 group-hover/btn:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 blur-xl opacity-0 group-hover/btn:opacity-60 transition-opacity" />
                  <div className="relative px-8 py-4 flex items-center gap-3 font-black text-sm text-slate-900 dark:text-white uppercase tracking-widest">
                    {loading ? <div className="w-5 h-5 border-2 border-black/10 dark:border-white/20 border-t-white animate-spin rounded-full" /> : <Sparkles size={18} />}
                    {loading ? t('generating') : t('generate_voice')}
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* Active Audio Player Showcase */}
          {audioUrl && (
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl flex items-center gap-6 animate-in slide-in-from-bottom-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
              <button 
                onClick={() => { const audio = new Audio(audioUrl); audio.play(); }} 
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-0.5 group shrink-0 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"
              >
                 <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center group-hover:bg-transparent transition-colors">
                    <Play size={24} className="text-slate-900 dark:text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
                 </div>
              </button>
              <div className="flex-1">
                 <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest mb-2">{lang === 'ar' ? 'صوت عالي الدقة جاهز' : 'HD Audio Ready'}</h4>
                 {/* Styled range to overlap native audio controls slightly, giving a customized feel */}
                 <audio src={audioUrl} controls controlsList="nodownload" className="w-full h-10 accent-cyan-500 outline-none" />
              </div>
              <a 
                href={audioUrl} 
                download={`AlKing_Audio_${Date.now()}.mp3`}
                className="px-6 py-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all border border-black/10 dark:border-white/10 hover:border-black/10 dark:border-white/20"
              >
                <Download size={18} /> {lang === 'ar' ? 'حفظ MP3' : 'Save'}
              </a>
            </div>
          )}
        </div>
      </div>

       {/* Session History Grid */}
       {history.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-6 pt-10">
            <h3 className="text-sm font-black tracking-widest text-slate-700 dark:text-slate-300 uppercase flex items-center gap-3">
               <div className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-500" />
               {lang === 'ar' ? 'مكتبة المقاطع للمقارنة' : 'Session Library'}
               <div className="flex-1 h-px bg-gradient-to-r from-cyan-500 to-transparent opacity-20" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-black/10 dark:border-white/5 hover:bg-white/[0.03] hover:border-black/10 dark:border-white/10 transition-all flex items-center gap-4 group">
                   <button onClick={() => {
                      const audio = new Audio(item.url);
                      audio.play();
                   }} className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 hover:bg-cyan-500 hover:text-slate-950 transition-colors text-slate-700 dark:text-slate-300 shadow-inner">
                     <Play size={18} className="ml-1 fill-current" />
                   </button>
                   <div className="flex-1 min-w-0">
                     <div className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1">{item.voiceName}</div>
                     <div className="text-[10px] text-slate-500 truncate leading-relaxed">{item.text}</div>
                   </div>
                   <a href={item.url} download={`Audio_v${idx}.mp3`} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/10 transition-colors">
                     <Download size={14} />
                   </a>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

