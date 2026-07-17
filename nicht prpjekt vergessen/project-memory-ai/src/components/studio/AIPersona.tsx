'use client'

import React, { useState, useRef } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { Sparkles, Mic2, Play, Square, Download, Upload, RefreshCw, Image as ImageIcon, User, Bot, Camera, Settings } from 'lucide-react'

interface AvatarPreset {
  id: string
  name: string
  nameAr: string
  style: string
  preview: string
}

const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'prof1', name: 'Professional', nameAr: 'احترافي', style: 'realistic', preview: '👔' },
  { id: 'prof2', name: 'Casual', nameAr: 'عادي', style: 'realistic', preview: '👕' },
  { id: 'prof3', name: 'Anime', nameAr: 'أنمي', style: 'anime', preview: '🌸' },
  { id: 'prof4', name: 'Cyberpunk', nameAr: 'سايبربانك', style: 'futuristic', preview: '⚡' },
  { id: 'prof5', name: 'Cartoon', nameAr: 'كرتون', style: 'cartoon', preview: '🎨' },
  { id: 'prof6', name: 'Pixel Art', nameAr: 'بكسل', style: 'pixel', preview: '🟦' },
]

export function AIPersona() {
  const { lang } = useWorkspace()
  const [activePreset, setActivePreset] = useState('prof1')
  const [personaName, setPersonaName] = useState('')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [sampleText, setSampleText] = useState('')
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleGenerateAvatar = () => {
    if (!personaName) return
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 10000)
      const style = AVATAR_PRESETS.find(p => p.id === activePreset)?.style || 'realistic'
      setGeneratedUrl(`https://pollinations.ai/p/${encodeURIComponent(`${style} portrait of ${personaName}, ${description || 'friendly professional'}`)}?width=512&height=512&seed=${seed}&nologo=1`)
      setIsGenerating(false)
    }, 2500)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setVoiceBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playVoiceSample = () => {
    if (voiceBlob) {
      const url = URL.createObjectURL(voiceBlob)
      const audio = new Audio(url)
      audio.play()
    } else if (sampleText) {
      const utterance = new SpeechSynthesisUtterance(sampleText)
      utterance.lang = 'ar-SA'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
            <User size={28} className="text-pink-400" />
            {lang === 'ar' ? 'الشخصية الرقمية' : 'AI Persona'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'أنشئ Avatar رقمي يتحدث بصوتك' : 'Create a digital avatar that speaks with your voice'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Creator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presets */}
          <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
            <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'اختر النمط' : 'Choose Style'}</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {AVATAR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
                  className={`p-4 rounded-xl text-center border transition-all ${
                    activePreset === preset.id
                      ? 'bg-pink-500/20 border-pink-500/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{preset.preview}</div>
                  <p className="text-[10px] font-bold text-white">{lang === 'ar' ? preset.nameAr : preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
            <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'التفاصيل' : 'Details'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">{lang === 'ar' ? 'اسم الشخصية' : 'Persona Name'}</label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: محمد الذكي' : 'e.g. Smart Alex'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-pink-500/50 text-white placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">{lang === 'ar' ? 'وصف الشخصية' : 'Description'}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'ar' ? 'خبير تكنولوجيا، محب للابتكار، أسلوب ودود...' : 'Tech expert, innovative, friendly style...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-pink-500/50 text-white placeholder:text-slate-600 resize-none h-20"
                />
              </div>
              <button
                onClick={handleGenerateAvatar}
                disabled={!personaName || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {lang === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    {lang === 'ar' ? 'أنشئ الشخصية' : 'Create Persona'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Voice Training */}
          <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Mic2 size={16} className="text-pink-400" />
              {lang === 'ar' ? 'تدريب الصوت' : 'Voice Training'}
            </h3>
            <div className="space-y-3">
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder={lang === 'ar' ? 'اكتب نصاً تجريبياً للصوت...' : 'Enter sample text for voice...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-pink-500/50 text-white placeholder:text-slate-600 resize-none h-16"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isRecording) stopRecording()
                    else startRecording()
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isRecording ? <Square size={14} /> : <Mic2 size={14} />}
                  {isRecording ? (lang === 'ar' ? 'إيقاف' : 'Stop') : (lang === 'ar' ? 'تسجيل الصوت' : 'Record Voice')}
                </button>
                <button
                  onClick={playVoiceSample}
                  disabled={!sampleText && !voiceBlob}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Play size={14} />
                  {lang === 'ar' ? 'تشغيل' : 'Play'}
                </button>
                {voiceBlob && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                    <Upload size={14} />
                    {lang === 'ar' ? 'حفظ' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
            <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'معاينة' : 'Preview'}</h3>
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden relative group">
              {generatedUrl ? (
                <>
                  <img src={generatedUrl} alt="AI Persona" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                      <Play size={24} className="text-white" />
                    </button>
                    <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                      <Download size={24} className="text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Camera size={48} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-xs text-slate-600">{lang === 'ar' ? 'لم يتم إنشاء شخصية بعد' : 'No persona created yet'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Capabilities */}
          <div className="glass-card p-5 border border-white/10 rounded-xl bg-white/5">
            <h3 className="font-bold text-white mb-4">{lang === 'ar' ? 'القدرات' : 'Capabilities'}</h3>
            <div className="space-y-2">
              {[
                { icon: '🎤', ar: 'تحدث طبيعي بالعربية', en: 'Natural Arabic speech' },
                { icon: '🎬', ar: 'تعبيرات وجه ذكية', en: 'Smart facial expressions' },
                { icon: '🌐', ar: 'دعم 12 لغة', en: '12 languages supported' },
                { icon: '⚡', ar: 'استجابة فورية', en: 'Real-time response' },
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">{cap.icon}</span>
                  <span className="text-xs text-slate-300">{lang === 'ar' ? cap.ar : cap.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
