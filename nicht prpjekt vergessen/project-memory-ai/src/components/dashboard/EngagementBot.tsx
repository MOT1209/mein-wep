'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { MessageCircle, Heart, Reply, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Send, Bot, RefreshCw, Share2, Filter } from 'lucide-react'

interface Comment {
  id: string
  username: string
  avatar: string
  text: string
  platform: 'youtube' | 'tiktok' | 'instagram'
  likes: number
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
  replied: boolean
  replyText?: string
}

const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', username: 'Mohamed_AI', avatar: '🤖', text: 'فيديو رائع! ممكن شرح أعمق عن الموضوع؟', platform: 'youtube', likes: 234, timestamp: '2m ago', sentiment: 'positive', replied: false },
  { id: 'c2', username: 'TechGirl99', avatar: '👩‍💻', text: 'والله استفدت كثير شكراً لك 👍', platform: 'youtube', likes: 89, timestamp: '5m ago', sentiment: 'positive', replied: false },
  { id: 'c3', username: 'X_User_22', avatar: '❌', text: 'هذا الكلام غلط! المصادر غير موثوقة', platform: 'tiktok', likes: 45, timestamp: '8m ago', sentiment: 'negative', replied: false },
  { id: 'c4', username: 'ContentKing', avatar: '👑', text: 'متى بينزل الجزء الثاني؟ 🔥', platform: 'instagram', likes: 567, timestamp: '12m ago', sentiment: 'positive', replied: true, replyText: 'قريباً جداً! اشترك بالقناة 🔔' },
  { id: 'c5', username: 'Sarah_Dev', avatar: '💻', text: 'ممتاز! أضفت القناة للمفضلة ⭐', platform: 'youtube', likes: 123, timestamp: '15m ago', sentiment: 'positive', replied: false },
  { id: 'c6', username: 'CriticalEye', avatar: '🔍', text: 'المعلومة ناقصة، أتمنى التدقيق أكثر', platform: 'youtube', likes: 34, timestamp: '20m ago', sentiment: 'neutral', replied: false },
  { id: 'c7', username: 'Viral_taker', avatar: '🚀', text: 'هذا المحتوى يستحق الانتشار!', platform: 'tiktok', likes: 890, timestamp: '25m ago', sentiment: 'positive', replied: false },
  { id: 'c8', username: 'FrustratedFan', avatar: '😤', text: 'ممل نفس المحتوى كل مرة', platform: 'instagram', likes: 12, timestamp: '30m ago', sentiment: 'negative', replied: false },
]

const REPLY_SUGGESTIONS = [
  { ar: 'شكراً جزيلاً لدعمك! ❤️', en: 'Thank you for your support! ❤️' },
  { ar: 'ممتاز! شكراً على الملاحظة، سنأخذها بعين الاعتبار', en: 'Great point! We\'ll look into it' },
  { ar: 'قريباً جداً! تابعنا عشان أول ما ينزل 🔔', en: 'Coming soon! Stay tuned 🔔' },
  { ar: 'نقدر رأيك! شو اقتراحك عشان نطور؟ 💡', en: 'We appreciate your feedback! Any suggestions? 💡' },
]

const PLATFORM_BADGES: Record<string, string> = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

export function EngagementBot() {
  const { t, lang } = useWorkspace()
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [activeReply, setActiveReply] = useState<string | null>(null)
  const [customReply, setCustomReply] = useState('')
  const [autoMode, setAutoMode] = useState(false)
  const [filterSentiment, setFilterSentiment] = useState<string>('all')
  const [stats, setStats] = useState({ autoReplies: 0, pending: MOCK_COMMENTS.filter(c => !c.replied).length })

  const filteredComments = comments.filter(c => {
    if (filterSentiment === 'all') return true
    return c.sentiment === filterSentiment
  })

  const handleAutoReply = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    const suggestion = REPLY_SUGGESTIONS[Math.floor(Math.random() * REPLY_SUGGESTIONS.length)]
    const replyText = lang === 'ar' ? suggestion.ar : suggestion.en

    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replied: true, replyText } : c
    ))
    setStats(prev => ({ ...prev, autoReplies: prev.autoReplies + 1, pending: prev.pending - 1 }))
    setActiveReply(null)
  }

  const handleCustomReply = (commentId: string) => {
    if (!customReply.trim()) return
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replied: true, replyText: customReply } : c
    ))
    setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
    setCustomReply('')
    setActiveReply(null)
  }

  const handleAutoModeToggle = () => {
    setAutoMode(!autoMode)
    if (!autoMode) {
      // Auto-reply all pending positive comments
      let replyCount = 0
      setComments(prev => prev.map(c => {
        if (!c.replied && c.sentiment === 'positive') {
          const suggestion = REPLY_SUGGESTIONS[Math.floor(Math.random() * REPLY_SUGGESTIONS.length)]
          replyCount++
          return {
            ...c,
            replied: true,
            replyText: lang === 'ar' ? suggestion.ar : suggestion.en,
          }
        }
        return c
      }))
      setStats(prev => ({ ...prev, autoReplies: prev.autoReplies + replyCount, pending: prev.pending - replyCount }))
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp size={12} className="text-emerald-400" />
      case 'negative': return <ThumbsDown size={12} className="text-red-400" />
      case 'neutral': return <AlertCircle size={12} className="text-yellow-400" />
    }
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <Bot size={28} className="text-pink-400" />
            {lang === 'ar' ? 'بوت التفاعل الذكي' : 'Engagement Bot'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'ردود ذكية على التعليقات لزيادة التفاعل' : 'Smart replies to boost engagement'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <Bot size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-slate-400">{stats.autoReplies} {lang === 'ar' ? 'رد تلقائي' : 'auto-replies'}</span>
          </div>
          <button
            onClick={handleAutoModeToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              autoMode
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw size={14} className={autoMode ? 'animate-spin' : ''} />
            {lang === 'ar' ? 'الرد التلقائي' : 'Auto Mode'} {autoMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: lang === 'ar' ? 'إجمالي التعليقات' : 'Total Comments', value: comments.length.toString(), icon: MessageCircle, color: 'pink' },
          { label: lang === 'ar' ? 'بانتظار الرد' : 'Pending Replies', value: stats.pending.toString(), icon: Reply, color: 'orange' },
          { label: lang === 'ar' ? 'تم الرد' : 'Replied', value: comments.filter(c => c.replied).length.toString(), icon: Heart, color: 'green' },
          { label: lang === 'ar' ? 'إيجابي' : 'Positive', value: comments.filter(c => c.sentiment === 'positive').length.toString(), icon: ThumbsUp, color: 'cyan' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">{stat.label}</p>
                <p className="text-2xl font-black mt-1 text-white">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-600/10 border border-pink-500/30">
                <stat.icon size={20} className="text-pink-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-slate-500" />
        {['all', 'positive', 'neutral', 'negative'].map(f => (
          <button
            key={f}
            onClick={() => setFilterSentiment(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              filterSentiment === f
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
            }`}
          >
            {f === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : f}
          </button>
        ))}
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {filteredComments.map(comment => (
          <div
            key={comment.id}
            className={`glass-card p-4 border rounded-xl bg-white/5 transition-all ${
              comment.replied ? 'border-emerald-500/20 opacity-70' : 'border-white/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-lg shrink-0 border border-white/10">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{comment.username}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PLATFORM_BADGES[comment.platform]}`}>
                    {comment.platform}
                  </span>
                  <span className="text-[9px] text-slate-600">{comment.timestamp}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                    {getSentimentIcon(comment.sentiment)}
                    <span className="capitalize text-[10px]">{comment.sentiment}</span>
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{comment.text}</p>

                {comment.replied && comment.replyText && (
                  <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">{lang === 'ar' ? 'الرد' : 'Reply'}</span>
                    </div>
                    <p className="text-emerald-200 text-xs">{comment.replyText}</p>
                  </div>
                )}

                {!comment.replied && (
                  <div className="mt-3">
                    {activeReply === comment.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          {REPLY_SUGGESTIONS.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setCustomReply(lang === 'ar' ? s.ar : s.en)
                                handleAutoReply(comment.id)
                              }}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                              {lang === 'ar' ? s.ar.substring(0, 25) + '...' : s.en.substring(0, 25) + '...'}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customReply}
                            onChange={(e) => setCustomReply(e.target.value)}
                            placeholder={lang === 'ar' ? 'اكتب رد مخصص...' : 'Write a custom reply...'}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500/50 text-white placeholder:text-slate-600"
                          />
                          <button
                            onClick={() => handleCustomReply(comment.id)}
                            className="px-3 py-2 bg-pink-500 rounded-lg text-xs font-bold hover:bg-pink-600 transition-all"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActiveReply(comment.id); handleAutoReply(comment.id) }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Sparkles size={10} className="text-pink-400" />
                          {lang === 'ar' ? 'رد ذكي' : 'Smart Reply'}
                        </button>
                        <button
                          onClick={() => setActiveReply(comment.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Reply size={10} />
                          {lang === 'ar' ? 'رد مخصص' : 'Custom Reply'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 text-slate-600 text-xs">
                  <span className="flex items-center gap-1"><Heart size={11} /> {comment.likes}</span>
                  <button className="hover:text-white transition-colors"><Share2 size={11} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
