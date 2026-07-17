'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { Globe2, Languages, Play, Download, Sparkles, Mic2, Upload, Check, ChevronRight, Clock, Film } from 'lucide-react'

interface Language {
  code: string
  name: string
  nameAr: string
  flag: string
  speakers: string
}

const LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nameAr: 'العربية', flag: '🇸🇦', speakers: '420M' },
  { code: 'en', name: 'English', nameAr: 'الإنجليزية', flag: '🇬🇧', speakers: '1.5B' },
  { code: 'es', name: 'Spanish', nameAr: 'الإسبانية', flag: '🇪🇸', speakers: '560M' },
  { code: 'fr', name: 'French', nameAr: 'الفرنسية', flag: '🇫🇷', speakers: '320M' },
  { code: 'de', name: 'German', nameAr: 'الألمانية', flag: '🇩🇪', speakers: '130M' },
  { code: 'zh', name: 'Chinese', nameAr: 'الصينية', flag: '🇨🇳', speakers: '1.4B' },
  { code: 'ja', name: 'Japanese', nameAr: 'اليابانية', flag: '🇯🇵', speakers: '125M' },
  { code: 'ko', name: 'Korean', nameAr: 'الكورية', flag: '🇰🇷', speakers: '80M' },
  { code: 'hi', name: 'Hindi', nameAr: 'الهندية', flag: '🇮🇳', speakers: '600M' },
  { code: 'pt', name: 'Portuguese', nameAr: 'البرتغالية', flag: '🇧🇷', speakers: '260M' },
  { code: 'ru', name: 'Russian', nameAr: 'الروسية', flag: '🇷🇺', speakers: '150M' },
  { code: 'tr', name: 'Turkish', nameAr: 'التركية', flag: '🇹🇷', speakers: '90M' },
]

interface DubJob {
  id: string
  sourceLanguage: string
  targetLanguages: string[]
  videoTitle: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  duration: string
}

export function GlobalDubber() {
  const { lang } = useWorkspace()
  const [videoSource, setVideoSource] = useState<'upload' | 'url'>('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [sourceLang, setSourceLang] = useState('ar')
  const [targetLangs, setTargetLangs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useState<DubJob[]>([])

  const toggleTarget = (code: string) => {
    if (targetLangs.includes(code)) {
      setTargetLangs(targetLangs.filter(l => l !== code))
    } else {
      setTargetLangs([...targetLangs, code])
    }
  }

  const handleStartDub = () => {
    if (!videoUrl || targetLangs.length === 0) return
    setIsProcessing(true)
    
    const newJob: DubJob = {
      id: `dub-${Date.now()}`,
      sourceLanguage: sourceLang,
      targetLanguages: [...targetLangs],
      videoTitle: videoUrl.split('/').pop() || 'Video',
      status: 'processing',
      progress: 0,
      createdAt: new Date().toLocaleTimeString(),
      duration: '0:00',
    }
    
    setJobs(prev => [newJob, ...prev])
    
    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'completed', progress: 100, duration: '3:24' } : j))
        setIsProcessing(false)
      }
      setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, progress } : j))
    }, 1000)
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <Globe2 size={28} className="text-blue-400" />
            {lang === 'ar' ? 'المترجم العالمي' : 'Global Dubber'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'دبلجة الفيديو إلى لغات متعددة بصوت طبيعي' : 'Dub videos into multiple languages with natural voice'}
          </p>
        </div>
      </div>

      {/* Main Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 rounded-xl bg-white/5">
          <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'مصدر الفيديو' : 'Video Source'}</h3>
          
          <div className="flex gap-2 mb-4">
            {(['url', 'upload'] as const).map(type => (
              <button
                key={type}
                onClick={() => setVideoSource(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  videoSource === type
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                }`}
              >
                {type === 'url' ? (lang === 'ar' ? 'رابط فيديو' : 'Video URL') : (lang === 'ar' ? 'رفع ملف' : 'Upload File')}
              </button>
            ))}
          </div>

          {videoSource === 'url' ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-slate-600"
              />
            </div>
          ) : (
            <div className="h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500/40 transition-all group">
              <div className="text-center">
                <Upload size={24} className="mx-auto text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                <p className="text-xs text-slate-500">{lang === 'ar' ? 'اسحب الفيديو أو اضغط للرفع' : 'Drag video or click to upload'}</p>
              </div>
            </div>
          )}

          {/* Language Selection */}
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">{lang === 'ar' ? 'اللغة المصدر' : 'Source Language'}</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50"
                >
                  {LANGUAGES.filter(l => !targetLangs.includes(l.code)).map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {lang === 'ar' ? l.nameAr : l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">{lang === 'ar' ? 'اللغات المستهدفة' : 'Target Languages'}</label>
                <div className="text-xs text-slate-400 mt-3">{targetLangs.length} {lang === 'ar' ? 'لغة محددة' : 'selected'}</div>
              </div>
            </div>

            {/* Target Languages Grid */}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-auto">
              {LANGUAGES.filter(l => l.code !== sourceLang).map(l => (
                <button
                  key={l.code}
                  onClick={() => toggleTarget(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    targetLangs.includes(l.code)
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {targetLangs.includes(l.code) && <Check size={10} />}
                  {l.flag} {lang === 'ar' ? l.nameAr : l.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartDub}
            disabled={!videoUrl || targetLangs.length === 0 || isProcessing}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <Sparkles size={16} />
            )}
            {isProcessing
              ? (lang === 'ar' ? 'جاري الترجمة...' : 'Translating...')
              : (lang === 'ar' ? `ابدأ الدبلجة (${targetLangs.length} لغة)` : `Start Dubbing (${targetLangs.length} languages)`)}
          </button>
        </div>

        {/* Stats Panel */}
        <div className="glass-card p-6 border border-white/10 rounded-xl bg-white/5">
          <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'الإحصائيات' : 'Statistics'}</h3>
          <div className="space-y-4">
            {[
              { label: lang === 'ar' ? 'لغات مدعومة' : 'Supported Languages', value: LANGUAGES.length.toString(), icon: Languages },
              { label: lang === 'ar' ? 'فيديوهات مترجمة' : 'Dubbed Videos', value: '0', icon: Film },
              { label: lang === 'ar' ? 'ساعات مترجمة' : 'Hours Dubbed', value: '0', icon: Clock },
              { label: lang === 'ar' ? 'متوسط المدة' : 'Avg Duration', value: '~3:24', icon: Play },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <stat.icon size={14} className="text-blue-400" />
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <span className="text-white font-bold text-sm">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Queue */}
      {jobs.length > 0 && (
        <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
          <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'سجل الدبلجة' : 'Dub History'}</h3>
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-blue-400" />
                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{job.videoTitle}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    job.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                    job.status === 'failed' ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                    'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  }`}>
                    {job.status === 'completed' ? (lang === 'ar' ? 'مكتمل' : 'Completed') :
                     job.status === 'failed' ? (lang === 'ar' ? 'فشل' : 'Failed') :
                     (lang === 'ar' ? 'قيد المعالجة' : 'Processing')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span>{lang === 'ar' ? 'اللغات' : 'Languages'}: {job.targetLanguages.length}</span>
                  <span>{job.createdAt}</span>
                </div>
                {job.status === 'processing' && (
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                  </div>
                )}
                {job.status === 'completed' && (
                  <button className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-400 font-bold">
                    <Download size={10} /> {lang === 'ar' ? 'تحميل' : 'Download'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
