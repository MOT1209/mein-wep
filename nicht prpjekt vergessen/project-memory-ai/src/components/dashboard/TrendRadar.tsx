'use client'

import React, { useState, useEffect } from 'react'
import { useWorkspace } from '@/store/workspace-store'
import { TrendingUp, TrendingDown, Sparkles, Clock, Eye, MessageCircle, ArrowUpRight, RefreshCw, Search, Zap } from 'lucide-react'

interface TrendItem {
  id: string
  topic: string
  platform: 'youtube' | 'tiktok' | 'twitter' | 'general'
  volume: number
  growth: number
  momentum: 'rising' | 'falling' | 'stable'
  category: string
  description: string
  relatedTopics: string[]
}

const MOCK_TRENDS: TrendItem[] = [
  { id: '1', topic: 'الذكاء الاصطناعي في التعليم', platform: 'youtube', volume: 1250000, growth: 89, momentum: 'rising', category: 'تكنولوجيا', description: 'اتجاه متصاعد لمحتوى تعليمي يعتمد على الذكاء الاصطناعي', relatedTopics: ['AI tools', 'ChatGPT在教育', 'AI teachers'] },
  { id: '2', topic: 'تحديات اللياقة 30 يوم', platform: 'tiktok', volume: 3400000, growth: 156, momentum: 'rising', category: 'رياضة', description: 'تحديات رياضية مدتها 30 يوم تحقق مشاهدات خيالية', relatedTopics: ['30 day challenge', 'fitness transformation', 'home workout'] },
  { id: '3', topic: 'مراجعات السيارات الكهربائية', platform: 'youtube', volume: 890000, growth: 45, momentum: 'rising', category: 'سيارات', description: 'ارتفاع في البحث عن مراجعات السيارات الكهربائية 2025', relatedTopics: ['EV review', 'Tesla', 'BYD'] },
  { id: '4', topic: 'وصفات الطبخ السريع', platform: 'tiktok', volume: 2100000, growth: -12, momentum: 'falling', category: 'طبخ', description: 'انخفاض طفيف مع استمرار الطلب على الوصفات السريعة', relatedTopics: ['quick recipes', 'meal prep', 'easy cooking'] },
  { id: '5', topic: 'السفر الرقمي (Digital Nomad)', platform: 'twitter', volume: 670000, growth: 34, momentum: 'rising', category: 'سفر', description: 'نقاشات متزايدة حول العمل عن بعد والسفر', relatedTopics: ['digital nomad', 'remote work', 'travel tips'] },
  { id: '6', topic: 'أخبار الميتافيرس', platform: 'general', volume: 430000, growth: 23, momentum: 'stable', category: 'تكنولوجيا', description: 'استقرار في الاهتمام بالميتافيرس مع تطورات جديدة', relatedTopics: ['metaverse', 'VR', 'AR'] },
  { id: '7', topic: 'تطبيقات الذكاء الاصطناعي للمونتاج', platform: 'youtube', volume: 980000, growth: 201, momentum: 'rising', category: 'تكنولوجيا', description: 'أدوات AI لتحرير الفيديو تقلب الصناعة - انفجار هائل', relatedTopics: ['AI video editing', 'Runway ML', 'CapCut AI'] },
  { id: '8', topic: 'الأزياء المستدامة', platform: 'tiktok', volume: 560000, growth: 18, momentum: 'rising', category: 'موضة', description: 'زيادة الوعي بالموضة المستدامة وإعادة التدوير', relatedTopics: ['sustainable fashion', 'thrift flip', 'ecofriendly'] },
]

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  twitter: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  general: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export function TrendRadar() {
  const { t, lang } = useWorkspace()
  const [trends, setTrends] = useState<TrendItem[]>(MOCK_TRENDS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null)

  const categories = ['all', ...new Set(trends.map(t => t.category))]

  const filteredTrends = trends.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false
    if (searchQuery && !t.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => b.volume - a.volume)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // Shuffle growth rates to simulate live update
      setTrends(prev => prev.map(t => ({
        ...t,
        growth: t.growth + Math.floor(Math.random() * 20 - 10),
        volume: t.volume + Math.floor(Math.random() * 100000 - 50000),
      })))
      setIsRefreshing(false)
    }, 1500)
  }

  const getVolumeLabel = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
    return v.toString()
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-wide bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent flex items-center gap-3">
            <Zap size={28} className="text-orange-400" />
            {lang === 'ar' ? 'رادار الترندات' : 'Trend Radar'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'ar' ? 'اكتشف الترندات قبل صعودها وكن أول من يصنع المحتوى' : 'Discover trends before they peak'}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {lang === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: lang === 'ar' ? 'إجمالي الترندات' : 'Total Trends', value: trends.length.toString(), icon: TrendingUp, color: 'orange' },
          { label: lang === 'ar' ? 'ترندات صاعدة' : 'Rising Trends', value: trends.filter(t => t.momentum === 'rising').length.toString(), icon: ArrowUpRight, color: 'green' },
          { label: lang === 'ar' ? 'أعلى حجم' : 'Highest Volume', value: getVolumeLabel(Math.max(...trends.map(t => t.volume))), icon: Eye, color: 'cyan' },
          { label: lang === 'ar' ? 'متوسط النمو' : 'Avg Growth', value: `${Math.round(trends.reduce((a, t) => a + t.growth, 0) / trends.length)}%`, icon: Sparkles, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">{stat.label}</p>
                <p className="text-2xl font-black mt-1 text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/10 border border-${stat.color}-500/30`}>
                <stat.icon size={20} className={`text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في الترندات...' : 'Search trends...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-orange-500/50 text-white placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
              }`}
            >
              {cat === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrends.map((trend, i) => (
          <div
            key={trend.id}
            onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
            className={`glass-card p-5 border rounded-xl transition-all cursor-pointer ${
              selectedTrend?.id === trend.id
                ? 'border-orange-500/50 bg-orange-500/5'
                : 'border-white/5 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[trend.platform]}`}>
                  {trend.platform}
                </span>
                <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-white/5 rounded-full">
                  {trend.category}
                </span>
                {i === 0 && (
                  <span className="text-[10px] text-yellow-400 px-2 py-0.5 bg-yellow-500/10 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> HOT
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${
                trend.momentum === 'rising' ? 'text-emerald-400' :
                trend.momentum === 'falling' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {trend.momentum === 'rising' ? <TrendingUp size={14} /> :
                 trend.momentum === 'falling' ? <TrendingDown size={14} /> :
                 <Clock size={14} />}
                {trend.growth > 0 ? '+' : ''}{trend.growth}%
              </div>
            </div>

            <h3 className="text-white font-bold text-base mb-2">{trend.topic}</h3>
            <p className="text-slate-400 text-xs mb-3 line-clamp-2">{trend.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Eye size={12} />
                <span className="font-bold">{getVolumeLabel(trend.volume)}</span>
                <MessageCircle size={12} className="ml-1" />
                <span>{getVolumeLabel(Math.round(trend.volume * 0.1))}</span>
              </div>
              <button className="text-[10px] text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
                {lang === 'ar' ? 'تحليل' : 'Analyze'} <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Expanded Details */}
            {selectedTrend?.id === trend.id && (
              <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">
                  {lang === 'ar' ? 'مواضيع ذات صلة' : 'Related Topics'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {trend.relatedTopics.map((rt, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300">
                      #{rt}
                    </span>
                  ))}
                </div>
                <button className="mt-3 w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-xs font-bold">
                  {lang === 'ar' ? 'توليد محتوى عن هذا الترند' : 'Generate Content for This Trend'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
